# Use lightweight Node.js 20 Alpine Linux image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests first for Docker layer caching
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy backend source code
COPY . .

# Ensure uploads folder exists inside container
RUN mkdir -p uploads

# Expose backend port
EXPOSE 5000

# Start server
CMD ["node", "server.js"]
