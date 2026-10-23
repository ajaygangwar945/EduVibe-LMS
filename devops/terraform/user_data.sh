#!/bin/bash
# ========================================================
# EduVibe Automated Cloud-Init Setup Script for AWS EC2
# ========================================================

set -e

# --------------------------------------------------------
# 1. Allocate 2GB Virtual Swap Space
# Guarantees smooth Docker builds on t2.micro (1GB RAM)
# --------------------------------------------------------
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# --------------------------------------------------------
# 2. Update apt repositories & install prerequisites
# --------------------------------------------------------
export DEBIAN_FRONTEND=noninteractive
apt-get update -y

apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    unzip \
    htop

# --------------------------------------------------------
# 3. Install official Docker Engine & Docker Compose
# --------------------------------------------------------
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

systemctl enable docker
systemctl start docker
usermod -aG docker ubuntu

# --------------------------------------------------------
# 4. Clone Application Repository
# --------------------------------------------------------
APP_DIR="/home/ubuntu/app"
mkdir -p "$APP_DIR"

if [ ! -d "$APP_DIR/.git" ]; then
  git clone https://github.com/ajaygangwar945/EduVibe-LMS.git "$APP_DIR"
else
  cd "$APP_DIR" && git pull origin main
fi

# Ensure .env exists from template if not already present
if [ ! -f "$APP_DIR/.env" ] && [ -f "$APP_DIR/.env.example" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
fi

chown -R ubuntu:ubuntu "$APP_DIR"

# --------------------------------------------------------
# 5. Launch All Containers (Core App + Monitoring)
# --------------------------------------------------------
cd "$APP_DIR"
docker compose --profile monitoring up -d --build

echo "========================================================"
echo " EduVibe Cloud Server Setup Completed Successfully!     "
echo " All 4 Containers (Web, API, Prometheus, Grafana) Live! "
echo "========================================================"
