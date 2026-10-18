# ========================================================
# Stage 1: Build React Production Bundle
# ========================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definition
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# ========================================================
# Stage 2: Serve with Lightweight Production Nginx
# ========================================================
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose web server port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
