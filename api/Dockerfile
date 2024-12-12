FROM node:22-alpine

WORKDIR /usr/src/app

# Install curl for healthcheck
RUN apk add --no-cache curl

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000
