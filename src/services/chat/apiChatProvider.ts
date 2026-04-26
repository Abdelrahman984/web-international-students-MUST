import { apiClient } from "../api";
import { getStoredUserId } from "../../utils/storageUtils";
import type {
  ChatMessage,
  ChatConversation,
  ChatConversationListResponse,
  ChatCreateConversationPayload,
  ChatMarkReadPayload,
  ChatParticipant,
  ChatMessageListResponse,
  ChatProvider,
  ChatProviderCurrentUser,
  ChatSendMessagePayload,
} from "./types";

// Backend response types
interface BackendChatConversation {
  id: number;
  createdAt: string;
  participants: Array<{ id: number; conversationId: number; userId: string }>;
  lastMessage?: {
    id: number;
    senderId: string | null;
    content: string;
    timestamp: string;
  } | null;
}

interface BackendChatMessage {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  timestamp: string;
}

interface BackendChatUserResult {
  id: string;
  name: string | null;
  email: string | null;
}

interface AdvisorProfile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
}

const assertConfigured = (currentUser?: ChatProviderCurrentUser) => {
  const userId = currentUser?.id?.toString().trim() || getStoredUserId();

  if (!userId) {
    throw new Error("You must be signed in to use chat.");
  }
};

const toCurrentUserParticipant = (
  currentUser: ChatProviderCurrentUser,
): ChatParticipant => ({
  id: currentUser.id,
  displayName: currentUser.displayName || "You",
  avatarUrl: currentUser.avatarUrl,
  role: currentUser.role === "admin" ? "admin" : "user",
});

async function mapBackendConversation(
  conv: BackendChatConversation,
  currentUser: ChatProviderCurrentUser,
): Promise<ChatConversation> {
  // Find the advisor participant (not the current user)
  const advisorUserId = conv.participants.find(
    (p) => p.userId !== currentUser.id,
  )?.userId;

  let advisorParticipant: ChatParticipant = {
    id: advisorUserId || "unknown",
    displayName: "Advisor",
    avatarUrl: null,
    role: "admin",
  };

  // Try to fetch advisor details from profile endpoint
  if (advisorUserId) {
    try {
      const res = await apiClient.get(`/api/advisor_profiles`);
      const advisors = (res.data?.data ||
        res.data?.items ||
        res.data ||
        []) as AdvisorProfile[];
      const advisor = advisors.find((a) => a.id === advisorUserId);
      if (advisor) {
        advisorParticipant = {
          id: advisor.id,
          displayName: advisor.full_name?.trim() || advisor.email,
          avatarUrl: advisor.avatar_url,
          role: "admin",
        };
      }
    } catch {
      // Graceful degradation
    }
  }

  return {
    id: String(conv.id),
    title: `Chat with ${advisorParticipant.displayName}`,
    participants: [toCurrentUserParticipant(currentUser), advisorParticipant],
    lastMessage: conv.lastMessage
      ? {
          id: String(conv.lastMessage.id),
          text: conv.lastMessage.content,
          senderId: conv.lastMessage.senderId || "",
          createdAt: conv.lastMessage.timestamp,
        }
      : null,
    unreadCount: 0,
    updatedAt: conv.createdAt,
  };
}

function mapBackendMessage(
  msg: BackendChatMessage,
  currentUser: ChatProviderCurrentUser,
  advisorParticipant: ChatParticipant,
): ChatMessage {
  const isFromAdmin = msg.senderId !== currentUser.id;

  return {
    id: String(msg.id),
    conversationId: String(msg.conversationId),
    senderType: isFromAdmin ? "admin" : "user",
    text: msg.content,
    sender: isFromAdmin
      ? advisorParticipant
      : {
          id: currentUser.id,
          displayName: currentUser.displayName || "You",
          avatarUrl: currentUser.avatarUrl,
          role: "user",
        },
    status: "sent",
    createdAt: msg.timestamp,
    clientMessageId: null,
  };
}

