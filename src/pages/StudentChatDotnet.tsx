import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChatMessages } from '../hooks/useChatMessages';
import { startConversation, sendMessage } from '../services/chat/dotnetChatService';
import { apiClient } from '../services/api';

export default function StudentChatDotnet() {
  const { user } = useAuth();
  const [convId, setConvId] = useState<number | null>(null);
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  // The student identity id
  const studentId = user?.id?.toString();

  useEffect(() => {
    async function initChat() {
      if (!studentId) {
        setIsInitializing(false);
        return;
      }
      try {
        // Find advisor
        const res = await apiClient.get('/api/advisor_profiles');
        const advisor = res.data.find((a: any) => a.email === 'advisor@must.edu.eg' || a.is_super_admin === true || a.email === 'sudo@must.edu.eg');
        
        if (advisor && advisor.id) {
          setAdvisorId(advisor.id);
          // Start or resume conversation
          const conv = await startConversation(studentId, advisor.id);
          setConvId(conv.conversationId);
        }
      } catch (err) {
        console.error('Failed to initialize chat:', err);
      } finally {
        setIsInitializing(false);
      }
    }

    initChat();
  }, [studentId]);

  // Use our polling hook to get real-time-ish messages
  // Decrease polling interval if tab is hidden (optional optimization as described in chat.md, simplified here to 5s)
  const { messages, error } = useChatMessages(convId, 5000);

  const handleSend = async () => {
    if (!convId || !studentId || !input.trim()) return;
    try {
      await sendMessage(convId, studentId, input.trim());
      setInput('');
      // Polling will pick up the new message shortly, but we could optimistic-update if we wanted.
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (isInitializing) {
    return <div className="p-8 text-center text-gray-500">Loading chat...</div>;
  }

  if (!studentId) {
    return <div className="p-8 text-center text-gray-500">Please log in to use the chat.</div>;
  }

  if (!advisorId) {
    return <div className="p-8 text-center text-gray-500">No advisor available at the moment.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto h-[600px] flex flex-col bg-white rounded-lg shadow-sm border mt-8">
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">Chat with Academic Advisor</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        {messages.length === 0 && !error && (
          <p className="text-center text-gray-400 mt-4">Send a message to start the conversation.</p>
        )}
        {messages.map((m) => {
          const isMe = m.senderId === studentId;
          return (
            <div 
              key={m.id} 
              className={`max-w-[75%] rounded-lg px-4 py-2 ${
                isMe 
                  ? 'bg-blue-600 text-white self-end rounded-br-none' 
                  : 'bg-white text-gray-800 self-start border rounded-bl-none shadow-sm'
              }`}
            >
              <p>{m.content}</p>
              <span className={`text-[10px] opacity-75 mt-1 block ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t bg-white flex gap-2 rounded-b-lg">
        <input 
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
          placeholder="Type your message here..."
          disabled={!convId}
        />
        <button 
          onClick={handleSend}
          disabled={!convId || !input.trim()}
          className="bg-blue-600 text-white rounded-lg px-6 py-2 font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
