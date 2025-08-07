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
RUN apk add --no-cache --virtual .gyp python3 make g++ && npm install -g npm@11.5.2 && npm ci && apk del .gyp

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

ENV NX_CLOUD=0
ENV NODE_ENV=production
# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Build project
RUN npx nx reset && \
    npx nx run customer-web:build:production --skip-nx-cache --verbose && \
    echo "Listing build output:" && \
    find /app/dist/apps/customer-web -type f -name "*.js" | head -20 && \
    ls -la /app/dist/apps/customer-web/ && \
    ls -la /app/dist/apps/customer-web/.next/ || echo "No .next directory found"

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the Next.js application
COPY --from=builder --chown=nextjs:nodejs /app/dist/apps/customer-web ./apps/customer-web

# Copy node_modules for production dependencies
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy package.json files
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the Next.js application
WORKDIR /app/apps/customer-web
CMD ["npx", "next", "start"]