export function createApiChatProvider(
  currentUser?: ChatProviderCurrentUser,
): ChatProvider {
  return {
    async listConversations(
      page = 1,
      pageSize = 20,
    ): Promise<ChatConversationListResponse> {
      assertConfigured(currentUser);

      const userId = currentUser?.id || getStoredUserId();
      if (!userId) {
        throw new Error("User ID is required to load conversations.");
      }

      try {
        const response = await apiClient.get<BackendChatConversation[]>(
          `/api/chat/user/${userId}`,
        );
        const conversations = Array.isArray(response.data) ? response.data : [];

        const mapped: ChatConversation[] = [];
        for (const conv of conversations) {
          mapped.push(await mapBackendConversation(conv, currentUser!));
        }

        return {
          data: mapped,
          meta: {
            pagination: {
              page,
              pageSize,
              total: mapped.length,
              pageCount: Math.max(1, Math.ceil(mapped.length / pageSize)),
            },
          },
        };
      } catch (err: any) {
        throw new Error(
          `Failed to load conversations: ${err.response?.data?.message || err.message}`,
        );
      }
    },

    async listAdmins(query) {
      assertConfigured(currentUser);

      try {
        const res = await apiClient.get<AdvisorProfile[]>(
          "/api/advisor_profiles",
        );
        const advisors = Array.isArray(res.data)
          ? res.data
          : res.data?.data || res.data?.items || [];

        const active = (advisors as AdvisorProfile[]).filter(
          (a) => a.is_active !== false,
        );

        const normalizedQuery = (query || "").trim().toLowerCase();
        const filtered = normalizedQuery
          ? active.filter(
              (a) =>
                (a.full_name || "").toLowerCase().includes(normalizedQuery) ||
                (a.email || "").toLowerCase().includes(normalizedQuery),
            )
          : active;

        return {
          data: filtered.map((advisor) => ({
            id: advisor.id,
            displayName: advisor.full_name?.trim() || advisor.email,
            avatarUrl: advisor.avatar_url,
            role: "admin" as const,
          })),
        };
      } catch (err: any) {
        throw new Error(
          `Failed to load advisors: ${err.response?.data?.message || err.message}`,
        );
      }
    },

    async createConversation(
      payload: ChatCreateConversationPayload,
    ): Promise<{ data: ChatConversation }> {
      assertConfigured(currentUser);

      const advisorId = String(payload.participantIds[0] || "").trim();
      if (!advisorId) {
        throw new Error("Advisor is required to start a conversation.");
      }

      const userId = currentUser?.id || getStoredUserId();
      if (!userId) {
        throw new Error("User ID is required to create a conversation.");
      }

      try {
        const response = await apiClient.post<{
          conversationId: number;
        }>("/api/chat/start", {
          senderId: userId,
          receiverId: advisorId,
        });

        // Fetch the newly created conversation
        const convId = response.data.conversationId;
        const conversations = await apiClient.get<BackendChatConversation[]>(
          `/api/chat/user/${userId}`,
        );

        const newConv = (
          Array.isArray(conversations.data) ? conversations.data : []
        ).find((c) => c.id === convId);

        if (!newConv) {
          throw new Error("Failed to retrieve created conversation");
        }

        return {
          data: await mapBackendConversation(newConv, currentUser!),
        };
      } catch (err: any) {
        throw new Error(
          `Failed to start conversation: ${
            err.response?.data?.message || err.message
          }`,
        );
      }
    },

    async listMessages(
      conversationId: string,
      cursor?: string | null,
      pageSize = 30,
    ): Promise<ChatMessageListResponse> {
      assertConfigured(currentUser);

      try {
        const response = await apiClient.get<BackendChatMessage[]>(
          `/api/chat/messages/${conversationId}`,
        );
        const messages = Array.isArray(response.data) ? response.data : [];

        // Get advisor info for message formatting
        let advisorParticipant: ChatParticipant = {
          id: "unknown",
          displayName: "Advisor",
          avatarUrl: null,
          role: "admin",
        };

        // Try to find the sender from the messages
        const firstNonUserMessage = messages.find(
          (m) => m.senderId !== currentUser!.id,
        );
        if (firstNonUserMessage) {
          try {
            const advisors = await apiClient.get<AdvisorProfile[]>(
              "/api/advisor_profiles",
            );
            const advisorList = Array.isArray(advisors.data)
              ? advisors.data
              : advisors.data?.data || advisors.data?.items || [];
            const advisor = (advisorList as AdvisorProfile[]).find(
              (a) => a.id === firstNonUserMessage.senderId,
            );
            if (advisor) {
              advisorParticipant = {
                id: advisor.id,
                displayName: advisor.full_name?.trim() || advisor.email,
                avatarUrl: advisor.avatar_url,
                role: "admin",
              };
            }
          } catch {
            // Graceful degradation
          }
        }

        return {
          data: messages.map((msg) =>
            mapBackendMessage(msg, currentUser!, advisorParticipant),
          ),
          meta: {
            nextCursor: null,
          },
        };
      } catch (err: any) {
        throw new Error(
          `Failed to load messages: ${err.response?.data?.message || err.message}`,
        );
      }
    },

    async sendMessage(conversationId: string, payload: ChatSendMessagePayload) {
      assertConfigured(currentUser);

      const content = payload.text.trim();
      if (!content) {
        throw new Error("Message cannot be empty.");
      }

      const userId = currentUser?.id || getStoredUserId();
      if (!userId) {
        throw new Error("User ID is required to send a message.");
      }

      try {
        const response = await apiClient.post<BackendChatMessage>(
          "/api/chat/send",
          {
            conversationId: Number(conversationId),
            senderId: userId,
            content,
          },
        );

        // Get advisor info for message formatting
        let advisorParticipant: ChatParticipant = {
          id: "unknown",
          displayName: "Advisor",
          avatarUrl: null,
          role: "admin",
        };

        try {
          const advisors = await apiClient.get<AdvisorProfile[]>(
            "/api/advisor_profiles",
          );
          const advisorList = Array.isArray(advisors.data)
            ? advisors.data
            : advisors.data?.data || advisors.data?.items || [];
          // Use advisor_profiles or messages to find correct advisor
          const advisor = (advisorList as AdvisorProfile[]).find(
            (a) => a.id !== userId,
          );
          if (advisor) {
            advisorParticipant = {
              id: advisor.id,
              displayName: advisor.full_name?.trim() || advisor.email,
              avatarUrl: advisor.avatar_url,
              role: "admin",
            };
          }
        } catch {
          // Graceful degradation
        }

        return {
          data: mapBackendMessage(
            response.data,
            currentUser!,
            advisorParticipant,
          ),
        };
      } catch (err: any) {
        throw new Error(
          `Failed to send message: ${err.response?.data?.message || err.message}`,
        );
      }
    },

    async markRead(conversationId: string, _payload: ChatMarkReadPayload) {
      assertConfigured(currentUser);

      return {
        data: {
          conversationId,
          unreadCount: 0,
        },
      };
    },
  };
}
