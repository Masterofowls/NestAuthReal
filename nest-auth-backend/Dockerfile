FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- production image ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/src/db ./src/db
COPY --from=builder /app/auth-schema.ts ./auth-schema.ts

EXPOSE 3000

CMD ["node", "dist/src/main"]
