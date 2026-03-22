FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/

RUN bun install --filter=api

COPY apps/api ./apps/api

WORKDIR /app/apps/api
RUN bunx prisma generate
RUN bun run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/generated ./generated
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3001

CMD ["node", "dist/main"]
