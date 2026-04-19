export interface ChatParticipant {
  id: number | string;
  displayName: string;
  avatarUrl: string | null;
  role?: 'user' | 'admin';
}

export interface ChatAdmin extends ChatParticipant {
  role?: string;
}

export interface ChatConversationMessagePreview {
  id: string;
  text: string;
  senderId: number | string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  participants: ChatParticipant[];
  lastMessage?: ChatConversationMessagePreview | null;
  unreadCount: number;
  updatedAt: string;
}

export type ChatMessageStatus = 'sent' | 'sending' | 'failed';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderType: 'user' | 'admin';
  text: string;
  sender: ChatParticipant;
  status: ChatMessageStatus;
  createdAt: string;
  clientMessageId?: string | null;
}

export interface ChatPaginationMeta {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
  };
}

export interface ChatConversationListResponse {
  data: ChatConversation[];
  meta: ChatPaginationMeta;
}

export interface ChatMessageListResponse {
  data: ChatMessage[];
  meta: {
    nextCursor: string | null;
  };
}

export interface ChatCreateConversationPayload {
  participantIds: Array<number | string>;
  title: string;
}

export interface ChatSendMessagePayload {
  text: string;
  clientMessageId?: string;
}

export interface ChatMarkReadPayload {
  lastReadMessageId: string;
}

export interface ChatProvider {
  listConversations(page?: number, pageSize?: number): Promise<ChatConversationListResponse>;
  listAdmins(query?: string): Promise<{ data: ChatAdmin[] }>;
  createConversation(payload: ChatCreateConversationPayload): Promise<{ data: ChatConversation }>;
  listMessages(conversationId: string, cursor?: string | null, pageSize?: number): Promise<ChatMessageListResponse>;
  sendMessage(conversationId: string, payload: ChatSendMessagePayload): Promise<{ data: ChatMessage }>;
  markRead(conversationId: string, payload: ChatMarkReadPayload): Promise<{ data: { conversationId: string; unreadCount: number } }>;
}

export interface ChatProviderCurrentUser {
  id: number | string;
  displayName: string;
  avatarUrl: string | null;
  email?: string;
  role?: 'user' | 'admin';
}

export interface ChatThreadMessage extends ChatMessage {
  errorMessage?: string;
}
