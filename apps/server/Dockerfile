FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN npm install -g pnpm

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy all package.json files to allow pnpm to run workspace installation
COPY apps/server/package.json ./apps/server/
COPY apps/server/prisma ./apps/server/prisma/

# Install dependencies for server
RUN pnpm install --filter server...

# Copy server code
COPY apps/server ./apps/server

# Generate prisma client inside server
WORKDIR /app/apps/server
RUN npx prisma generate

# Build server app
RUN pnpm run build

# Final lightweight image
FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder /app/apps/server/prisma ./apps/server/prisma
COPY --from=builder /app/apps/server/prisma.config.ts ./apps/server/prisma.config.ts
COPY --from=builder /app/apps/server/tsconfig.json ./apps/server/tsconfig.json

ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000

WORKDIR /app/apps/server
# CMD to run migrations and then start the server
# We use direct node command to avoid any pnpm path resolution issues in the final container
CMD npx prisma migrate deploy && node dist/src/main
