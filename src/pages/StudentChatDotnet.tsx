import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChatMessages } from '../hooks/useChatMessages';
import { startConversation, sendMessage } from '../services/chat/dotnetChatService';
import { apiClient } from '../services/api';
import { SendIcon } from 'lucide-react';

export default function StudentChatDotnet() {
  const { user } = useAuth();
  const [convId, setConvId] = useState<number | null>(null);
  const [advisorName, setAdvisorName] = useState<string>('Academic Advisor');
  const [input, setInput] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // The student's .NET Identity user-id (GUID string)
  const studentId = user?.id?.toString();

  // ── Scroll to bottom whenever messages update ──────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  // ── Resolve the advisor and start / resume the conversation ───────────
  useEffect(() => {
    async function initChat() {
      if (!studentId) {
        setIsInitializing(false);
        return;
      }
      try {
        // Fetch advisor profiles to find the admin/advisor account
        const res = await apiClient.get('/api/advisor_profiles');
        const advisor = res.data.find(
          (a: any) =>
            a.email === 'advisor@must.edu.eg' ||
            a.is_super_admin === true ||
            a.email === 'sudo@must.edu.eg',
        );

        if (advisor?.id) {
          // Use the advisor's display name if available
          const displayName =
            advisor.full_name || advisor.email || 'Academic Advisor';
          setAdvisorName(displayName);

          // Start or resume the conversation between student and advisor
          const conv = await startConversation(studentId, advisor.id);
          setConvId(conv.conversationId);
        }
      } catch (err) {
        console.error('Failed to initialize chat:', err);
      } finally {
        setIsInitializing(false);
      }
    }

    void initChat();
  }, [studentId]);

  // ── Visibility-based polling: 5 s active, 30 s hidden ─────────────────
  const { messages, error } = useChatMessages(convId, 5000, 30000);

  // ── Send a message ──────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!convId || !studentId || !input.trim() || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(convId, studentId, input.trim());
      setInput('');
      // The polling hook will pick up the new message on the next tick;
      // no optimistic update needed here since the hook refreshes every 5 s.
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // ── Loading / auth guards ───────────────────────────────────────────────
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading chat…
      </div>
    );
  }

  if (!studentId) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Please log in to use the chat.
      </div>
    );
  }

  if (!convId) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No advisor is available at the moment. Please try again later.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 h-[600px] flex flex-col bg-white rounded-xl shadow border border-gray-200">
      {/* Header */}
      <div className="bg-blue-600 text-white px-5 py-4 rounded-t-xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
          {advisorName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-base font-semibold leading-none">
            {advisorName}
          </h2>
          <p className="text-xs text-blue-200 mt-0.5">Academic Advisor</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
        {error && (
          <p className="text-center text-red-500 text-sm">{error}</p>
        )}

        {messages.length === 0 && !error && (
          <p className="text-center text-gray-400 text-sm mt-6">
            Send a message to start the conversation.
          </p>
        )}

        {messages.map((m) => {
          const isMe = m.senderId === studentId;
          return (
            <div
              key={m.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}
              >
                <p className="leading-relaxed">{m.content}</p>
                <span
                  className={`text-[10px] mt-1 block ${
                    isMe ? 'text-blue-200' : 'text-gray-400'
                  }`}
                >
                  {new Date(m.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          );
        })}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-4 border-t bg-white flex gap-3 items-center rounded-b-xl">
        <input
          className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-colors"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message…"
          disabled={isSending}
        />
        <button
          onClick={() => void handleSend()}
          disabled={!input.trim() || isSending}
          className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors flex-shrink-0"
          title="Send"
        >
          <SendIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
