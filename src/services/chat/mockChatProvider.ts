import type {
  ChatAdmin,
  ChatConversation,
  ChatConversationListResponse,
  ChatCreateConversationPayload,
  ChatMarkReadPayload,
  ChatMessage,
  ChatMessageListResponse,
  ChatParticipant,
  ChatProvider,
  ChatProviderCurrentUser,
  ChatSendMessagePayload,
} from './types';

const delay = async (milliseconds = 250) => {
  await new Promise((resolve) => window.setTimeout(resolve, milliseconds));
};

const cloneConversation = (conversation: ChatConversation): ChatConversation => ({
  ...conversation,
  participants: conversation.participants.map((participant) => ({ ...participant })),
  lastMessage: conversation.lastMessage ? { ...conversation.lastMessage } : conversation.lastMessage,
});

const cloneMessage = (message: ChatMessage): ChatMessage => ({
  ...message,
  sender: { ...message.sender },
});

const createTimestamp = (offsetMinutes: number) => {
  const timestamp = new Date();
  timestamp.setMinutes(timestamp.getMinutes() + offsetMinutes);
  return timestamp.toISOString();
};

export function createMockChatProvider(currentUser: ChatProviderCurrentUser = {
  id: 12,
  displayName: 'Assem',
  avatarUrl: null,
}): ChatProvider {
  const currentUserParticipant: ChatParticipant = {
    ...currentUser,
  };

  const adminDirectory: ChatAdmin[] = [];

  const conversations: ChatConversation[] = [];

  const messagesByConversation: Record<string, ChatMessage[]> = {};

  let conversationCounter = 1;
  let messageCounter = 1;

  const sortConversations = () => {
    conversations.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  };

  const nextConversationId = () => `conv_${conversationCounter++}`;
  const nextMessageId = () => `msg_${messageCounter++}`;

  return {
    async listConversations(page = 1, pageSize = 20): Promise<ChatConversationListResponse> {
      await delay();
      sortConversations();

      const start = (page - 1) * pageSize;
      const pageItems = conversations.slice(start, start + pageSize).map(cloneConversation);

      return {
        data: pageItems,
        meta: {
          pagination: {
            page,
            pageSize,
            total: conversations.length,
            pageCount: Math.max(1, Math.ceil(conversations.length / pageSize)),
          },
        },
      };
    },

    async listAdmins(query?: string) {
      await delay(180);
      const normalizedQuery = (query || '').trim().toLowerCase();

      const filtered = !normalizedQuery
        ? adminDirectory
        : adminDirectory.filter((admin) => admin.displayName.toLowerCase().includes(normalizedQuery));

      return {
        data: filtered.map((admin) => ({ ...admin })),
      };
    },

    async createConversation(payload: ChatCreateConversationPayload): Promise<{ data: ChatConversation }> {
      await delay();

      const existingConversation = conversations.find((conversation) =>
        conversation.participants.some((participant) => participant.id === currentUserParticipant.id) &&
        payload.participantIds.every((participantId) => conversation.participants.some((participant) => participant.id === participantId)) &&
        conversation.title === payload.title,
      );

      if (existingConversation) {
        return { data: cloneConversation(existingConversation) };
      }

      const createdAt = createTimestamp(0);
      const targetParticipantId = payload.participantIds[0] ?? 0;
      const targetParticipant: ChatParticipant = {
        id: targetParticipantId,
        displayName: payload.title.replace(/^Chat with\s+/i, '') || 'Admin',
        avatarUrl: null,
      };
      const participants = [currentUserParticipant, targetParticipant];
      const conversation: ChatConversation = {
        id: nextConversationId(),
        title: payload.title,
        participants,
        unreadCount: 0,
        updatedAt: createdAt,
        lastMessage: null,
      };

      conversations.unshift(conversation);
      messagesByConversation[conversation.id] = [];

      return { data: cloneConversation(conversation) };
    },

    async listMessages(conversationId: string, cursor?: string | null, pageSize = 30): Promise<ChatMessageListResponse> {
      await delay();

      const messages = messagesByConversation[conversationId] ?? [];
      if (messages.length === 0) {
        return { data: [], meta: { nextCursor: null } };
      }

      if (!cursor) {
        const latestMessages = messages.slice(-pageSize).map(cloneMessage);
        const nextCursor = messages.length > pageSize ? latestMessages[0]?.id ?? null : null;

        return {
          data: latestMessages,
          meta: {
            nextCursor,
          },
        };
      }

      const cursorIndex = messages.findIndex((message) => message.id === cursor);
      if (cursorIndex <= 0) {
        return { data: [], meta: { nextCursor: null } };
      }

      const sliceEnd = cursorIndex;
      const sliceStart = Math.max(0, sliceEnd - pageSize);
      const olderMessages = messages.slice(sliceStart, sliceEnd).map(cloneMessage);

      return {
        data: olderMessages,
        meta: {
          nextCursor: sliceStart > 0 ? olderMessages[0]?.id ?? null : null,
        },
      };
    },

    async sendMessage(conversationId: string, payload: ChatSendMessagePayload) {
      await delay(300);

      if (payload.text.toLowerCase().includes('fail-mock')) {
        throw new Error('Mock delivery failure');
      }

      const conversation = conversations.find((item) => item.id === conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const createdAt = createTimestamp(0);
      const message: ChatMessage = {
        id: nextMessageId(),
        conversationId,
        text: payload.text,
        sender: currentUserParticipant,
        status: 'sent',
        createdAt,
        clientMessageId: payload.clientMessageId ?? null,
      };

      messagesByConversation[conversationId] = [...(messagesByConversation[conversationId] ?? []), message];
      conversation.lastMessage = {
        id: message.id,
        text: message.text,
        senderId: message.sender.id,
        createdAt: message.createdAt,
      };
      conversation.updatedAt = createdAt;
      conversation.unreadCount = 0;
      sortConversations();

      return { data: cloneMessage(message) };
    },

    async markRead(conversationId: string, payload: ChatMarkReadPayload) {
      await delay(120);

      const conversation = conversations.find((item) => item.id === conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      conversation.unreadCount = 0;
      conversation.updatedAt = createTimestamp(0);
      if (payload.lastReadMessageId) {
        const lastMessage = (messagesByConversation[conversationId] ?? []).find((message) => message.id === payload.lastReadMessageId);
        if (lastMessage) {
          conversation.lastMessage = {
            id: lastMessage.id,
            text: lastMessage.text,
            senderId: lastMessage.sender.id,
            createdAt: lastMessage.createdAt,
          };
        }
      }

      sortConversations();

      return {
        data: {
          conversationId,
          unreadCount: 0,
        },
      };
    },
  };
}
