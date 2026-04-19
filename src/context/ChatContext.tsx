import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { ROLES } from '../constants/roles';
import { createChatProvider, type ChatAdmin, type ChatConversation, type ChatCreateConversationPayload, type ChatMessage, type ChatProviderCurrentUser, type ChatThreadMessage } from '../services/chat';

interface ChatContextValue {
  isOpen: boolean;
  conversations: ChatConversation[];
  activeConversationId: string | null;
  activeConversation: ChatConversation | null;
  adminDirectory: ChatAdmin[];
  messagesByConversation: Record<string, ChatThreadMessage[]>;
  unreadCount: number;
  isLoadingConversations: boolean;
  isLoadingAdmins: boolean;
  isLoadingMessages: boolean;
  error: string | null;
  announcement: string;
  openChat: (triggerElement?: HTMLElement | null) => void;
  closeChat: () => void;
  toggleChat: (triggerElement?: HTMLElement | null) => void;
  selectConversation: (conversationId: string) => Promise<void>;
  loadAdmins: (query?: string) => Promise<void>;
  startConversationWithAdmin: (admin: ChatAdmin) => Promise<void>;
  refreshConversations: () => Promise<void>;
  createConversation: (payload: ChatCreateConversationPayload) => Promise<void>;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  retryMessage: (messageId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

const currentUserParticipant = (user: ReturnType<typeof useAuth>['user']) => ({
  id: user?.id ?? 'guest',
  displayName: user?.displayName || user?.username || 'You',
  avatarUrl: user?.avatar?.url ?? null,
  email: user?.email,
  role: (user?.role?.type === ROLES.ADMIN ? 'admin' : 'user') as 'user' | 'admin',
});

const generateClientMessageId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> => {
  return await new Promise<T>((resolve, reject) => {
    const timerId = window.setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    promise
      .then((value) => {
        window.clearTimeout(timerId);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timerId);
        reject(error);
      });
  });
};

const updateConversationPreview = (
  conversations: ChatConversation[],
  conversationId: string,
  lastMessage: ChatConversation['lastMessage'],
  unreadCount = 0,
  updatedAt = new Date().toISOString(),
  title?: string,
  participants: ChatConversation['participants'] = [],
) => {
  const updatedConversations = conversations.map((conversation) => {
    if (conversation.id !== conversationId) {
      return conversation;
    }

    return {
      ...conversation,
      lastMessage,
      unreadCount,
      updatedAt,
    };
  });

  if (!updatedConversations.some((conversation) => conversation.id === conversationId)) {
    updatedConversations.push({
      id: conversationId,
      title: title ?? 'Support',
      participants,
      lastMessage,
      unreadCount,
      updatedAt,
    });
  }

  return updatedConversations.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
};

const replaceMessage = (
  messages: ChatThreadMessage[],
  messageId: string,
  nextMessage: ChatThreadMessage,
) => messages.map((message) => (message.id === messageId ? nextMessage : message));

const appendUniqueMessages = (currentMessages: ChatThreadMessage[], nextMessages: ChatMessage[]) => {
  const existingIds = new Set(currentMessages.map((message) => message.id));
  const mergedMessages = [...currentMessages];

  nextMessages.forEach((message) => {
    if (!existingIds.has(message.id)) {
      mergedMessages.push(message);
    }
  });

  return mergedMessages;
};

export function ChatStoreProvider({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading: isAuthLoading } = useAuth();
  const previousUserIdRef = useRef<string | number | null>(null);
  const lastReadMessageRef = useRef<Record<string, string | undefined>>({});
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [adminDirectory, setAdminDirectory] = useState<ChatAdmin[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatThreadMessage[]>>({});
  const [nextCursorByConversation, setNextCursorByConversation] = useState<Record<string, string | null>>({});
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('Chat ready.');
  const currentUser = currentUserParticipant(user);

  const provider = useMemo(() => {
    const createdProvider = createChatProvider(currentUser as ChatProviderCurrentUser);
    return createdProvider;
  }, [currentUser.id, currentUser.displayName, currentUser.avatarUrl, currentUser.email]);

  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId) ?? null;
  const unreadCount = conversations.reduce((total, conversation) => total + conversation.unreadCount, 0);

  const resetChatState = () => {
    setIsOpen(false);
    setConversations([]);
    setActiveConversationId(null);
    setAdminDirectory([]);
    setMessagesByConversation({});
    setNextCursorByConversation({});
    setIsLoadingConversations(false);
    setIsLoadingMessages(false);
    setError(null);
    setAnnouncement('Chat ready.');
    lastReadMessageRef.current = {};
  };

  const focusReturnTarget = () => {
    const target = returnFocusRef.current;
    returnFocusRef.current = null;
    target?.focus();
  };

  const refreshConversations = useCallback(async () => {
    if (!user || isAuthLoading) {
      return;
    }

    setIsLoadingConversations(true);
    setError(null);

    try {
      const response = await provider.listConversations(1, 20);
      const nextConversations = response.data;
      setConversations(nextConversations);

      setActiveConversationId((currentActiveConversationId) => {
        if (currentActiveConversationId && nextConversations.some((conversation) => conversation.id === currentActiveConversationId)) {
          return currentActiveConversationId;
        }

        return nextConversations[0]?.id ?? null;
      });

      if (nextConversations.length === 0) {
        setAnnouncement('No conversations yet. Start a new support chat when you need help.');
      }
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : 'Failed to load conversations.';
      setError(message);
      setAnnouncement(message);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user, isAuthLoading, provider]);

  const loadAdmins = useCallback(async (query?: string) => {
    if (!user || isAuthLoading) {
      return;
    }

    setIsLoadingAdmins(true);

    try {
      const response = await provider.listAdmins(query);
      setAdminDirectory(response.data || []);
    } catch (loadAdminsError) {
      const message = loadAdminsError instanceof Error ? loadAdminsError.message : 'Failed to load admins.';
      setError(message);
      setAnnouncement(message);
    } finally {
      setIsLoadingAdmins(false);
    }
  }, [user, isAuthLoading, provider]);

  const loadMessages = useCallback(async (conversationId: string, reset = true) => {
    if (!conversationId || !user || isAuthLoading) {
      return;
    }

    setIsLoadingMessages(true);
    setError(null);

    try {
      const cursor = reset ? null : nextCursorByConversation[conversationId] ?? null;
      const response = await provider.listMessages(conversationId, cursor, 30);

      setMessagesByConversation((currentMessages) => {
        const existingMessages = reset ? [] : currentMessages[conversationId] ?? [];
        const normalizedMessages = response.data.map((message) => ({
          ...message,
          status: message.status,
        }));

        return {
          ...currentMessages,
          [conversationId]: reset
            ? normalizedMessages
            : appendUniqueMessages(existingMessages, normalizedMessages),
        };
      });

      setNextCursorByConversation((currentCursors) => ({
        ...currentCursors,
        [conversationId]: response.meta.nextCursor,
      }));
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load messages.';
      setError(message);
      setAnnouncement(message);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [user, isAuthLoading, provider, nextCursorByConversation]);

  const openChat = (triggerElement?: HTMLElement | null) => {
    returnFocusRef.current = triggerElement ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setIsOpen(true);
    setError(null);
    setAnnouncement('Chat panel opened.');

    if (conversations.length === 0) {
      void refreshConversations();
    }

    if (adminDirectory.length === 0) {
      void loadAdmins();
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setAnnouncement('Chat panel closed.');
    focusReturnTarget();
  };

  const toggleChat = (triggerElement?: HTMLElement | null) => {
    if (isOpen) {
      closeChat();
      return;
    }

    openChat(triggerElement);
  };

  const selectConversation = async (conversationId: string) => {
    setActiveConversationId(conversationId);

    if (!messagesByConversation[conversationId]) {
      await loadMessages(conversationId, true);
    }
  };

  const createConversation = async (payload: ChatCreateConversationPayload) => {
    setError(null);
    try {
      const response = await provider.createConversation(payload);
      const createdConversation = response.data;

      setConversations((currentConversations) =>
        updateConversationPreview(
          currentConversations,
          createdConversation.id,
          createdConversation.lastMessage ?? null,
          createdConversation.unreadCount,
          createdConversation.updatedAt,
          createdConversation.title,
          createdConversation.participants,
        ),
      );
      setActiveConversationId(createdConversation.id);
      void loadMessages(createdConversation.id, true);
      setAnnouncement(`Conversation ${createdConversation.title} created.`);
    } catch (createError) {
      const message = createError instanceof Error ? createError.message : 'Failed to create conversation.';
      setError(message);
      setAnnouncement(message);
      throw createError instanceof Error ? createError : new Error(message);
    }
  };

  const startConversationWithAdmin = useCallback(async (admin: ChatAdmin) => {
    const existingConversation = conversations.find((conversation) =>
      conversation.participants.some((participant) => participant.id === admin.id),
    );

    if (existingConversation) {
      await selectConversation(existingConversation.id);
      return;
    }

    await createConversation({
      participantIds: [admin.id],
      title: `Chat with ${admin.displayName}`,
    });
  }, [conversations]);

  const sendMessage = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || !activeConversationId || !user) {
      return;
    }

    const clientMessageId = generateClientMessageId();
    const sender = currentUserParticipant(user);
    const optimisticMessage: ChatThreadMessage = {
      id: clientMessageId,
      conversationId: activeConversationId,
      text: trimmedText,
      sender,
      status: 'sending',
      createdAt: new Date().toISOString(),
      clientMessageId,
    };

    setMessagesByConversation((currentMessages) => ({
      ...currentMessages,
      [activeConversationId]: [...(currentMessages[activeConversationId] ?? []), optimisticMessage],
    }));
    setAnnouncement(`Sending message: ${trimmedText}`);

    try {
      const response = await withTimeout(
        provider.sendMessage(activeConversationId, {
          text: trimmedText,
          clientMessageId,
        }),
        15000,
        'Message request timed out. Please retry.',
      );

      const sentMessage = response.data;
      setMessagesByConversation((currentMessages) => ({
        ...currentMessages,
        [activeConversationId]: replaceMessage(currentMessages[activeConversationId] ?? [], clientMessageId, {
          ...sentMessage,
          status: 'sent',
        }),
      }));

      setConversations((currentConversations) =>
        updateConversationPreview(
          currentConversations,
          activeConversationId,
          {
            id: sentMessage.id,
            text: sentMessage.text,
            senderId: sentMessage.sender.id,
            createdAt: sentMessage.createdAt,
          },
          0,
          sentMessage.createdAt,
        ),
      );
      setError(null);
      setAnnouncement(`Message sent: ${sentMessage.text}`);
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : 'Failed to send message.';
      setMessagesByConversation((currentMessages) => ({
        ...currentMessages,
        [activeConversationId]: (currentMessages[activeConversationId] ?? []).map((threadMessage) =>
          threadMessage.id === clientMessageId
            ? {
                ...threadMessage,
                status: 'failed',
                errorMessage: message,
              }
            : threadMessage,
        ),
      }));
      setError(message);
      setAnnouncement(message);
    }
  };

  const retryMessage = async (messageId: string) => {
    if (!activeConversationId) {
      return;
    }

    const failedMessage = (messagesByConversation[activeConversationId] ?? []).find((message) => message.id === messageId);
    if (!failedMessage) {
      return;
    }

    setMessagesByConversation((currentMessages) => ({
      ...currentMessages,
      [activeConversationId]: (currentMessages[activeConversationId] ?? []).filter((message) => message.id !== messageId),
    }));
    await sendMessage(failedMessage.text);
  };

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      resetChatState();
      previousUserIdRef.current = null;
      return;
    }

    if (previousUserIdRef.current !== null && previousUserIdRef.current !== user.id) {
      resetChatState();
    }

    previousUserIdRef.current = user.id;

    void refreshConversations();
    // Token changes are already handled by the auth provider; the chat cache should refresh on login.
  }, [user, isAuthLoading, token, refreshConversations]);

