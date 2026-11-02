# Stage 1: Build React application
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application source code
COPY . .

# Build production application
RUN npm run build


# Stage 2: Serve using Nginx
FROM nginx:alpine

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build from Stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run compatible port
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]