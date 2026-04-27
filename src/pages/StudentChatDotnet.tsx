import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  startConversation,
  sendMessage,
  getMessages,
  getUserConversations,
  searchUsers,
  deleteConversation,
} from "../services/chat/dotnetChatService";
import type {
  ChatMsg,
  ChatConversation,
  ChatUserResult,
} from "../types/chat";
import {
  SearchIcon,
  SendIcon,
  MessageSquareIcon,
  UsersIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react";
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

function getConversationEmail(conv: ChatConversation, currentUserId: string): string {
  const others = conv.participants.filter((p) => p.userId !== currentUserId);
  if (others.length === 0) return "";
  return others[0].email || "Participant";
}

// Avatar initial letter for the conversation label
function getAvatarLetter(conv: ChatConversation, currentUserId: string): string {
  const others = conv.participants.filter((p) => p.userId !== currentUserId);
  if (others.length === 0) return "#";
  const p = others[0];
  if (p.name) return p.name.charAt(0).toUpperCase();
  if (p.email) return p.email.charAt(0).toUpperCase();
  const uid = p.userId ?? "";
  return uid.startsWith("visitor-") ? "V" : "U";
}

export default function StudentChatDotnet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id || "";
  const currentUserName = user?.displayName || user?.username || "You";

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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Auto-scroll whenever messages update ────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    void loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // ── Poll conversation list every 10 s to catch new inbound threads ──────
  useEffect(() => {
    if (!currentUserId) return;
    const interval = setInterval(() => {
      getUserConversations(currentUserId)
        .then(setConversations)
        .catch(console.error);
    }, 10000);
    return () => clearInterval(interval);
  }, [currentUserId]);

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
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;
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

  // ── Guard: no identity ────────────────────────────────────────────
  if (!currentUserId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <MessageSquareIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium mb-1">Identity not found</p>
          <p className="text-sm">Please log in again to use the chat system.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Get the active conversation object for the header ──────────────────
  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-xl">
      {/* ═══════════════════════════════════════════════════════════════════
          LEFT SIDEBAR — search + conversation list
      ═══════════════════════════════════════════════════════════════════ */}
      <aside className="w-80 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/50 backdrop-blur-sm">
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
                onKeyDown={(e) => e.key === "Enter" && void handleSearch()}
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
                  <span className="font-bold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">
                    {u.name ?? "Unknown"}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 truncate opacity-70">
                    {u.email}
                  </span>
                </button>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchQuery.length >= 2 && !isSearching && (
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
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">No chats yet</p>
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
              (p) => p.userId !== currentUserId && (p.userId ?? "").startsWith("visitor-"),
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
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-sm transition-all ${
                    isVisitor
                      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
                      : isActive
                      ? "bg-green-600 text-white shadow-green-600/20"
                      : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700"
                  }`}
                >
                  {avatarLetter}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <p
                      className={`text-sm font-bold truncate leading-tight transition-colors ${
                        isActive ? "text-green-600" : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {label}
                    </p>
                    <span className="text-[10px] text-gray-400 font-medium tabular-nums">
                      {previewTime}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-medium opacity-80 mb-1">
                    {email}
                  </p>
                  {preview ? (
                    <p className={`text-[11px] truncate opacity-70 ${isActive ? "text-green-700/70 dark:text-green-400/70" : "text-gray-500 dark:text-gray-400"}`}>
                      {preview}
                    </p>
                  ) : (
                    <p className="text-[11px] italic text-gray-400 opacity-60">No messages yet</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT PANE — message thread
      ═══════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
        {/* ── Thread header ─────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0 border border-green-100 dark:border-green-900/30">
              <MessageSquareIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">
                {activeConv ? getConversationLabel(activeConv, currentUserId) : "Direct Messages"}
              </h2>
              {activeConv && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium truncate">
                    {getConversationEmail(activeConv, currentUserId)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {activeConvId && (
            <button
              onClick={() => void handleDeleteConversation()}
              className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 border border-red-100 dark:border-red-900/30 flex items-center justify-center transition-all duration-200 group"
              title="Delete Conversation"
            >
              <Trash2Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          )}
        </div>

        {/* ── Messages ──────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 flex flex-col gap-4 bg-gray-50/30 dark:bg-slate-950/30">
          {!activeConvId && (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-24 h-24 bg-green-600/10 rounded-[2.5rem] flex items-center justify-center mb-6 rotate-12">
                <MessageSquareIcon className="w-10 h-10 text-green-600 -rotate-12" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your Conversations</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                Select a chat from the sidebar or start a new one to begin messaging.
              </p>
            </div>
          )}

          {activeConvId && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 py-20 text-gray-400">
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-full flex items-center justify-center mb-4">
                <SendIcon className="w-6 h-6 opacity-40" />
              </div>
              <p className="text-sm font-medium">Send the first message to start the conversation!</p>
            </div>
          )}

          {messages.map((m, idx) => {
            const isMe = m.senderId === currentUserId;
            const showAvatar = idx === 0 || messages[idx - 1].senderId !== m.senderId;
            const isVisitorMsg = !isMe && (m.senderId ?? "").startsWith("visitor-");

            return (
              <div
                key={m.id}
                className={`flex items-end gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
              >
                {!isMe && (
                  <div className="w-8 h-8 flex-shrink-0">
                    {showAvatar ? (
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-sm ${
                        isVisitorMsg
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40"
                          : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700"
                      }`}>
                        {isVisitorMsg ? "V" : getAvatarLetter(activeConv!, currentUserId)}
                      </div>
                    ) : null}
                  </div>
                )}
                
                <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                      isMe
                        ? "bg-green-600 text-white rounded-br-none"
                        : "bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-bl-none"
                    }`}
                  >
                    <p>{m.content}</p>
                  </div>
                  <span className={`text-[9px] mt-1.5 font-bold uppercase tracking-widest ${isMe ? "text-gray-400 mr-1" : "text-gray-400 ml-1"}`}>
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {isMe && <div className="w-8 flex-shrink-0" />}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Message input ─────────────────────────────────────────────── */}
        <div className="px-6 py-5 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {activeConvId ? (
            <div className="flex gap-3 items-end bg-gray-50 dark:bg-slate-950 p-2 rounded-2xl border border-gray-200 dark:border-slate-800 focus-within:border-green-600/50 focus-within:ring-4 focus-within:ring-green-600/5 transition-all">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write a message..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white placeholder-gray-400 py-2.5 px-3 resize-none max-h-32 scrollbar-thin"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              <button
                onClick={() => void handleSend()}
                disabled={!input.trim() || isSending}
                className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg shadow-green-600/20 mb-0.5"
                title="Send message"
              >
                <SendIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center py-2.5">
              <p className="text-xs font-medium text-gray-400">
                Select a recipient to start messaging
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