  useEffect(() => {
    if (!isOpen || !activeConversationId) {
      return;
    }

    if (!messagesByConversation[activeConversationId]) {
      void loadMessages(activeConversationId, true);
    }
  }, [isOpen, activeConversationId, loadMessages, messagesByConversation]);

  useEffect(() => {
    if (!isOpen || !activeConversationId) {
      return;
    }

    const messages = messagesByConversation[activeConversationId] ?? [];
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || lastMessage.status === 'failed') {
      return;
    }

    if (lastReadMessageRef.current[activeConversationId] === lastMessage.id) {
      return;
    }

    lastReadMessageRef.current[activeConversationId] = lastMessage.id;
    setConversations((currentConversations) =>
      currentConversations.map((conversation) =>
        conversation.id === activeConversationId
          ? {
              ...conversation,
              unreadCount: 0,
            }
          : conversation,
      ),
    );

    void provider.markRead(activeConversationId, {
      lastReadMessageId: lastMessage.id,
    });
  }, [isOpen, activeConversationId, messagesByConversation, provider]);

  const value: ChatContextValue = {
    isOpen,
    conversations,
    activeConversationId,
    activeConversation,
    adminDirectory,
    messagesByConversation,
    unreadCount,
    isLoadingConversations,
    isLoadingAdmins,
    isLoadingMessages,
    error,
    announcement,
    openChat,
    closeChat,
    toggleChat,
    selectConversation,
    loadAdmins,
    startConversationWithAdmin,
    refreshConversations,
    createConversation,
    loadMoreMessages: async (conversationId: string) => {
      await loadMessages(conversationId, false);
    },
    sendMessage,
    retryMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatStoreProvider');
  }

  return context;
}
