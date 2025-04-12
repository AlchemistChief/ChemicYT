FROM node:18 AS frontend
WORKDIR /app
COPY public ./public
FROM node:18


WORKDIR /app

# Copy package.json and requirements.txt
COPY ./package.json ./package.json
COPY ./requirements.txt ./requirements.txt

RUN apt-get update && apt-get install -y python3 python3-pip python3-venv wget && ln -s /usr/bin/python3 /usr/bin/python
RUN npm install
RUN python -m venv /app/venv
RUN /app/venv/bin/pip install -r requirements.txt

# Copy backend code
COPY ./api /app/api
COPY --from=frontend /app/public /app/public

# Install ffmpeg into /app/api/bin
RUN wget https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz && \
	tar -xf ffmpeg-master-latest-linux64-gpl.tar.xz && \
	mkdir -p /app/api/bin && \
	mv ffmpeg-*-gpl/ffmpeg /api/bin/ && \
	mv ffmpeg-*-gpl/ffprobe /api/bin/ && \
	rm -rf ffmpeg-master-latest-linux64-gpl.tar.xz ffmpeg-*-gpl


ENV PATH="/app/venv/bin:$PATH"
WORKDIR /app/api

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "index.js"]