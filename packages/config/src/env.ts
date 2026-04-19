/**
 * Environment variable access with typed, fail-fast validation.
 * Consumed by all backend packages at startup.
 */

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function optionalInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) throw new Error(`Environment variable ${key} must be an integer, got: ${raw}`);
  return parsed;
}

function optionalBool(key: string, fallback: boolean): boolean {
  const raw = process.env[key];
  if (!raw) return fallback;
  return raw.toLowerCase() === 'true' || raw === '1';
}

export function loadEnv() {
  return {
    NODE_ENV: optional('NODE_ENV', 'development') as 'development' | 'staging' | 'production' | 'test',
    PORT: optionalInt('PORT', 4000),

    // Database
    DATABASE_URL: required('DATABASE_URL'),
    DATABASE_DIRECT_URL: optional('DATABASE_DIRECT_URL', ''),

    // Redis
    REDIS_URL: optional('REDIS_URL', 'redis://localhost:6379'),
    REDIS_PREFIX: optional('REDIS_PREFIX', 'supperajan:'),

    // Auth
    JWT_SECRET: required('JWT_SECRET'),
    JWT_EXPIRY: optional('JWT_EXPIRY', '7d'),
    REFRESH_TOKEN_SECRET: required('REFRESH_TOKEN_SECRET'),
    REFRESH_TOKEN_EXPIRY: optional('REFRESH_TOKEN_EXPIRY', '30d'),

    // LLM
    LLM_PROVIDER: optional('LLM_PROVIDER', 'openai') as 'openai' | 'anthropic' | 'google' | 'azure_openai' | 'local',
    OPENAI_API_KEY: optional('OPENAI_API_KEY', ''),
    OPENAI_MODEL: optional('OPENAI_MODEL', 'gpt-4o'),
    OPENAI_BASE_URL: optional('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
    ANTHROPIC_API_KEY: optional('ANTHROPIC_API_KEY', ''),
    ANTHROPIC_MODEL: optional('ANTHROPIC_MODEL', 'claude-opus-4-7'),

    // STT
    STT_PROVIDER: optional('STT_PROVIDER', 'openai') as 'openai' | 'deepgram' | 'google' | 'azure' | 'whisper_local',
    DEEPGRAM_API_KEY: optional('DEEPGRAM_API_KEY', ''),

    // TTS
    TTS_PROVIDER: optional('TTS_PROVIDER', 'openai') as 'openai' | 'elevenlabs' | 'google' | 'azure' | 'piper_local',
    TTS_VOICE: optional('TTS_VOICE', 'alloy'),
    ELEVENLABS_API_KEY: optional('ELEVENLABS_API_KEY', ''),
    ELEVENLABS_VOICE_ID: optional('ELEVENLABS_VOICE_ID', ''),

    // Embeddings
    EMBEDDINGS_PROVIDER: optional('EMBEDDINGS_PROVIDER', 'openai') as 'openai' | 'cohere' | 'google' | 'local',
    EMBEDDINGS_MODEL: optional('EMBEDDINGS_MODEL', 'text-embedding-3-small'),
    EMBEDDINGS_DIMENSIONS: optionalInt('EMBEDDINGS_DIMENSIONS', 1536),

    // Vector Store
    VECTOR_STORE_PROVIDER: optional('VECTOR_STORE_PROVIDER', 'pgvector') as 'pgvector' | 'qdrant',
    QDRANT_URL: optional('QDRANT_URL', 'http://localhost:6333'),
    QDRANT_API_KEY: optional('QDRANT_API_KEY', ''),

    // Storage
    STORAGE_PROVIDER: optional('STORAGE_PROVIDER', 'local') as 'local' | 's3',
    STORAGE_LOCAL_PATH: optional('STORAGE_LOCAL_PATH', './uploads'),
    S3_BUCKET: optional('S3_BUCKET', ''),
    S3_REGION: optional('S3_REGION', 'us-east-1'),
    S3_ACCESS_KEY_ID: optional('S3_ACCESS_KEY_ID', ''),
    S3_SECRET_ACCESS_KEY: optional('S3_SECRET_ACCESS_KEY', ''),
    S3_ENDPOINT: optional('S3_ENDPOINT', ''),

    // Observability
    LOG_LEVEL: optional('LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error',
    LOG_FORMAT: optional('LOG_FORMAT', 'json') as 'json' | 'pretty',
    OTEL_EXPORTER_OTLP_ENDPOINT: optional('OTEL_EXPORTER_OTLP_ENDPOINT', ''),
    SENTRY_DSN: optional('SENTRY_DSN', ''),

    // CORS
    CORS_ORIGINS: optional('CORS_ORIGINS', 'http://localhost:3000'),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: optionalInt('RATE_LIMIT_WINDOW_MS', 60000),
    RATE_LIMIT_MAX_REQUESTS: optionalInt('RATE_LIMIT_MAX_REQUESTS', 100),

    // App URLs
    APP_URL: optional('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
    API_URL: optional('API_URL', 'http://localhost:4000'),

    // Feature Flags
    ENABLE_VOICE: optionalBool('ENABLE_VOICE', true),
    ENABLE_MEMORY: optionalBool('ENABLE_MEMORY', true),
    ENABLE_KNOWLEDGE: optionalBool('ENABLE_KNOWLEDGE', true),
    DEBUG_MODE: optionalBool('DEBUG_MODE', false),
  } as const;
}

export type AppEnv = ReturnType<typeof loadEnv>;
