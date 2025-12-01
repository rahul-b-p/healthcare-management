# ---------- Build Stage ----------
FROM node:22 AS build
WORKDIR /usr/src/app

# Copy dependency files and install deps
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build TypeScript
RUN npm run build

# ---------- Runtime Stage ----------
FROM node:22-alpine AS runtime
WORKDIR /usr/src/app

# Copy only necessary build artifacts and package files
COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Set environment variables
ENV NODE_ENV=production

EXPOSE 3000

# Run the compiled app
CMD ["node", "dist/server.js"]

