FROM node:24.12.0-alpine AS builder

RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build


FROM node:24.12.0-alpine

RUN apk add --no-cache python3 py3-pip
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]