# Base image for all stages
FROM node:22-alpine AS base

WORKDIR /usr/src/app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files for dependency installation
COPY package*.json ./

# Development Stage
FROM base AS development

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source code for development
COPY . .

# Expose port for development
EXPOSE 3000

# Command for development
CMD ["npm", "run", "start:dev"]

# Testing Stage
FROM base AS test

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source code for testing
COPY . .

# Command for running tests
CMD ["npm", "run", "test"]

# Production Stage
FROM base AS production

# Install only production dependencies
RUN npm install --only=production

# Copy source code for production
COPY . .

# Build the application
RUN npm run build

# Expose port for production
EXPOSE 3000

# Command for starting the application in production mode
CMD ["npm", "run", "start:prod"]
