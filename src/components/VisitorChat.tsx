import { useState, useEffect } from 'react';
import { getOrCreateVisitorId } from '../utils/visitorId';
import { startConversation, sendMessage, getMessages } from '../services/chat/dotnetChatService';
import type { ChatMsg } from '../types/chat';

// Fetching admin ID dynamically as suggested in chat.md
import { apiClient } from '../services/api';

export default function VisitorChat() {
  const visitorId = getOrCreateVisitorId();
  const [convId, setConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [adminUserId, setAdminUserId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Fetch admin user ID dynamically
    const fetchAdminId = async () => {
      try {
        const res = await apiClient.get('/api/advisor_profiles');
        // Find super admin or sudo
        const admin = res.data.find((a: any) => a.is_super_admin === true || a.email === 'sudo@must.edu.eg' || a.email === 'advisor@must.edu.eg');
        if (admin && admin.id) {
          setAdminUserId(admin.id);
        }
      } catch (err) {
        console.error('Failed to fetch admin ID for chat:', err);
      }
    };
    fetchAdminId();
  }, []);

  useEffect(() => {
    if (!adminUserId || !isOpen) return;
    
    startConversation(visitorId, adminUserId)
      .then((c) => {
        setConvId(c.conversationId);
        return getMessages(c.conversationId);
      })
      .then(setMessages)
      .catch(console.error);
  }, [adminUserId, visitorId, isOpen]);

  useEffect(() => {
    if (!convId || !isOpen) return;
    const id = setInterval(() => getMessages(convId).then(setMessages), 5000);
    return () => clearInterval(id);
  }, [convId, isOpen]);

  const handleSend = async () => {
    if (!convId || !input.trim()) return;
    const msg = await sendMessage(convId, visitorId, input.trim());
    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
          </svg>
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-80 h-96 flex flex-col overflow-hidden border border-gray-200">
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <h3 className="font-semibold">Support Chat</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-2">
            {messages.length === 0 && (
              <p className="text-center text-gray-500 text-sm mt-4">Connecting to support...</p>
            )}
            {messages.map((m) => (
              <div 
                key={m.id} 
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  m.senderId === visitorId 
                    ? 'bg-blue-600 text-white self-end rounded-br-none' 
                    : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'
                }`}
              >
                {m.content}
              </div>
            ))}
          </div>
          <div className="p-3 border-t bg-white flex gap-2">
            <input 
              className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-600"
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder="Type a message..."
              disabled={!convId}
            />
            <button 
              onClick={handleSend}
              disabled={!convId || !input.trim()}
              className="bg-blue-600 text-white rounded-full p-2 disabled:opacity-50"
            >
              <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
