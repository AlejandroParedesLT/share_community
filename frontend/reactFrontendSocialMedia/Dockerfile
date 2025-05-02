# # Base image for Node.js
# FROM node:18 AS base

# WORKDIR /app

# # Install dependencies
# COPY package.json package-lock.json ./
# RUN npm install

# # Copy the rest of the source code
# COPY . .

# # Stage 1: Development (Hot Reloading)
# FROM base AS dev
# EXPOSE 5173
# CMD ["npm", "run", "dev", "--", "--host"]

# # Stage 2: Production (Nginx Static Serving)
# FROM nginx:alpine AS prod
# COPY --from=base /app/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

# # Final Stage: Select based on environment
# FROM ${TARGET_ENV:-dev} AS final

# Base stage: installs dependencies
FROM node:18 AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Build stage: compiles the app for production
FROM base AS build
COPY . .
RUN npm run build

# Development stage: hot reloading
FROM base AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Production stage: serves built files with Nginx
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Final stage (select dev or prod based on TARGET_ENV)
FROM ${TARGET_ENV:-dev} AS final
