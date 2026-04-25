import { useState, useEffect, useRef } from 'react';
import { getOrCreateVisitorId } from '../utils/visitorId';
import { startConversation, sendMessage } from '../services/chat/dotnetChatService';
import { useChatMessages } from '../hooks/useChatMessages';
import { apiClient } from '../services/api';

/**
 * VisitorChat — floating support-chat widget for unauthenticated visitors.
 *
 * Constraints (enforced by backend per chat.md §5):
 *   - Visitors can ONLY message the admin; any other target returns 400.
 *   - GET /api/chat/search is blocked for visitor tokens (403).
 *   - The search input is therefore hidden entirely.
 */
export default function VisitorChat() {
  const visitorId = getOrCreateVisitorId();

  const [convId, setConvId] = useState<number | null>(null);
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Resolve admin user-id from advisor_profiles once on mount ──────────
  useEffect(() => {
    const fetchAdminId = async () => {
      try {
        const res = await apiClient.get('/api/advisor_profiles');
        // Target the super-admin or the known admin email
        const admin = res.data.find(
          (a: any) =>
            a.is_super_admin === true ||
            a.email === 'sudo@must.edu.eg' ||
            a.email === 'advisor@must.edu.eg',
        );
        if (admin?.id) {
          setAdminUserId(admin.id);
        }
      } catch (err) {
        console.error('VisitorChat: failed to fetch admin ID:', err);
      }
    };
    void fetchAdminId();
  }, []);

  // ── Start the conversation when the widget is first opened ────────────
  useEffect(() => {
    if (!adminUserId || !isOpen || convId) return;

    startConversation(visitorId, adminUserId)
      .then((c) => setConvId(c.conversationId))
      .catch(console.error);
  }, [adminUserId, visitorId, isOpen, convId]);

  // ── Poll messages via hook (5 s active, 30 s hidden) ──────────────────
  const { messages } = useChatMessages(isOpen ? convId : null, 5000, 30000);

  // ── Auto-scroll to latest message ─────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // ── Send a message ──────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!convId || !input.trim() || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(convId, visitorId, input.trim());
      setInput('');
      // The polling hook will pick up the new message on next interval
    } catch (err) {
      console.error('VisitorChat: failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* ── Chat window ────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 h-[420px] flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
            <div>
              <h3 className="font-semibold text-sm leading-none">
                Support Chat
              </h3>
              <p className="text-blue-200 text-xs mt-0.5">
                We typically reply quickly
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-200 transition-colors p-1 rounded"
              aria-label="Close chat"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-2">
            {!convId && (
              <p className="text-center text-gray-500 text-xs mt-4">
                Connecting to support…
              </p>
            )}

            {convId && messages.length === 0 && (
              <p className="text-center text-gray-400 text-xs mt-4">
                Hi! How can we help you today?
              </p>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.senderId === visitorId
                    ? 'bg-blue-600 text-white self-end rounded-br-none'
                    : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'
                }`}
              >
                {m.content}
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white flex gap-2 flex-shrink-0">
            <input
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
              disabled={!convId || isSending}
            />
            <button
              onClick={() => void handleSend()}
              disabled={!convId || !input.trim() || isSending}
              className="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors flex-shrink-0"
              aria-label="Send message"
            >
              <svg
                className="w-4 h-4 transform rotate-90"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Toggle button ───────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isOpen
            ? 'bg-gray-700 hover:bg-gray-800'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        aria-label={isOpen ? 'Close support chat' : 'Open support chat'}
      >
        {isOpen ? (
          /* X icon */
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          /* Chat bubble icon */
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
