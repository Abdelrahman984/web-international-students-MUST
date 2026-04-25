# Chat System — Frontend Integration Guide

> **Backend base URL** → configured in each project's environment file  
> **Controller route prefix** → `/api/chat`  
> **Auth** → all endpoints are open (no JWT required for the call itself), but the caller must pass their own Identity user `id` in the body/query so the backend can enforce participant rules.

---

## Table of Contents

1. [API Contract (quick reference)](#1-api-contract-quick-reference)
2. [TypeScript types to add / reuse](#2-typescript-types)
3. [Admin Dashboard integration (`front-admin`)](#3-admin-dashboard-integration)
4. [Student Portal integration (`front-usr`)](#4-student-portal-integration)
5. [Visitor flow (no account)](#5-visitor-flow)
6. [Polling strategy (non-real-time)](#6-polling-strategy)
7. [Common pitfalls](#7-common-pitfalls)

---

## 1. API Contract (quick reference)

| Method | Endpoint | Body / Query | Returns |
|--------|----------|--------------|---------|
| `POST` | `/api/chat/start` | `{ senderId, receiverId }` | `{ conversationId, createdAt, isNew }` |
| `POST` | `/api/chat/send` | `{ conversationId, senderId, content }` | `ChatMessage` object |
| `GET` | `/api/chat/messages/{conversationId}` | — | `ChatMessage[]` (asc by timestamp) |
| `GET` | `/api/chat/user/{userId}` | — | `ChatConversation[]` with participants |
| `GET` | `/api/chat/search?query=&requesterId=` | query string | `UserSearchResult[]` (max 10) |

### Response shapes

```ts
// POST /api/chat/start
interface StartConversationResponse {
  conversationId: number;
  createdAt: string;   // ISO-8601
  isNew: boolean;
}

// POST /api/chat/send  &  GET /api/chat/messages/:id  items
interface ChatMessageResponse {
  id: number;
  conversationId: number;
  senderId: string;    // Identity user id OR "visitor-<uuid>"
  content: string;
  timestamp: string;   // ISO-8601
}

// GET /api/chat/user/:userId  items
interface ConversationResponse {
  id: number;
  createdAt: string;
  participants: ParticipantResponse[];
}
interface ParticipantResponse {
  id: number;
  conversationId: number;
  userId: string;
}

// GET /api/chat/search  items
interface UserSearchResult {
  id: string;          // Identity user id (GUID string)
  name: string | null;
  email: string | null;
}
```

---

## 2. TypeScript types

### 2a. Shared types file

Create one shared types file that **both** projects can copy-paste (or put in a shared package):

```ts
// types/chat.ts  (add to each project)

export interface ChatConversationSummary {
  conversationId: number;
  createdAt: string;
  isNew: boolean;
}

export interface ChatMsg {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: number;
  createdAt: string;
  participants: { id: number; conversationId: number; userId: string }[];
}

export interface ChatUserResult {
  id: string;
  name: string | null;
  email: string | null;
}
```

---

## 3. Admin Dashboard integration (`front-admin`)

> Files live under `src/` in  
> `d:\zero un it\Internet A\front-admin\admin-dashboard-international-students-MUST`

### 3a. How admin identity works

The admin project stores the decoded JWT in `localStorage` under the key **`auth_profile`** (see `src/services/authService.ts`):

```ts
// already in authService.ts — no change needed
const decoded: any = jwtDecode(token);
const profile: AdvisorProfile = {
  id: decoded.nameid || decoded.sub,   // this is the Identity user id
  ...
};
localStorage.setItem('auth_profile', JSON.stringify(profile));
```

To get the admin's user id anywhere:
```ts
const profileRaw = localStorage.getItem('auth_profile');
const adminId: string = profileRaw ? JSON.parse(profileRaw).id : '';
```

### 3b. Create `src/services/chatService.ts`

```ts
import { api } from '../lib/axios';
import type {
  ChatConversationSummary,
  ChatMsg,
  ChatConversation,
  ChatUserResult,
} from '../types/chat';

const BASE = '/chat';

/** Start or resume a conversation between two Identity users. */
export async function startConversation(
  senderId: string,
  receiverId: string,
): Promise<ChatConversationSummary> {
  const res = await api.post<ChatConversationSummary>(`${BASE}/start`, {
    senderId,
    receiverId,
  });
  return res.data;
}

/** Send a message to an existing conversation. */
export async function sendMessage(
  conversationId: number,
  senderId: string,
  content: string,
): Promise<ChatMsg> {
  const res = await api.post<ChatMsg>(`${BASE}/send`, {
    conversationId,
    senderId,
    content,
  });
  return res.data;
}

/** Fetch all messages for a conversation (oldest first). */
export async function getMessages(conversationId: number): Promise<ChatMsg[]> {
  const res = await api.get<ChatMsg[]>(`${BASE}/messages/${conversationId}`);
  return res.data;
}

/** Fetch all conversations the user participates in. */
export async function getUserConversations(userId: string): Promise<ChatConversation[]> {
  const res = await api.get<ChatConversation[]>(`${BASE}/user/${userId}`);
  return res.data;
}

/**
 * Search users by email, name, or phone.
 * Pass requesterId so the backend can block visitor tokens.
 */
export async function searchUsers(
  query: string,
  requesterId?: string,
): Promise<ChatUserResult[]> {
  const params: Record<string, string> = { query };
  if (requesterId) params.requesterId = requesterId;
  const res = await api.get<ChatUserResult[]>(`${BASE}/search`, { params });
  return res.data;
}
```

> **Why no extra auth header?** The `api` axios instance in `src/lib/axios.ts` already attaches `Authorization: Bearer <token>` from `localStorage.auth_token` on every request via its interceptor.

### 3c. How to wire it into a component

The admin panel uses `useAuth()` from `src/contexts/AuthContext.tsx`, which exposes `profile` (type `AdvisorProfile`).

```tsx
// src/pages/ChatPage.tsx  (new file)
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  startConversation,
  sendMessage,
  getMessages,
  getUserConversations,
  searchUsers,
} from '../services/chatService';
import type { ChatMsg, ChatConversation, ChatUserResult } from '../types/chat';

export default function ChatPage() {
  const { profile } = useAuth();
  const adminId = profile?.id ?? '';

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChatUserResult[]>([]);

  // Load admin's conversations on mount
  useEffect(() => {
    if (!adminId) return;
    getUserConversations(adminId).then(setConversations).catch(console.error);
  }, [adminId]);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (!activeConvId) return;
    getMessages(activeConvId).then(setMessages).catch(console.error);
  }, [activeConvId]);

  // Poll for new messages every 5 s
  useEffect(() => {
    if (!activeConvId) return;
    const interval = setInterval(() => {
      getMessages(activeConvId).then(setMessages).catch(console.error);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeConvId]);

  // Open / start a conversation with a searched user
  const handleStartChat = async (targetUser: ChatUserResult) => {
    const conv = await startConversation(adminId, targetUser.id);
    setActiveConvId(conv.conversationId);
    const updated = await getUserConversations(adminId);
    setConversations(updated);
  };

  // Send a message
  const handleSend = async () => {
    if (!activeConvId || !input.trim() || !adminId) return;
    const msg = await sendMessage(activeConvId, adminId, input.trim());
    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  // Search users
  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    const results = await searchUsers(searchQuery, adminId);
    setSearchResults(results);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: 280, borderRight: '1px solid #ddd', padding: 16 }}>
        <input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        {searchResults.map((u) => (
          <div key={u.id} onClick={() => handleStartChat(u)} style={{ cursor: 'pointer', padding: 8 }}>
            {u.name ?? u.email}
          </div>
        ))}
        <hr />
        <h4>My conversations</h4>
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => setActiveConvId(c.id)}
            style={{ cursor: 'pointer', padding: 8, fontWeight: activeConvId === c.id ? 700 : 400 }}
          >
            Conversation #{c.id}
          </div>
        ))}
      </aside>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16 }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {messages.map((m) => (
            <div key={m.id} style={{ textAlign: m.senderId === adminId ? 'right' : 'left', margin: '4px 0' }}>
              <span style={{
                background: m.senderId === adminId ? '#0070f3' : '#eee',
                color: m.senderId === adminId ? '#fff' : '#000',
                padding: '6px 12px', borderRadius: 16, display: 'inline-block'
              }}>
                {m.content}
              </span>
              <div style={{ fontSize: 11, color: '#999' }}>{new Date(m.timestamp).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            style={{ flex: 1 }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
          />
          <button onClick={handleSend}>Send</button>
        </div>
      </main>
    </div>
  );
}
```

### 3d. Wire the route in `App.tsx`

```tsx
// Add inside the existing <Routes> in admin App.tsx:
import ChatPage from './pages/ChatPage';
// ...
<Route path="/chat" element={<ChatPage />} />
```

### 3e. Replace legacy `messagesService.ts` calls (optional, non-breaking)

The existing `messagesService.ts` simulates messages via `PUT /advisor_student_conversations`.  
Now that `/api/chat/send` stores real messages, you can **gradually** migrate:

| Old call | New equivalent |
|----------|---------------|
| `sendConversationMessage(advisorId, convId, text)` | `sendMessage(convId, adminId, text)` |
| `listConversationMessages(advisorId, convId)` | `getMessages(convId)` |
| `startOrGetConversationByStudentIdentifier(...)` | `startConversation(adminId, studentUserId)` |

> **Do not delete** the old service yet — other components may still depend on it.

---

## 4. Student Portal integration (`front-usr`)

> Files live under `src/` in  
> `d:\zero un it\Internet A\front usr\web-international-students-MUST`

### 4a. How student identity works

After login, the auth state is in `AuthContext` (`src/context/AuthContext.tsx`):

```ts
const { user } = useAuth();
// user.id → the Identity user id on the .NET backend (GUID string)
```

### 4b. Add `src/services/chat/dotnetChatService.ts`

**Do not modify** the existing `apiChatProvider.ts` (Supabase-backed). Create a parallel service:

```ts
// src/services/chat/dotnetChatService.ts
import { apiClient } from '../api';  // existing axios instance pointing at .NET backend
import type {
  ChatMsg,
  ChatConversation,
  ChatUserResult,
  ChatConversationSummary,
} from '../../types/chat';

const BASE = '/api/chat';

export async function startConversation(
  senderId: string,
  receiverId: string,
): Promise<ChatConversationSummary> {
  const res = await apiClient.post<ChatConversationSummary>(`${BASE}/start`, { senderId, receiverId });
  return res.data;
}

export async function sendMessage(
  conversationId: number,
  senderId: string,
  content: string,
): Promise<ChatMsg> {
  const res = await apiClient.post<ChatMsg>(`${BASE}/send`, { conversationId, senderId, content });
  return res.data;
}

export async function getMessages(conversationId: number): Promise<ChatMsg[]> {
  const res = await apiClient.get<ChatMsg[]>(`${BASE}/messages/${conversationId}`);
  return res.data;
}

export async function getUserConversations(userId: string): Promise<ChatConversation[]> {
  const res = await apiClient.get<ChatConversation[]>(`${BASE}/user/${userId}`);
  return res.data;
}

export async function searchUsers(query: string, requesterId?: string): Promise<ChatUserResult[]> {
  const params: Record<string, string> = { query };
  if (requesterId) params.requesterId = requesterId;
  const res = await apiClient.get<ChatUserResult[]>(`${BASE}/search`, { params });
  return res.data;
}
```

### 4c. Getting the advisor's Identity user id

**Option A – use `/api/chat/search`:**
```ts
const results = await searchUsers('Advisor Name', studentId);
const advisorId = results[0].id;
await startConversation(studentId, advisorId);
```

**Option B – use `/api/advisor_profiles`** (already fetched in `apiChatProvider.ts`):
```ts
const res = await apiClient.get('/api/advisor_profiles');
const advisor = res.data.find((a: any) => a.email === 'advisor@must.edu.eg');
await startConversation(studentId, advisor.id);
// advisor_profiles.id == AspNetUsers.Id for advisor accounts
```

---

## 5. Visitor flow

A **visitor** has no account. Generate a temporary id on first visit:

```ts
// src/utils/visitorId.ts  (new file in student portal)
const KEY = 'chat_visitor_id';

export function getOrCreateVisitorId(): string {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = `visitor-${crypto.randomUUID()}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}
```

### Visitor constraints enforced by the backend

| Action | Result |
|--------|--------|
| `POST /start` with visitor → **admin** | OK |
| `POST /start` with visitor → **any other user** | 400 Bad Request |
| `GET /search?requesterId=visitor-...` | 403 Forbidden |
| `POST /send` (visitor is a participant) | OK |
| `GET /messages/:id` | OK |

### Visitor chat component sketch

```tsx
// src/components/VisitorChat.tsx
import { useState, useEffect } from 'react';
import { getOrCreateVisitorId } from '../utils/visitorId';
import { startConversation, sendMessage, getMessages } from '../services/chat/dotnetChatService';
import type { ChatMsg } from '../../types/chat';

// Paste the seeded admin's Identity user id here (fetch once and cache if needed)
const ADMIN_USER_ID = '<admin-identity-guid>';

export default function VisitorChat() {
  const visitorId = getOrCreateVisitorId();
  const [convId, setConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    startConversation(visitorId, ADMIN_USER_ID)
      .then((c) => {
        setConvId(c.conversationId);
        return getMessages(c.conversationId);
      })
      .then(setMessages)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!convId) return;
    const id = setInterval(() => getMessages(convId).then(setMessages), 5000);
    return () => clearInterval(id);
  }, [convId]);

  const handleSend = async () => {
    if (!convId || !input.trim()) return;
    const msg = await sendMessage(convId, visitorId, input.trim());
    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  return (
    <div>
      {messages.map((m) => (
        <p key={m.id} style={{ textAlign: m.senderId === visitorId ? 'right' : 'left' }}>
          {m.content}
        </p>
      ))}
      <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

> **Getting the admin user id dynamically:**  
> Call `GET /api/advisor_profiles` and filter for `is_super_admin === true` or the known admin email `sudo@must.edu.eg`. The `.id` field equals the AspNetUsers Identity GUID.

---

## 6. Polling strategy (non-real-time)

```ts
// src/hooks/useChatMessages.ts
import { useEffect, useRef, useState } from 'react';
import { getMessages } from '../services/chat/dotnetChatService';
import type { ChatMsg } from '../../types/chat';

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
```

**Usage:**
```tsx
const { messages, error } = useChatMessages(activeConvId);
```

### Intervals by role

| Context | Interval |
|---------|----------|
| Admin (always open) | 5 s |
| Student (tab active) | 5 s |
| Student (tab hidden) | 30 s — use `document.visibilityState` |
| Visitor | 5 s |

---

## 7. Common pitfalls

### Do not mix Supabase messages with the new endpoints

The new `/api/chat/send` stores messages in **SQL Server** (`ChatMessages` table), not Supabase.  
If you call `/api/chat/send`, fetch messages via `/api/chat/messages/:id` — never via the `supabase` client.

### Pass the correct user id

The backend uses **Identity user ids** (GUID strings).

- **Admin portal:** use `profile.id` from `auth_profile` in `localStorage` (decoded from JWT `nameid` claim).
- **Student portal:** use `user.id` from `AuthContext` — this must match the `nameid` in the `.NET` JWT, **not** the Supabase user id.

### Block the search input for visitors in the UI

The backend returns `403` if `requesterId` starts with `visitor-`. Hide or disable the search field in the visitor widget entirely.

### CORS is already configured

`Program.cs` applies `AllowAll` CORS globally — no extra frontend configuration needed.

### Auth header is automatic

Both frontends' Axios instances already attach `Authorization: Bearer <token>` automatically. You do not need to pass it manually when calling `/api/chat/*`.

---

## File placement summary

| Project | New file to create | Purpose |
|---------|--------------------|---------|
| `front-admin` | `src/types/chat.ts` | Shared TypeScript types |
| `front-admin` | `src/services/chatService.ts` | API wrapper for `/api/chat` |
| `front-admin` | `src/pages/ChatPage.tsx` | Chat UI page |
| `front-usr` | `src/types/chat.ts` | Shared TypeScript types |
| `front-usr` | `src/services/chat/dotnetChatService.ts` | API wrapper (isolated from Supabase provider) |
| `front-usr` | `src/utils/visitorId.ts` | Visitor token helper |
| `front-usr` | `src/hooks/useChatMessages.ts` | Polling hook |
| `front-usr` | `src/pages/StudentChatDotnet.tsx` | Student chat UI page |
| `front-usr` | `src/components/VisitorChat.tsx` | Visitor chat widget |
