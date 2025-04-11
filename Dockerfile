# Stage 1: Build frontend
FROM node:18 AS frontend

WORKDIR /app

COPY public ./public
WORKDIR /app/public

RUN npm install && npm run build

# Stage 2: Setup backend and serve frontend
FROM node:18

WORKDIR /app

COPY api ./api
COPY data.json ./data.json
COPY --from=frontend /app/public/dist ./public-dist

WORKDIR /app/api

RUN npm install

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "index.js"]
