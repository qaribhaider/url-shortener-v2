#### Base image for all stages
FROM node:22-alpine AS base

WORKDIR /usr/src/app

# Install curl for healthcheck
RUN apk add --no-cache curl 

COPY package*.json ./

RUN npm install

COPY . .

#### Development Stage
FROM base AS development

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

#### Testing Stage
FROM base AS test

RUN npm install

CMD ["npm", "run", "test"]

#### Build Stage
FROM node:22-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY . .

RUN npm run build

# Install again with dev dependencies removed
RUN npm ci --omit=dev && npm cache clean --force

#### Production Stage
FROM build AS production

WORKDIR /usr/src/app

# Install curl for healthcheck
RUN apk add --no-cache curl 

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY package*.json ./

EXPOSE 3000

CMD ["node", "dist/main"]
