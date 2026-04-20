// Provider implementations are loaded in apps/api to avoid bundling server code
// into the browser. This file re-exports the interfaces that both client
// and server packages share.
export type { ISTTProvider } from '@supperajan/ai/providers';
export type { ITTSProvider } from '@supperajan/ai/providers';
