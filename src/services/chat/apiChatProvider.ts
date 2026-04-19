import { getSupabaseConfigError, supabase } from '../supabase';
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
} from './types';

type ConversationRow = {
  id: string;
  advisor_id: string;
  student_id: string | null;
  student_email: string;
  student_full_name: string | null;
  status: 'open' | 'closed';
  last_message_text: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_role: 'advisor' | 'student' | 'system';
  sender_id: string | null;
  message_text: string;
  created_at: string;
};

type AdvisorProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  is_active: boolean;
};

const getTable = (envName: string, fallback: string) => {
  const value = import.meta.env[envName];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
};

const TABLES = {
  conversations: getTable('VITE_SUPABASE_ADVISOR_STUDENT_CONVERSATIONS_TABLE', 'advisor_student_conversations'),
  messages: getTable('VITE_SUPABASE_CONVERSATION_MESSAGES_TABLE', 'conversation_messages'),
  advisors: getTable('VITE_SUPABASE_ADVISOR_PROFILES_TABLE', 'advisor_profiles'),
};

const toIso = (value: string | null | undefined): string => {
  if (value && value.trim()) {
    return value;
  }

  return new Date().toISOString();
};

const assertConfigured = (currentUser?: ChatProviderCurrentUser) => {
  const configError = getSupabaseConfigError();
  if (configError) {
    throw new Error(configError);
  }

  if (!currentUser) {
    throw new Error('You must be signed in to use chat.');
  }

  if (!currentUser.email?.trim()) {
    throw new Error('Your account is missing an email address required for chat.');
  }
};

const toAdvisorParticipant = (advisor: AdvisorProfileRow): ChatParticipant => ({
  id: advisor.id,
  displayName: advisor.full_name?.trim() || advisor.email,
  avatarUrl: advisor.avatar_url,
  role: 'admin',
});

const toCurrentUserParticipant = (currentUser: ChatProviderCurrentUser): ChatParticipant => ({
  id: currentUser.id,
  displayName: currentUser.displayName || 'You',
  avatarUrl: currentUser.avatarUrl,
  role: currentUser.role === 'admin' ? 'admin' : 'user',
});

const escapeForOrFilter = (value: string): string => value.replace(/,/g, '\\,');

const isMissingTablesError = (error: { code?: string; message?: string }): boolean => {
  if (error.code === 'PGRST205' || error.code === '42P01') {
    return true;
  }

  const message = (error.message || '').toLowerCase();
  return message.includes('advisor_student_conversations') || message.includes('conversation_messages');
};

