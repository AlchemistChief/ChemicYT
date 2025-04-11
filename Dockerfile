# Stage 1: Build frontend (if needed)
FROM node:18 AS frontend

WORKDIR /app

COPY client ./client
WORKDIR /app/client

RUN npm install && npm run build

# Stage 2: Setup backend and serve frontend
FROM node:18

WORKDIR /app

# Copy the package.json from the root directory to install backend dependencies
COPY ./package.json ./package.json

# Install backend dependencies
RUN npm install

# Copy backend code
COPY ./api /app/api

# Copy data file
COPY data.json ./data.json

# Copy built frontend files from the frontend build stage
COPY --from=frontend /app/client/dist ./public-dist

# Set working directory to the backend
WORKDIR /app/api

# Expose the port and run the backend
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "index.js"]