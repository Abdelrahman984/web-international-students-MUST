export interface ChatConversationSummary {
  conversationId: number;
  createdAt: string;
  isNew: boolean;
}

export interface ChatMsg {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: number;
  createdAt: string;
  participants: { id: number; conversationId: number; userId: string; name?: string; email?: string }[];
  lastMessage?: ChatMsg | null;
}

export interface ChatUserResult {
  id: string;
  name: string | null;
  email: string | null;
}
