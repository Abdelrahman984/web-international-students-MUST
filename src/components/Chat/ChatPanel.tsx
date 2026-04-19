import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Inbox, LoaderCircle, MessageSquareText, RefreshCw, Search, Send, UserPlus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import type { ChatAdmin, ChatThreadMessage } from '../../services/chat';

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const formatMessageTime = (timestamp: string) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

const sortMessages = (messages: ChatThreadMessage[]) => [...messages].sort((left, right) => left.createdAt.localeCompare(right.createdAt));

const getCurrentUserRole = (user: ReturnType<typeof useAuth>['user']) => (user?.role?.type === 'admin' ? 'admin' : 'user');

const MessageBubble = ({ message, isMine, onRetry }: { message: ChatThreadMessage; isMine: boolean; onRetry: (messageId: string) => void }) => {
  const bubbleStyles = isMine
    ? 'bg-secondary text-white rounded-br-md'
    : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white rounded-bl-md border border-slate-200 dark:border-slate-700';

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${bubbleStyles}`}>
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">
          <span>{isMine ? 'You' : message.sender.displayName}</span>
          <span>|</span>
          <span>{formatMessageTime(message.createdAt)}</span>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.text}</p>

        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
          <span className={message.status === 'failed' ? 'text-rose-200' : 'opacity-70'}>
            {message.status === 'sending' ? 'Sending...' : message.status === 'failed' ? 'Failed to send' : 'Sent'}
          </span>
          {message.status === 'failed' && (
            <button
              type="button"
              onClick={() => onRetry(message.id)}
              className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-inherit transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export function ChatPanel() {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const [conversationQuery, setConversationQuery] = useState('');
  const [adminQuery, setAdminQuery] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const { user } = useAuth();
  const currentUserRole = getCurrentUserRole(user);
  const {
    isOpen,
    conversations,
    activeConversation,
    activeConversationId,
    adminDirectory,
    messagesByConversation,
    unreadCount,
    isLoadingConversations,
    isLoadingAdmins,
    isLoadingMessages,
    error,
    announcement,
    closeChat,
    selectConversation,
    loadAdmins,
    startConversationWithAdmin,
    createConversation,
    sendMessage,
    retryMessage,
  } = useChat();

  const activeMessages = useMemo(
    () => sortMessages(messagesByConversation[activeConversationId ?? ''] ?? []),
    [messagesByConversation, activeConversationId],
  );

  const filteredConversations = useMemo(() => {
    const query = conversationQuery.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const titleMatch = conversation.title.toLowerCase().includes(query);
      const participantMatch = conversation.participants.some((participant) => participant.displayName.toLowerCase().includes(query));
      return titleMatch || participantMatch;
    });
  }, [conversations, conversationQuery]);

  const filteredAdmins = useMemo(() => {
    const query = adminQuery.trim().toLowerCase();

    if (!query) {
      return adminDirectory;
    }

    return adminDirectory.filter((admin) => admin.displayName.toLowerCase().includes(query));
  }, [adminDirectory, adminQuery]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
      const firstFocusable = focusables?.[0] ?? composerRef.current ?? panelRef.current;
      firstFocusable?.focus();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isOpen, activeConversationId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [isOpen, activeConversationId, activeMessages.length]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (adminDirectory.length === 0) {
      void loadAdmins();
    }
  }, [isOpen, adminDirectory.length, loadAdmins]);

  if (typeof document === 'undefined' || !isOpen) {
    return null;
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      closeChat();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusables = panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
    if (!focusables || focusables.length === 0) {
      event.preventDefault();
      return;
    }

    const firstFocusable = focusables[0];
    const lastFocusable = focusables[focusables.length - 1];
    const activeElement = document.activeElement as HTMLElement | null;

    if (event.shiftKey && activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
    } else if (!event.shiftKey && activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeChat();
    }
  };

  const startSupportConversation = async () => {
    const supportAdmin = adminDirectory.find((admin) => admin.displayName.toLowerCase().includes('support')) || adminDirectory[0];

    if (supportAdmin) {
      await startConversationWithAdmin(supportAdmin);
      return;
    }

    await createConversation({ participantIds: [1], title: 'Support' });
  };

  const openAdminConversation = async (admin: ChatAdmin) => {
    await startConversationWithAdmin(admin);
  };

  const onComposerSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextMessage = draftMessage.trim();
    if (!nextMessage) {
      return;
    }

    setDraftMessage('');

    try {
      await sendMessage(nextMessage);
    } catch {
      setDraftMessage(nextMessage);
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1100] bg-slate-950/45 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={handleOverlayClick}
        aria-hidden="true"
      >
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Chat panel"
          aria-describedby="chat-panel-description"
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className="absolute right-2 top-2 flex h-[calc(100vh-1rem)] w-[calc(100vw-1rem)] max-w-[1040px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white text-slate-900 shadow-[0_30px_120px_rgba(2,6,23,0.35)] dark:border-white/10 dark:bg-slate-950 dark:text-white sm:right-4 sm:top-4 sm:h-[calc(100vh-2rem)] lg:w-[calc(100vw-2rem)] lg:max-w-[980px]"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        >
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/60 sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Student chat</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">Support inbox</h2>
              <p id="chat-panel-description" className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Conversations, messages, and replies in one place.
              </p>
            </div>
            <button
              type="button"
              onClick={closeChat}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-secondary/40 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              aria-label="Close chat panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/40 lg:w-[320px] lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between px-4 py-3 sm:px-6">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Conversations</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Unread {unreadCount}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void startSupportConversation()}
                  className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-white transition hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary/40"
                >
                  <MessageSquareText className="h-3.5 w-3.5" />
                  New chat
                </button>
              </div>

              <div className="px-4 pb-3 sm:px-6">
                <label className="sr-only" htmlFor="conversation-search">Search conversations</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="conversation-search"
                    value={conversationQuery}
                    onChange={(event) => setConversationQuery(event.target.value)}
                    placeholder="Search by admin or chat title"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="px-4 pb-3 sm:px-6">
                <label className="sr-only" htmlFor="admin-search">Search advisors</label>
                <div className="relative">
                  <UserPlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="admin-search"
                    value={adminQuery}
                    onChange={(event) => setAdminQuery(event.target.value)}
                    placeholder="Find advisor by name"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div className="mt-2 max-h-28 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
                  {isLoadingAdmins ? (
                    <div className="flex items-center justify-center py-3 text-slate-500 dark:text-slate-400">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    </div>
                  ) : filteredAdmins.length === 0 ? (
                    <p className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400">No admins found.</p>
                  ) : (
                    <ul className="space-y-1">
                      {filteredAdmins.map((admin) => (
                        <li key={admin.id}>
                          <button
                            type="button"
                            onClick={() => void openAdminConversation(admin)}
                            className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <span className="truncate">{admin.displayName}</span>
                            <span className="text-[11px] font-semibold uppercase tracking-wide text-secondary">Chat</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 sm:px-4">
                {isLoadingConversations ? (
                  <div className="flex h-48 items-center justify-center text-slate-500 dark:text-slate-400">
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="mx-2 mt-3 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-300">
                    <Inbox className="h-6 w-6 text-secondary" />
                    <p className="mt-3 font-semibold text-slate-900 dark:text-white">No conversations found</p>
                    <p className="mt-2 leading-6">Try another name or start a new chat with an admin from the list above.</p>
                    <button
                      type="button"
                      onClick={() => void startSupportConversation()}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-white transition hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary/40"
                    >
                      Create support chat
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {filteredConversations.map((conversation) => {
                      const isActive = conversation.id === activeConversationId;
                      return (
                        <li key={conversation.id}>
                          <button
                            type="button"
                            onClick={() => void selectConversation(conversation.id)}
                            className={`w-full rounded-2xl border px-4 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-secondary/40 ${
                              isActive
                                ? 'border-secondary bg-secondary/10 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700 dark:hover:bg-slate-900/80'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{conversation.title}</p>
                                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                                  {conversation.lastMessage?.text ?? 'No messages yet'}
                                </p>
                              </div>
                              {conversation.unreadCount > 0 && (
                                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-secondary px-2 py-1 text-[11px] font-bold text-white">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </aside>

            <section className="flex min-h-0 flex-1 flex-col bg-white dark:bg-slate-950">
              {error && (
                <div className="mx-4 mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/60 dark:text-rose-200 sm:mx-6">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {!activeConversation ? (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center text-slate-500 dark:text-slate-400">
                  <Inbox className="h-10 w-10 text-secondary" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Pick a conversation</h3>
                  <p className="mt-2 max-w-md text-sm leading-6">
                    Choose an existing thread or create a new support chat to start messaging.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-secondary">Conversation</p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{activeConversation.title}</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {activeConversation.participants.map((participant) => participant.displayName).join(' | ')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void selectConversation(activeConversation.id)}
                      className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-secondary/40 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900"
                    >
                      Refresh thread
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
                    {isLoadingMessages ? (
                      <div className="flex h-full items-center justify-center text-slate-500 dark:text-slate-400">
                        <LoaderCircle className="h-5 w-5 animate-spin" />
                      </div>
                    ) : activeMessages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-center text-slate-500 dark:text-slate-400">
                        <div>
                          <MessageSquareText className="mx-auto h-10 w-10 text-secondary" />
                          <p className="mt-4 text-sm font-medium text-slate-900 dark:text-white">No messages yet</p>
                          <p className="mt-2 text-sm leading-6">Send the first message to start the thread.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeMessages.map((message) => (
                          <MessageBubble
                            key={message.id}
                            message={message}
                            isMine={message.senderType === currentUserRole}
                            onRetry={(messageId) => void retryMessage(messageId)}
                          />
                        ))}
                        <div ref={messageEndRef} />
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/60 sm:px-6">
                    <form onSubmit={onComposerSubmit} className="flex items-end gap-3">
                      <label className="sr-only" htmlFor="chat-message">
                        Message composer
                      </label>
                      <textarea
                        id="chat-message"
                        name="chat-message"
                        ref={composerRef}
                        rows={2}
                        placeholder="Write a message..."
                        aria-label="Write a message"
                        value={draftMessage}
                        onChange={(event) => setDraftMessage(event.target.value)}
                        className="min-h-[52px] flex-1 resize-none rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-secondary focus:ring-2 focus:ring-secondary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            const form = event.currentTarget.form;
                            form?.requestSubmit();
                          }
                        }}
                      />
                      <button
                        type="submit"
                        className="inline-flex h-12 items-center gap-2 rounded-2xl bg-secondary px-4 text-sm font-semibold text-white transition hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary/40 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                        Send
                      </button>
                    </form>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Press Enter to send, Shift+Enter for a new line.</p>
                  </div>
                </>
              )}
            </section>
          </div>

          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {announcement}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
