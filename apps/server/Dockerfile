FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN npm install -g pnpm

# Set pnpm config to hoist dependencies so they are all in root node_modules
# and we can copy them easily
RUN pnpm config set shamefully-hoist true

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy all package.json files to allow pnpm to run workspace installation
COPY apps/server/package.json ./apps/server/
COPY apps/server/prisma ./apps/server/prisma/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies (required for mono-repo builds)
RUN pnpm install

# Copy source code
COPY apps/server ./apps/server
COPY packages/shared ./packages/shared

# Generate prisma client inside server
WORKDIR /app/apps/server
RUN npx prisma generate

# Build server app
RUN pnpm run build

# Final lightweight image
FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built artifacts and ALL node_modules (shamefully-hoist ensures everything is here)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder /app/apps/server/prisma ./apps/server/prisma
COPY --from=builder /app/apps/server/prisma.config.ts ./apps/server/prisma.config.ts
COPY --from=builder /app/apps/server/tsconfig.json ./apps/server/tsconfig.json

ENV NODE_ENV=production
ENV PORT=8000
EXPOSE 8000

# Set the workdir to where the code resides
WORKDIR /app/apps/server

# CMD to run migrations and then start the server
CMD npx prisma migrate deploy && node dist/src/main
