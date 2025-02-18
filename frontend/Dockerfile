# Base image for Node.js
FROM node:18 AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Stage 1: Development (Hot Reloading)
FROM base AS dev
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Stage 2: Production (Nginx Static Serving)
FROM nginx:alpine AS prod
COPY --from=base /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Final Stage: Select based on environment
FROM ${TARGET_ENV:-dev} AS final