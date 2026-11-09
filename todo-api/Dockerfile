# Multi-stage / lightweight Node.js Alpine base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies cleanly
RUN npm ci --only=production || npm install --omit=dev

# Copy application source code
COPY server.js ./

# Switch to unprivileged 'node' user for security compliance
USER node

# Expose microservice listening port
EXPOSE 3000

# Health check to ensure service vitality
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Define container entrypoint
CMD ["node", "server.js"]
