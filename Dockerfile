# Stage 1: Build frontend (if needed)
FROM node:18 AS frontend

WORKDIR /app

COPY public ./public

# Stage 2: Setup backend and serve frontend
FROM node:18

WORKDIR /app

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip && ln -s /usr/bin/python3 /usr/bin/python

# Verify Python installation
RUN python --version

# Copy package.json and requirements.txt
COPY ./package.json ./package.json
COPY ./requirements.txt ./requirements.txt

# Install backend dependencies (Node.js)
RUN npm install
# Install Python dependencies
RUN pip install -r requirements.txt

# Copy backend code
COPY ./api /app/api
COPY --from=frontend /app/public /app/public

# Set working directory to the backend
WORKDIR /app/api

# Expose the port and run the backend
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "index.js"]