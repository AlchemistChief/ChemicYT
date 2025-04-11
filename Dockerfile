# Stage 1: Build frontend
FROM node:18 AS frontend

WORKDIR /app

COPY client ./client
WORKDIR /app/client

RUN npm install && npm run build

# Stage 2: Setup backend and serve frontend
FROM node:18

WORKDIR /app

COPY server ./server
COPY data.json ./data.json
COPY --from=frontend /app/client/dist ./client-dist

WORKDIR /app/server

RUN npm install

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "index.js"]
