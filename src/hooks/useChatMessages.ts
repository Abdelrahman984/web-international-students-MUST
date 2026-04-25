import { useEffect, useRef, useState } from 'react';
import { getMessages } from '../services/chat/dotnetChatService';
import type { ChatMsg } from '../types/chat';

export function useChatMessages(conversationId: number | null, intervalMs = 5000) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    // Immediate fetch
    getMessages(conversationId).then(setMessages).catch((e) => setError(e.message));

    // Periodic poll
    timerRef.current = setInterval(() => {
      getMessages(conversationId).then(setMessages).catch((e) => setError(e.message));
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [conversationId, intervalMs]);

  return { messages, error };
}
