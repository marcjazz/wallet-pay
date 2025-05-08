FROM node:22-alpine3.21 AS base

LABEL maintainer="Lorrain Tchakoumi <lorraintchakoumi@gmail.com>"
LABEL org.opencontainers.image.description="NextJs frontend for the XafPay Wallet"

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm ci 

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# COPY workspace configs
COPY package*.json ./
COPY ./tsconfig.base.json ./
COPY ./nx.json ./

# COPY REQUIRED LIBS AND CONCERNED APP
COPY /libs/theme ./libs/theme
COPY ./apps/customer-web ./apps/customer-web

ENV NODE_ENV=production
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Build project
RUN NX_CLOUD=0 npx nx run customer-web:build:production

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/customer-web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/customer-web/public ./apps/customer-web/public
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/customer-web/.next/static ./dist/apps/customer-web/.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "apps/customer-web/server.js"]
