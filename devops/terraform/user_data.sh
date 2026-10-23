#!/bin/bash
# ========================================================
# EduVibe Automated Cloud-Init Setup Script for AWS EC2
# ========================================================

set -e

# Update apt repositories
apt-get update -y
apt-get upgrade -y

# Install prerequisites
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    unzip \
    htop

# Install official Docker GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker official repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine and Docker Compose Plugin
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker service
systemctl enable docker
systemctl start docker

# Add ubuntu user to docker group to allow running docker without sudo
usermod -aG docker ubuntu

# Create application workspace directory
APP_DIR="/home/ubuntu/app"
mkdir -p "$APP_DIR"

# Clone or pull latest application repository
if [ ! -d "$APP_DIR/.git" ]; then
  git clone https://github.com/ajaygangwar945/EduVibe-LMS.git "$APP_DIR"
else
  cd "$APP_DIR" && git pull origin main
fi

# Ensure .env exists from template if not already present
if [ ! -f "$APP_DIR/.env" ] && [ -f "$APP_DIR/.env.example" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
fi

# Set proper ownership for ubuntu user
chown -R ubuntu:ubuntu "$APP_DIR"

# Launch application containers via Docker Compose
cd "$APP_DIR"
docker compose up -d --build backend frontend

echo "========================================================"
echo " EduVibe Cloud Server Setup Completed Successfully!     "
echo " Backend & Frontend Containers are live and running!    "
echo "========================================================"
