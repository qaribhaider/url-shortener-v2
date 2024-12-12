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
FROM nginx:stable-alpine AS production

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /var/www/html/

EXPOSE 5173

ENTRYPOINT ["nginx","-g","daemon off;"]