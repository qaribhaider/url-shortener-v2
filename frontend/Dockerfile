# Base image for all stages
FROM node:22-alpine AS base

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Development Stage
FROM base AS development

# Copy source code for development
COPY . .

# Expose port for development
EXPOSE 5173

# Command for development
CMD ["npm", "run", "dev", "--", "--host"]

# Build Stage
FROM base AS build

# Copy source code for building
COPY . .

# Build the application
RUN npm run build

# Production Stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy only the built files and package files
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Expose port for production
EXPOSE 5173

# Command for starting the application
CMD ["npm", "run", "preview"]
