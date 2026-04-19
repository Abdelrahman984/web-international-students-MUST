import { createApiChatProvider } from './apiChatProvider';
import { createMockChatProvider } from './mockChatProvider';
import type { ChatProvider, ChatProviderCurrentUser } from './types';

export type ChatProviderMode = 'mock' | 'api';

const getEnv = () => import.meta.env as ImportMetaEnv & Record<string, string | undefined>;

export const getChatProviderMode = (): ChatProviderMode => {
  const env = getEnv();
  const rawProvider = (env.CHAT_PROVIDER ?? env.VITE_CHAT_PROVIDER ?? 'api').toLowerCase();

  return rawProvider === 'api' ? 'api' : 'mock';
};

export const createChatProvider = (currentUser?: ChatProviderCurrentUser): ChatProvider => {
  return getChatProviderMode() === 'api' ? createApiChatProvider(currentUser) : createMockChatProvider(currentUser);
};

export * from './types';
