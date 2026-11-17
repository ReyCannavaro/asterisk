# ========================================================
# Asterisk Backend - High Performance Bun Production Container
# ========================================================

# Stage 1: Build & Bundle
FROM oven/bun:1.2-alpine AS builder
WORKDIR /app

# Copy root workspace dependency files
COPY package.json bun.lock ./
COPY packages/types/package.json ./packages/types/
COPY packages/config/package.json ./packages/config/
COPY apps/backend/package.json ./apps/backend/

# Install workspace dependencies
RUN bun install

# Copy source trees
COPY packages/types ./packages/types
COPY packages/config ./packages/config
COPY apps/backend ./apps/backend

# Build standalone bundled backend (dist/index.js)
WORKDIR /app/apps/backend
RUN bun run build

# Stage 2: Minimal Distroless / Lightweight Runner
FROM oven/bun:1.2-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["bun", "dist/index.js"]
