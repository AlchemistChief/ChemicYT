# Stage 1: Build frontend (if needed)
FROM node:18 AS frontend

WORKDIR /app

COPY public ./public

# Stage 2: Setup backend and serve frontend
FROM node:18

WORKDIR /app

# Copy the package.json from the root directory to install backend dependencies
COPY ./package.json ./package.json

# Install backend dependencies
RUN npm install

# Copy backend code
COPY ./api /app/api
COPY data.json ./data.json
COPY --from=frontend /app/public /app/public

# Set working directory to the backend
WORKDIR /app/api

# Expose the port and run the backend
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "index.js"]
