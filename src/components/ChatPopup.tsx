import { useEffect, useRef, useState } from "react";
import {
  startConversation,
  sendMessage,
  getMessages,
  getUserConversations,
  searchUsers,
  deleteConversation,
} from "../services/chat/dotnetChatService";
import type { ChatMsg, ChatConversation, ChatUserResult } from "../types/chat";
import {
  SearchIcon,
  SendIcon,
  MessageSquareIcon,
  UsersIcon,
  RefreshCwIcon,
  Trash2Icon,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ---------------------------------------------------------------------------
// Derive a human-readable label for a conversation from its participant list.
// Shows the non-current participant — visitor tokens are given a friendly label.
// ---------------------------------------------------------------------------
function getConversationLabel(
  conv: ChatConversation,
  currentUserId: string,
): string {
  const others = conv.participants.filter((p) => p.userId !== currentUserId);
  if (others.length === 0) return `Conversation #${conv.id}`;
  const p = others[0];
  if (p.name) return p.name;
  if (p.email) return p.email;
  const uid = p.userId ?? "";
  if (uid.startsWith("visitor-")) {
    return `Visitor (${uid.slice(8, 16)}…)`;
  }
  return `User ${uid.slice(0, 8)}…`;
}

function getConversationEmail(
  conv: ChatConversation,
  currentUserId: string,
): string {
  const others = conv.participants.filter((p) => p.userId !== currentUserId);
  if (others.length === 0) return "";
  return others[0].email || "Participant";
}

// Avatar initial letter for the conversation label
function getAvatarLetter(
  conv: ChatConversation,
  currentUserId: string,
): string {
  const others = conv.participants.filter((p) => p.userId !== currentUserId);
  if (others.length === 0) return "#";
  const p = others[0];
  if (p.name) return p.name.charAt(0).toUpperCase();
  if (p.email) return p.email.charAt(0).toUpperCase();
  const uid = p.userId ?? "";
  return uid.startsWith("visitor-") ? "V" : "U";
}

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  prefillSearchQuery?: string;
}

