# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN npm install --workspace=apps/api --include-workspace-root
COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/
RUN npm run build --workspace=apps/api

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages/shared/ ./packages/shared/
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist/ ./apps/api/dist/
COPY --from=builder /app/apps/api/src/database/migrations/ ./apps/api/dist/database/migrations/
COPY --from=builder /app/node_modules/ ./node_modules/

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "apps/api/dist/index.js"]
