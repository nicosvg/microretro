# Multi-stage build: first build frontend, then run backend with frontend

# Stage 1: Build frontend
FROM node:lts-alpine AS frontend-builder

ARG PUBLIC_API_URL
ARG PUBLIC_WS_URL

# Convert ARG to ENV so SvelteKit can access them during build
ENV PUBLIC_API_URL=${PUBLIC_API_URL}
ENV PUBLIC_WS_URL=${PUBLIC_WS_URL}

WORKDIR /app/front

# Copy package files first for better layer caching
COPY front/package.json front/package-lock.json ./

# Install dependencies first (better caching)
RUN npm ci

# Copy frontend source (excluding node_modules via .dockerignore or explicit copy)
COPY front/ ./
COPY domain/ ../domain/

# Build frontend (outputs to ../back/public from front directory)
RUN npm run build

# Stage 2: Run backend with frontend
FROM oven/bun:latest

WORKDIR /app

# Copy backend package files
COPY back/package.json back/bun.lockb ./back/

WORKDIR /app/back

# Install backend dependencies
RUN bun install --frozen-lockfile

# Copy backend source
COPY back/src/ ./src/
COPY back/tsconfig.json ./tsconfig.json
COPY back/bunfig.toml ./bunfig.toml

# Copy domain (needed for backend)
COPY domain/ ../domain/

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/back/public ./public

# Expose the port
EXPOSE 3000

# Run migrations and start server
CMD ["bun", "run", "compose"]