export function ChatPopup({
  isOpen,
  onClose,
  prefillSearchQuery,
}: ChatPopupProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentUserId = user?.id || "";
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ChatUserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // ── Auto-scroll whenever new messages arrive or conversation changes ──
  const prevMessagesLengthRef = useRef(0);
  const prevConvIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      activeConvId !== prevConvIdRef.current ||
      messages.length > prevMessagesLengthRef.current
    ) {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }
    prevMessagesLengthRef.current = messages.length;
    prevConvIdRef.current = activeConvId;
  }, [messages, activeConvId]);

  // ── Load ALL conversations on mount ────────────────────────
  const loadConversations = async () => {
    if (!currentUserId) {
      setLoadingConvs(false);
      return;
    }
    try {
      const all = await getUserConversations(currentUserId);
      setConversations(all);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, isOpen]);

  // ── Poll conversation list every 10 s to catch new inbound threads ──────
  useEffect(() => {
    if (!currentUserId || !isOpen) return;
    const interval = setInterval(() => {
      getUserConversations(currentUserId)
        .then(setConversations)
        .catch(console.error);
    }, 10000);
    return () => clearInterval(interval);
  }, [currentUserId, isOpen]);

  // ── Load messages when a conversation is selected ──────────────────────
  useEffect(() => {
    if (!activeConvId) return;
    getMessages(activeConvId).then(setMessages).catch(console.error);
  }, [activeConvId]);

  // ── Poll for new messages every 5 s while a conversation is active ─────
  useEffect(() => {
    if (!activeConvId) return;
    const interval = setInterval(() => {
      getMessages(activeConvId).then(setMessages).catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeConvId]);

  // ── Search users by name / email / phone ───────────────────────────────
  const handleSearch = async () => {
    if (!currentUserId || searchQuery.trim().length < 2) return;
    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery.trim(), currentUserId);
      setSearchResults(results);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const nextQuery = prefillSearchQuery?.trim() ?? "";
    if (nextQuery.length >= 2) {
      setActiveConvId(null);
      setSearchQuery(nextQuery);
    }
  }, [isOpen, prefillSearchQuery]);

  // ── Start or resume a conversation with a searched user ────────────────
  const handleStartChat = async (targetUser: ChatUserResult) => {
    if (!currentUserId || !targetUser.id) return;
    try {
      const conv = await startConversation(currentUserId, targetUser.id);
      setActiveConvId(conv.conversationId);
      // Refresh the sidebar so the new (or resumed) conversation appears
      const updated = await getUserConversations(currentUserId);
      setConversations(updated);
      setSearchResults([]);
      setSearchQuery("");
    } catch (err) {
      console.error("Failed to start conversation:", err);
    }
  };

  // ── Send a message to the active conversation ──────────────────────────
  const handleSend = async () => {
    if (!activeConvId || !input.trim() || !currentUserId || isSending) return;
    setIsSending(true);
    try {
      const msg = await sendMessage(activeConvId, currentUserId, input.trim());
      // Optimistic append — the next poll will confirm
      setMessages((prev) => [...prev, msg]);
      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  // ── Manual refresh button ───────────────────────────────────────────────
  const handleRefresh = async () => {
    if (!currentUserId || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const all = await getUserConversations(currentUserId);
      setConversations(all);
      if (activeConvId) {
        const msgs = await getMessages(activeConvId);
        setMessages(msgs);
      }
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeConvId) return;
    if (!window.confirm("Are you sure you want to delete this conversation?"))
      return;
    try {
      await deleteConversation(activeConvId);
      setActiveConvId(null);
      setConversations((prev) => prev.filter((c) => c.id !== activeConvId));
      setMessages([]);
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      alert("Failed to delete conversation.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // Get the active conversation object for the header
  const activeConv = conversations.find((c) => c.id === activeConvId);

  if (!isOpen) return null;
  if (!currentUserId) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-[999]" onClick={onClose} />
        <div className="fixed bottom-4 right-20 z-[999] max-w-[calc(100vw-2rem)] flex">
          <div className="flex h-[280px] w-[384px] bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-2xl flex-col">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/20">
                  <MessageSquareIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                  Messages
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all duration-200"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <MessageSquareIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium mb-1 text-gray-900 dark:text-white">
                  Login required
                </p>
                <p className="text-sm">
                  Please log in to start chatting with students, advisors, and
                  admins.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    navigate("/login");
                  }}
                  className="mt-4 px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[999]" onClick={onClose} />

      {/* Modal */}
      <div
        className="fixed bottom-4 right-20 z-[999] max-w-[calc(100vw-2rem)] flex"
        style={{ width: activeConvId ? "600px" : "384px" }}
      >
        <div className="flex h-[450px] bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-2xl flex-1 flex-col">
          {/* ═══════════════════════════════════════════════════════════════════
              LEFT SIDEBAR — search + conversation list
          ═══════════════════════════════════════════════════════════════════ */}
          {!activeConvId && (
            <aside className="w-full flex flex-col border-r border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 backdrop-blur-sm flex-shrink-0">
              {/* ── Header ───────────────────────────────────────────────────── */}
              <div className="px-5 py-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/20">
                    <MessageSquareIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                    Messages
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => void handleRefresh()}
                    disabled={isRefreshing}
                    title="Refresh conversations"
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all duration-200 disabled:opacity-50"
                  >
                    <RefreshCwIcon
                      className={`w-4 h-4 ${isRefreshing ? "animate-spin text-green-600" : ""}`}
                    />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all duration-200"
                    title="Close chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ── Search new user ───────────────────────────────────────────── */}
              <div className="p-4 border-b border-gray-200 dark:border-slate-800">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em] mb-3 px-1">
                  New Chat
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1 group">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && void handleSearch()
                      }
                      placeholder="Search by name or email…"
                      className="w-full pl-10 pr-3 py-2 text-xs border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all shadow-sm"
                    />
                  </div>
                  <button
                    onClick={() => void handleSearch()}
                    disabled={isSearching || searchQuery.trim().length < 2}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg shadow-green-600/10 text-xs font-bold"
                  >
                    {isSearching ? "..." : "Go"}
                  </button>
                </div>

                {/* Search results */}
                {searchResults.length > 0 && (
                  <div className="mt-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {searchResults.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => void handleStartChat(u)}
                        className="w-full text-left px-4 py-3 text-xs hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors flex flex-col gap-1 border-b border-gray-100 dark:border-slate-800 last:border-0 group"
                      >
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {u.name || u.email}
                        </span>
                        {u.email && (
                          <span className="text-gray-500 dark:text-gray-400">
                            {u.email}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.length === 0 &&
                  searchQuery.length >= 2 &&
                  !isSearching && (
                    <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400 text-center bg-gray-100 dark:bg-slate-800 py-2 rounded-lg">
                      No results for "{searchQuery}"
                    </p>
                  )}
              </div>

              {/* ── Conversation list ─────────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-700">
                <div className="px-5 py-3 flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  <UsersIcon className="w-3 h-3" />
                  <span>
                    {conversations.length === 0
                      ? "No Chats"
                      : `${conversations.length} Active ${conversations.length === 1 ? "Chat" : "Chats"}`}
                  </span>
                </div>

                {loadingConvs && (
                  <div className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-800 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-3/4" />
                      <div className="h-2 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                )}

                {!loadingConvs && conversations.length === 0 && (
                  <div className="px-8 py-10 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-slate-700">
                      <MessageSquareIcon className="w-8 h-8 opacity-20 text-gray-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                      No chats yet
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Find a student, advisor, or admin to start a conversation.
                    </p>
                  </div>
                )}

                {conversations.map((c) => {
                  const isActive = activeConvId === c.id;
                  const label = getConversationLabel(c, currentUserId);
                  const email = getConversationEmail(c, currentUserId);
                  const avatarLetter = getAvatarLetter(c, currentUserId);
                  const isVisitor = c.participants.some(
                    (p) =>
                      p.userId !== currentUserId &&
                      (p.userId ?? "").startsWith("visitor-"),
                  );
                  const preview = c.lastMessage?.content ?? null;
                  const previewTime = c.lastMessage
                    ? new Date(c.lastMessage.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : new Date(c.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      });

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveConvId(c.id)}
                      className={`w-full text-left px-5 py-4 flex items-start gap-4 transition-all relative border-b border-gray-100 dark:border-slate-800/50 ${
                        isActive
                          ? "bg-green-50 dark:bg-green-600/5"
                          : "hover:bg-white dark:hover:bg-slate-800/50"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-4 bottom-4 w-1 bg-green-600 rounded-r-full shadow-[0_0_8px_rgba(22,163,74,0.5)]" />
                      )}

                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border text-xs font-bold ${
                          isVisitor
                            ? "border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400"
                            : "border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {avatarLetter}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {label}
                          </h4>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0">
                            {previewTime}
                          </span>
                        </div>
                        {email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-1.5">
                            {email}
                          </p>
                        )}
                        {preview && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate opacity-75">
                            {preview}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
            RIGHT PANE — message thread (shown when a conversation is active)
        ═══════════════════════════════════════════════════════════════════ */}
          {activeConvId && (
            <>
              {/* ── Thread header ─────────────────────────────────────────────── */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => setActiveConvId(null)}
                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 flex items-center justify-center transition-all duration-200"
                    title="Back to chat list"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0 border border-green-100 dark:border-green-900/30">
                    <MessageSquareIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">
                      {activeConv
                        ? getConversationLabel(activeConv, currentUserId)
                        : "Conversation"}
                    </h2>
                    {activeConv && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {getConversationEmail(activeConv, currentUserId)}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => void handleDeleteConversation()}
                  className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 border border-red-100 dark:border-red-900/30 flex items-center justify-center transition-all duration-200 group"
                  title="Delete Conversation"
                >
                  <Trash2Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>

                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-slate-700 flex items-center justify-center transition-all duration-200 ml-2"
                  title="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── Messages ──────────────────────────────────────────────────── */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto scrollbar-thin p-4 flex flex-col gap-3 bg-gray-50/30 dark:bg-slate-950/30"
              >
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center flex-1 py-20 text-gray-400">
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-4">
                      <SendIcon className="w-6 h-6 opacity-40" />
                    </div>
                    <p className="text-sm font-medium">
                      Send the first message to start the conversation!
                    </p>
                  </div>
                )}

                {messages.map((m, idx) => {
                  const isMe = m.senderId === currentUserId;
                  const showAvatar =
                    idx === 0 || messages[idx - 1].senderId !== m.senderId;
                  const isVisitorMsg =
                    !isMe && (m.senderId ?? "").startsWith("visitor-");

                  return (
                    <div
                      key={idx}
                      className={`flex gap-2.5 ${isMe ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}
                    >
                      {!isMe && showAvatar && (
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                            isVisitorMsg
                              ? "border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400"
                              : "border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {getAvatarLetter(
                            activeConv ||
                              ({
                                participants: [{ userId: m.senderId }],
                              } as ChatConversation),
                            currentUserId,
                          )}
                        </div>
                      )}
                      {!isMe && !showAvatar && (
                        <div className="w-6 h-6 flex-shrink-0" />
                      )}

                      <div
                        className={`max-w-xs px-4 py-2.5 rounded-2xl ${
                          isMe
                            ? "bg-green-600 text-white rounded-br-none"
                            : "bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm leading-relaxed break-words">
                          {m.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${isMe ? "text-green-100" : "text-gray-500 dark:text-gray-400"}`}
                        >
                          {new Date(m.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Message input ─────────────────────────────────────────────── */}
              <div className="px-4 py-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex gap-2 items-end bg-gray-50 dark:bg-slate-950 p-2 rounded-2xl border border-gray-200 dark:border-slate-800 focus-within:border-green-600/50 focus-within:ring-4 focus-within:ring-green-600/5 transition-all">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Write a message…"
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white placeholder-gray-400 py-2.5 px-3 resize-none max-h-32 scrollbar-thin"
                    style={{ height: "auto" }}
                    onInput={(e) => {
                      const target = e.currentTarget;
                      target.style.height = "auto";
                      target.style.height =
                        Math.min(target.scrollHeight, 128) + "px";
                    }}
                  />
                  <button
                    onClick={() => void handleSend()}
                    disabled={!input.trim() || isSending}
                    className="flex-shrink-0 w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white flex items-center justify-center transition-all shadow-lg shadow-green-600/10"
                  >
                    <SendIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
