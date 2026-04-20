import type { ApiResponse, ChatSession, ChatMessage } from '@supperajan/types';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000';

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': crypto.randomUUID(),
      ...init?.headers,
    },
    credentials: 'include',
  });

  const json = await res.json() as ApiResponse<T>;
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? `HTTP ${res.status}`);
  }
  return json;
}

export const apiClient = {
  sessions: {
    create: (body: { title?: string; assistantMode?: string }) =>
      request<ChatSession>('/sessions', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    list: () => request<ChatSession[]>('/sessions'),

    end: (id: string) =>
      request<void>(`/sessions/${id}`, { method: 'DELETE' }),
  },

  messages: {
    list: (sessionId: string) =>
      request<ChatMessage[]>(`/sessions/${sessionId}/messages`),
  },
};
