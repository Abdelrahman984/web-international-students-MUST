import { apiClient } from '../api';
import type {
  ChatMsg,
  ChatConversation,
  ChatUserResult,
  ChatConversationSummary,
} from '../../types/chat';

const BASE = '/api/chat';

export async function startConversation(
  senderId: string,
  receiverId: string,
): Promise<ChatConversationSummary> {
  const res = await apiClient.post<ChatConversationSummary>(`${BASE}/start`, { senderId, receiverId });
  return res.data;
}

export async function sendMessage(
  conversationId: number,
  senderId: string,
  content: string,
): Promise<ChatMsg> {
  const res = await apiClient.post<ChatMsg>(`${BASE}/send`, { conversationId, senderId, content });
  return res.data;
}

export async function getMessages(conversationId: number): Promise<ChatMsg[]> {
  const res = await apiClient.get<ChatMsg[]>(`${BASE}/messages/${conversationId}`);
  return res.data;
}

export async function getUserConversations(userId: string): Promise<ChatConversation[]> {
  const res = await apiClient.get<ChatConversation[]>(`${BASE}/user/${userId}`);
  return res.data;
}

export async function searchUsers(query: string, requesterId?: string): Promise<ChatUserResult[]> {
  const params: Record<string, string> = { query };
  if (requesterId) params.requesterId = requesterId;
  const res = await apiClient.get<ChatUserResult[]>(`${BASE}/search`, { params });
  return res.data;
}
