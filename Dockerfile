# Stage 1: Build frontend (if needed)
FROM node:18 AS frontend

WORKDIR /app

COPY public ./public

# Stage 2: Setup backend and serve frontend
FROM node:18

WORKDIR /app

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && ln -s /usr/bin/python3 /usr/bin/python

# Verify Python installation
RUN python --version

# Copy package.json and requirements.txt
COPY ./package.json ./package.json
COPY ./requirements.txt ./requirements.txt

# Install backend dependencies (Node.js)
RUN npm install

# Create a virtual environment for Python dependencies
RUN python -m venv /app/venv

# Activate the virtual environment and install Python dependencies
RUN /app/venv/bin/pip install --upgrade pip && /app/venv/bin/pip install -r requirements.txt

# Copy backend code
COPY ./api /app/api
COPY --from=frontend /app/public /app/public

# Set environment variables for the virtual environment
ENV PATH="/app/venv/bin:$PATH"

# Set working directory to the backend
WORKDIR /app/api

# Expose the port and run the backend
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "index.js"]