FROM node:22-alpine

# Small init so Node is not PID 1: it forwards SIGTERM and reaps children.
RUN apk add --no-cache tini

WORKDIR /app

# Install from the lockfile, production dependencies only (no Jest, nodemon or
# mongodb-memory-server). Copied first so this layer is cached until deps change.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# Upload folders (IMAGE_STORAGE and AUDIO_STORAGE are relative to /app). Mount a
# volume on /app/uploads to keep uploads across container restarts.
RUN mkdir -p uploads && chown -R node:node /app

# Default port; override with -e PORT=... (the app has no built-in default).
ENV PORT=8080
EXPOSE 8080

USER node

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "node", "index.js" ]
