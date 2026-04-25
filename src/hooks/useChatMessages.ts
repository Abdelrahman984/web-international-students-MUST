import { useEffect, useRef, useState } from 'react';
import { getMessages } from '../services/chat/dotnetChatService';
import type { ChatMsg } from '../types/chat';

/**
 * Polls `/api/chat/messages/:conversationId` at two different intervals
 * depending on whether the browser tab is visible:
 *   - visible  → `activeIntervalMs`  (default 5 s)
 *   - hidden   → `hiddenIntervalMs`  (default 30 s)
 *
 * Follows the strategy described in chat.md §6.
 */
export function useChatMessages(
  conversationId: number | null,
  activeIntervalMs = 5000,
  hiddenIntervalMs = 30000,
) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Keep a stable ref so the interval callback always reads the latest value
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    // Utility: clear any running timer
    const stopTimer = () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    // Start a fresh polling loop at the given interval
    const startTimer = (intervalMs: number) => {
      stopTimer();
      timerRef.current = setInterval(() => {
        getMessages(conversationId)
          .then(setMessages)
          .catch((e: Error) => setError(e.message));
      }, intervalMs);
    };

    // Fetch immediately on mount / conversation change
    getMessages(conversationId)
      .then(setMessages)
      .catch((e: Error) => setError(e.message));

    // Begin polling at the appropriate rate
    const currentInterval =
      document.visibilityState === 'visible' ? activeIntervalMs : hiddenIntervalMs;
    startTimer(currentInterval);

    // Switch polling rate when the tab is hidden / shown
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Tab came back into focus — fetch immediately, then poll at active rate
        getMessages(conversationId)
          .then(setMessages)
          .catch((e: Error) => setError(e.message));
        startTimer(activeIntervalMs);
      } else {
        // Tab is hidden — slow down to preserve resources
        startTimer(hiddenIntervalMs);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [conversationId, activeIntervalMs, hiddenIntervalMs]);

  return { messages, error };
}
