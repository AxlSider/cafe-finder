# CupScout production image (Next.js 15 + Prisma).
# Multi-stage: install deps, build, then a lean runtime that runs migrations
# and starts the server. Prisma CLI is kept in the runtime for `migrate deploy`.

FROM node:20-alpine AS base
# Prisma needs openssl + libc compat on Alpine.
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

# ---- deps ----
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---- build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

# ---- runtime ----
FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000
# App files + full node_modules (so the Prisma CLI is available for migrations).
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.mjs ./next.config.mjs

# Uploaded photos live here; mount a volume to persist them.
RUN mkdir -p public/uploads
EXPOSE 3000

# Apply migrations, then start. (Seed the admin once via a one-off, see compose.)
CMD ["npm", "run", "start:prod"]
