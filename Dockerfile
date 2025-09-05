# Stage 1: Build
FROM node:22.17.1-slim AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build the TypeScript app
RUN npm run build

# Stage 2: Production
FROM node:22.17.1-slim AS production
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/server/index.js"]

