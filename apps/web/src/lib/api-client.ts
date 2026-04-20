import type { ApiResponse, ChatSession, ChatMessage, Document } from '@supperajan/types';

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

export async function apiGet<T>(path: string): Promise<T> {
  const res = await request<T>(path);
  return res.data as T;
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

  documents: {
    list: () => request<Document[]>('/documents'),

    upload: (body: {
      fileName: string;
      mimeType: string;
      fileSize: number;
      content: string;
      encoding: 'utf8' | 'base64';
      title?: string;
    }) =>
      request<Document>('/documents', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    get: (id: string) => request<Document>(`/documents/${id}`),

    delete: (id: string) =>
      fetch(`${API_BASE}/api/v1/documents/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-Request-ID': crypto.randomUUID() },
      }),
  },
};
