FROM node:24.12.0-alpine AS builder

RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build


FROM node:24.12.0-alpine

RUN apk add --no-cache python py-pip
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY --from=builder /app/dist ./dist

EXPOSE 3000 
CMD ["pnpm", "start"]