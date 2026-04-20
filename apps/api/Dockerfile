# ── Stage 1: deps ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/types/package.json          packages/types/
COPY packages/config/package.json         packages/config/
COPY packages/observability/package.json  packages/observability/
COPY packages/ai/package.json             packages/ai/
COPY packages/knowledge/package.json      packages/knowledge/
COPY packages/realtime/package.json       packages/realtime/
COPY packages/database/package.json       packages/database/
COPY apps/api/package.json                apps/api/

RUN pnpm install --frozen-lockfile --prod=false

# ── Stage 2: build ─────────────────────────────────────────────────────────────
FROM deps AS builder
COPY tsconfig.base.json ./
COPY packages/types/src       packages/types/src
COPY packages/config/src      packages/config/src
COPY packages/observability/src packages/observability/src
COPY packages/ai/src          packages/ai/src
COPY packages/knowledge/src   packages/knowledge/src
COPY packages/realtime/src    packages/realtime/src
COPY packages/database/       packages/database/
COPY apps/api/                apps/api/

RUN cd apps/api && pnpm build

# ── Stage 3: runner ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production

# Only production deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/types/package.json          packages/types/
COPY packages/config/package.json         packages/config/
COPY packages/observability/package.json  packages/observability/
COPY packages/ai/package.json             packages/ai/
COPY packages/knowledge/package.json      packages/knowledge/
COPY packages/realtime/package.json       packages/realtime/
COPY packages/database/package.json       packages/database/
COPY apps/api/package.json                apps/api/

RUN pnpm install --frozen-lockfile --prod

# Copy compiled output
COPY --from=builder /app/apps/api/dist        apps/api/dist
COPY --from=builder /app/packages/database    packages/database

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:4000/health/live || exit 1

CMD ["node", "apps/api/dist/main.js"]