async function getAdvisorMap(advisorIds: string[]): Promise<Record<string, AdvisorProfileRow>> {
  if (advisorIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from(TABLES.advisors)
    .select('id, full_name, email, avatar_url, is_active')
    .in('id', advisorIds)
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to load advisor profiles: ${error.message}`);
  }

  return (data || []).reduce<Record<string, AdvisorProfileRow>>((acc, advisor) => {
    acc[advisor.id] = advisor as AdvisorProfileRow;
    return acc;
  }, {});
}

function mapConversation(
  row: ConversationRow,
  advisor: AdvisorProfileRow | undefined,
  currentUser: ChatProviderCurrentUser,
): ChatConversation {
  const advisorParticipant = advisor
    ? toAdvisorParticipant(advisor)
    : {
        id: row.advisor_id,
        displayName: 'Advisor',
        avatarUrl: null,
        role: 'admin' as const,
      };

  return {
    id: row.id,
    title: `Chat with ${advisorParticipant.displayName}`,
    participants: [toCurrentUserParticipant(currentUser), advisorParticipant],
    lastMessage: row.last_message_text
      ? {
          id: `${row.id}-last`,
          text: row.last_message_text,
          senderId: row.advisor_id,
          createdAt: toIso(row.last_message_at),
        }
      : null,
    unreadCount: 0,
    updatedAt: toIso(row.last_message_at || row.updated_at || row.created_at),
  };
}

function mapMessage(
  row: MessageRow,
  advisorParticipant: ChatParticipant,
  currentUser: ChatProviderCurrentUser,
): ChatMessage {
  const senderType = row.sender_role === 'advisor' ? 'admin' : 'user';

  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderType,
    text: row.message_text,
    sender:
      senderType === 'admin'
        ? advisorParticipant
        : {
            id: currentUser.id,
            displayName: currentUser.displayName || 'You',
            avatarUrl: currentUser.avatarUrl,
            role: 'user',
          },
    status: 'sent',
    createdAt: toIso(row.created_at),
    clientMessageId: null,
  };
}

export function createApiChatProvider(currentUser?: ChatProviderCurrentUser): ChatProvider {
  return {
    async listConversations(page = 1, pageSize = 20): Promise<ChatConversationListResponse> {
      assertConfigured(currentUser);

      const studentEmail = currentUser.email!.trim().toLowerCase();
      const studentId = String(currentUser.id);

      const { data, error } = await supabase
        .from(TABLES.conversations)
        .select('*')
        .or(`student_email.eq.${escapeForOrFilter(studentEmail)},student_id.eq.${escapeForOrFilter(studentId)}`)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('updated_at', { ascending: false });

      if (error) {
        if (isMissingTablesError(error)) {
          return {
            data: [],
            meta: {
              pagination: { page, pageSize, total: 0, pageCount: 1 },
            },
          };
        }
        throw new Error(`Failed to load conversations: ${error.message}`);
      }

      const rows = (data || []) as ConversationRow[];
      const advisorMap = await getAdvisorMap(Array.from(new Set(rows.map((row) => row.advisor_id))));
      const mapped = rows.map((row) => mapConversation(row, advisorMap[row.advisor_id], currentUser));

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
    },

    async listAdmins(query) {
      assertConfigured(currentUser);

      let request = supabase
        .from(TABLES.advisors)
        .select('id, full_name, email, avatar_url, is_active')
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      const normalizedQuery = (query || '').trim();
      if (normalizedQuery) {
        request = request.ilike('full_name', `%${normalizedQuery}%`);
      }

      const { data, error } = await request;

      if (error) {
        throw new Error(`Failed to load advisors: ${error.message}`);
      }

      return {
        data: (data || []).map((advisor) => ({
          id: advisor.id,
          displayName: advisor.full_name?.trim() || advisor.email,
          avatarUrl: advisor.avatar_url,
          role: 'admin',
        })),
      };
    },

    async createConversation(payload: ChatCreateConversationPayload): Promise<{ data: ChatConversation }> {
      assertConfigured(currentUser);

      const advisorId = String(payload.participantIds[0] || '').trim();
      if (!advisorId) {
        throw new Error('Advisor is required to start a conversation.');
      }

      const studentEmail = currentUser.email!.trim().toLowerCase();
      const studentId = String(currentUser.id);

      const { data: existing, error: existingError } = await supabase
        .from(TABLES.conversations)
        .select('*')
        .eq('advisor_id', advisorId)
        .eq('student_email', studentEmail)
        .maybeSingle();

      if (existingError) {
        throw new Error(`Failed to start conversation: ${existingError.message}`);
      }

      const now = new Date().toISOString();
      let conversationRow: ConversationRow;

      if (existing) {
        if (existing.status === 'closed') {
          const { data: reopened, error: reopenError } = await supabase
            .from(TABLES.conversations)
            .update({ status: 'open', updated_at: now })
            .eq('id', existing.id)
            .select('*')
            .single();

          if (reopenError) {
            throw new Error(`Failed to reopen conversation: ${reopenError.message}`);
          }

          conversationRow = reopened as ConversationRow;
        } else {
          conversationRow = existing as ConversationRow;
        }
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from(TABLES.conversations)
          .insert({
            advisor_id: advisorId,
            student_id: studentId,
            student_email: studentEmail,
            student_full_name: currentUser.displayName || null,
            status: 'open',
            created_at: now,
            updated_at: now,
          })
          .select('*')
          .single();

        if (insertError) {
          throw new Error(`Failed to start conversation: ${insertError.message}`);
        }

        conversationRow = inserted as ConversationRow;
      }

      const advisorMap = await getAdvisorMap([advisorId]);
      return { data: mapConversation(conversationRow, advisorMap[advisorId], currentUser) };
    },

    async listMessages(conversationId: string, cursor?: string | null, pageSize = 30): Promise<ChatMessageListResponse> {
      assertConfigured(currentUser);

      const studentEmail = currentUser.email!.trim().toLowerCase();
      const { data: conversation, error: conversationError } = await supabase
        .from(TABLES.conversations)
        .select('id, advisor_id')
        .eq('id', conversationId)
        .eq('student_email', studentEmail)
        .maybeSingle();

      if (conversationError) {
        throw new Error(`Failed to validate conversation: ${conversationError.message}`);
      }

      if (!conversation) {
        return { data: [], meta: { nextCursor: null } };
      }

      const { data: messages, error } = await supabase
        .from(TABLES.messages)
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(pageSize);

      if (error) {
        throw new Error(`Failed to load messages: ${error.message}`);
      }

      const advisorMap = await getAdvisorMap([conversation.advisor_id]);
      const advisorParticipant = advisorMap[conversation.advisor_id]
        ? toAdvisorParticipant(advisorMap[conversation.advisor_id])
        : {
            id: conversation.advisor_id,
            displayName: 'Advisor',
            avatarUrl: null,
            role: 'admin' as const,
          };

      return {
        data: ((messages || []) as MessageRow[]).map((row) => mapMessage(row, advisorParticipant, currentUser)),
        meta: {
          // Cursor pagination is not required for current table sizes in this app.
          nextCursor: null,
        },
      };
    },

    async sendMessage(conversationId: string, payload: ChatSendMessagePayload) {
      assertConfigured(currentUser);

      const content = payload.text.trim();
      if (!content) {
        throw new Error('Message cannot be empty.');
      }

      const studentEmail = currentUser.email!.trim().toLowerCase();
      const { data: conversation, error: conversationError } = await supabase
        .from(TABLES.conversations)
        .select('id, status, advisor_id')
        .eq('id', conversationId)
        .eq('student_email', studentEmail)
        .maybeSingle();

      if (conversationError) {
        throw new Error(`Failed to validate conversation: ${conversationError.message}`);
      }

      if (!conversation) {
        throw new Error('Conversation not found.');
      }

      if (conversation.status === 'closed') {
        throw new Error('This conversation is closed.');
      }

      const now = new Date().toISOString();
      const { data: inserted, error: insertError } = await supabase
        .from(TABLES.messages)
        .insert({
          conversation_id: conversationId,
          sender_role: 'student',
          sender_id: null,
          message_text: content,
          created_at: now,
        })
        .select('*')
        .single();

      if (insertError) {
        throw new Error(`Failed to send message: ${insertError.message}`);
      }

      const { error: updateError } = await supabase
        .from(TABLES.conversations)
        .update({
          last_message_text: content,
          last_message_at: now,
          updated_at: now,
        })
        .eq('id', conversationId);

      if (updateError) {
        throw new Error(`Message sent, but conversation update failed: ${updateError.message}`);
      }

      const advisorMap = await getAdvisorMap([conversation.advisor_id]);
      const advisorParticipant = advisorMap[conversation.advisor_id]
        ? toAdvisorParticipant(advisorMap[conversation.advisor_id])
        : {
            id: conversation.advisor_id,
            displayName: 'Advisor',
            avatarUrl: null,
            role: 'admin' as const,
          };

      return {
        data: mapMessage(inserted as MessageRow, advisorParticipant, currentUser),
      };
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
