# Use an official Node.js runtime as the base image
FROM node:20-slim as base

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install dependencies for backend
FROM base as build

# Install build tools (only for dependencies that need compilation)
RUN apt-get update -qq && apt-get install -y python3 pkg-config build-essential

# Copy backend dependencies and install
COPY code/bustrack-api/package.json code/bustrack-api/package-lock.json ./bustrack-api/
RUN npm install --prefix bustrack-api

# Copy backend source code and config file
COPY code/bustrack-api/. ./bustrack-api
COPY code/bustrack-api/config.json ./bustrack-api/config.json

# Install dependencies for frontend
COPY code/bus-tracker/package.json code/bus-tracker/package-lock.json ./bus-tracker/
RUN npm install --prefix bus-tracker

# Copy frontend source code
COPY code/bus-tracker/. ./bus-tracker

# Set environment variables for frontend build (if needed)
ENV VITE_API_URL=http://your-api-url.com

# Build frontend (assuming React or similar framework)
RUN npm run build --prefix bus-tracker

# Final production stage
FROM base

# Copy built frontend and backend
COPY --from=build /app/bustrack-api ./bustrack-api
COPY --from=build /app/bus-tracker/build ./bus-tracker/build

# Install production dependencies for the backend
RUN npm install --prefix bustrack-api --production

# Expose the port your app listens on (must match server.js)
EXPOSE 5000

# Set environment variables (use flyctl secrets for sensitive data)
ENV PORT=5000

# Start the backend server
CMD ["node", "bustrack-api/server.js"]