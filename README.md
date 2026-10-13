# 🎓 EduVibe - Next-Gen Academic & Learning Management Portal

[![AWS Cloud](https://img.shields.io/badge/AWS-EC2%20%7C%20S3%20%7C%20CloudFront-orange?logo=amazon-aws)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-purple?logo=terraform)](https://www.terraform.io/)
[![Docker](https://img.shields.io/badge/Docker-Containers-blue?logo=docker)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes-326CE5?logo=kubernetes)](https://kubernetes.io/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%207.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Prometheus](https://img.shields.io/badge/Monitoring-Prometheus%20%2B%20Grafana-E6522C?logo=prometheus)](https://prometheus.io/)

---

## 📌 Project Overview
**EduVibe** is a modern, full-stack Academic & Learning Management Portal built with **React**, **Node.js**, and **MongoDB**. It provides tailored experiences for three key academic roles: **Students**, **Faculty**, and **Administrators**, featuring video streaming, PDF lecture notes, interactive auto-graded quizzes, and daily attendance tracking.

The entire infrastructure is automated using **Terraform (Infrastructure as Code)** and deployed to **AWS** at an ultra-low cost within the AWS Free Tier.

---

## 🌐 Live Cloud Deployment (Permanent AWS Static IP)
- 🔗 **Web Portal**: [http://54.173.124.101:3005](http://54.173.124.101:3005)
- 🍃 **MongoDB Visual Cloud Explorer**: [http://54.173.124.101:8081](http://54.173.124.101:8081)
- 📊 **Prometheus Metrics**: [http://54.173.124.101:9090](http://54.173.124.101:9090)
- 📈 **Grafana Analytics**: [http://54.173.124.101:3001](http://54.173.124.101:3001)

---

## 🏗️ System Architecture

```
[Student / Faculty / Admin]
            │
            ▼ (Port 80 / 3005)
┌────────────────────────────────────────────────────────┐
│  AWS Cloud (Provisioned via Terraform)                 │
│                                                        │
│   ┌─────────────── NGINX Reverse Proxy ─────────────┐  │
│   │   •  /           ──►  React Frontend (Port 3005)│  │
│   │   •  /api/       ──►  Node.js API (Port 5000)   │  │
│   │   •  /uploads/   ──►  PDFs & Lecture Videos     │  │
│   └─────────────────────────────────────────────────┘  │
│                                                        │
│   ┌────────────── Internal Services ────────────────┐  │
│   │   • MongoDB (Port 27017) + Mongo Express (8081) │  │
│   │   • Jenkins CI/CD (Port 8080)                   │  │
│   │   • Prometheus (Port 9090) & Grafana (Port 3001)│  │
│   └─────────────────────────────────────────────────┘  │
│                                                        │
│   ┌────────────── AWS Managed Cloud ────────────────┐  │
│   │   • Amazon S3 (PDF & Video Storage)             │  │
│   │   • Amazon CloudFront (Global Video CDN)        │  │
│   │   • Amazon ECR (Docker Image Registry)          │  │
│   │   • Amazon CloudWatch & SNS (Alarms & Alerts)   │  │
│   └─────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Role Features

### 👨‍🎓 Student Portal
- **Profile & Enrollment**: View personal profile, roll number, and enrolled courses.
- **Course Catalog**: Browse all department subjects and enroll with 1 click.
- **In-Browser Video Streaming**: Watch recorded lecture videos directly inside the browser.
- **PDF Notes & Syllabus**: Instant preview and download of study materials.
- **Interactive Quizzes**: Timed multiple-choice tests with instant auto-grading.
- **Assignment Submissions**: Upload homework submissions in PDF format.
- **Attendance Tracker**: Visual gauge of overall attendance percentage (alert threshold: 75%).

### 👩‍🏫 Faculty Portal
- **Subject Management**: Create new courses and view enrolled student rosters.
- **Resource Uploads**: Upload syllabus documents (PDF) and video lectures (`.mp4`, `.webm`).
- **Daily Attendance Marking**: Select subject and date, toggle student presence, and save with 1 click.
- **Quiz Builder**: Create custom quizzes with timers, questions, options, and points.
- **Assignment Evaluation**: Download student PDF submissions, assign marks, and post feedback.

### 🛡️ Admin Console
- **System KPIs**: Real-time counter of total students, active faculty, and courses.
- **Pending Faculty Approvals**: 1-click approval that generates official Registration Numbers (e.g. `FAC-2026-XXXX`) and activates accounts.
- **User Directory**: Search and filter all registered students and teachers.
- **Institutional Reports**: Summaries of enrollment and course resources.

---

## 🛠️ Technology Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Glassmorphism CSS Design System |
| **Backend** | Node.js, Express, Multer, JSON Web Tokens (JWT), Bcrypt |
| **Database** | MongoDB 7.0, Mongoose ODM, Mongo Express Web GUI |
| **Containerization** | Docker, Docker Compose, Multi-stage Nginx Build |
| **Infrastructure (IaC)** | Terraform (AWS Provider v5.x) |
| **AWS Cloud Services** | EC2, S3, CloudFront CDN, ECR, IAM, Security Groups, CloudWatch, SNS |
| **CI/CD Pipeline** | Jenkins (`Jenkinsfile`) |
| **Orchestration** | Kubernetes (`k8s/` manifests for Deployment, Service, PVC, Ingress) |
| **Observability** | Prometheus (`prom-client`), Grafana Dashboards |

## 🔑 Default Credentials & Access

| Portal | URL | Username / Email | Password |
|---|---|---|---|
| **System Admin** | `http://localhost:3005` or `http://54.173.124.101:3005` | `admin@eduvibe.com` | `admin123` |
| **Sample Faculty** | `http://localhost:3005` or `http://54.173.124.101:3005` | `robert.smith@eduvibe.com` | `password123` |
| **Mongo Express** | `http://localhost:8081` or `http://54.173.124.101:8081` | `admin` | `EduVibeSecure2026!` |
| **Grafana Analytics** | `http://localhost:3001` or `http://54.173.124.101:3001` | `admin` | `EduVibeGrafana2026!` |

---

## 🔒 Security & DevSecOps Best Practices

EduVibe is engineered with enterprise security best practices:
- **NoSQL Injection Defense**: Strict type checking and string coercion prevents query operator injection attacks.
- **Brute-Force Rate Limiting**: In-memory rate limiter on authentication endpoints stops dictionary and credential stuffing attacks.
- **IDOR Protection**: Object-level access control guarantees faculty can only grade, modify, or upload to subjects they teach.
- **Strict File Upload Sanitization**: Double-checked MIME type and extension whitelist (`.pdf`, `.docx`, `.mp4`, etc.) with randomized filenames to eliminate remote code execution (RCE).
- **Container Hardening**: Node.js backend runs under unprivileged non-root user `node` in Docker; sensitive files (`.env`, `*.key`, `*.pem`) are barred via `.dockerignore`.
- **AWS Infrastructure Security**:
  - Permanent Elastic IP (`aws_eip`) ensures stable zero-friction access across reboots.
  - S3 bucket blocks all public access; media is served strictly through CloudFront via Origin Access Control (OAC) with AWS Signature Version 4.
  - S3 Server-Side Encryption (AES-256) and EBS encryption at rest (`encrypted = true`) enabled.
  - Network segmentation: MongoDB port `27017` is bound strictly to loopback `127.0.0.1` and not exposed to the public internet.

---

## 💻 How to Run the Project Locally (Step-by-Step)

You can run EduVibe locally using **Docker (Recommended)** or **Manual Node.js**.

---

### ⚡ Quick Command Cheat Sheet (Start & Stop)

| Action | Command | What It Does |
| :--- | :--- | :--- |
| 🚀 **Start Everything** | `docker compose --profile monitoring up -d` | Starts all 6 containers (App + MongoDB + Prometheus + Grafana) |
| 🌐 **Start App Only** | `docker compose up -d` | Starts 4 containers (React Frontend, Node.js API, MongoDB, Mongo Express) |
| 🛑 **Stop Everything** | `docker compose --profile monitoring down` | Cleanly stops and removes all containers (Data preserved in volumes) |
| ⏹️ **Stop App Only** | `docker compose down` | Cleanly stops and removes core app containers |
| ⏸️ **Pause Containers** | `docker compose --profile monitoring stop` | Pauses running containers without removing them |
| ▶️ **Resume Containers** | `docker compose --profile monitoring start` | Instantly resumes paused containers |
| 🔄 **Rebuild & Start** | `docker compose --profile monitoring up -d --build` | Rebuilds source code changes and starts all containers |
| 📋 **Check Status** | `docker ps` | Displays all active containers, health status, and ports |
| 📜 **View Logs** | `docker compose logs -f` | Streams live output from all services for debugging |

---

### Option A: Run with Docker (Recommended — All Services in 1 Command)

Docker automatically builds and runs the React Frontend, Node.js Backend, MongoDB Database, Mongo Express GUI, and optionally Prometheus & Grafana.

#### Step 1: Open Docker Desktop
Ensure **Docker Desktop** is open and running on your machine.

#### Step 2: Open Terminal in Project Directory
```powershell
cd EduVibe-LMS
```

#### Step 3: Start the Application

- **To run Core Application only** (Frontend, Backend, MongoDB, Mongo Express):
  ```bash
  docker compose up -d
  ```

- **To run Application + Full Monitoring Stack** (Frontend, Backend, MongoDB, Mongo Express, Prometheus & Grafana):
  ```bash
  docker compose --profile monitoring up -d
  ```

#### Step 4: Verify Running Services
Run `docker ps` to verify all containers are active:
- `eduvibe-frontend` ➔ Up on port `3005`
- `eduvibe-backend` ➔ Up on port `5001` (healthy)
- `eduvibe-mongo-express` ➔ Up on port `8081`
- `eduvibe-mongo` ➔ Up on port `27018` (healthy)
- *(Optional)* `eduvibe-prometheus` ➔ Up on port `9091`
- *(Optional)* `eduvibe-grafana` ➔ Up on port `3001`

#### Step 5: Access the Local URLs in Browser

| Service | Docker URL | Local Native URL | Port Collision Guard |
| :--- | :--- | :--- | :--- |
| 🎓 **React Frontend** | [http://localhost:3005](http://localhost:3005) | [http://localhost:5173](http://localhost:5173) | ✅ `3005` vs `5173` (No conflict) |
| 🔌 **Backend API Health** | [http://localhost:5001/api/health](http://localhost:5001/api/health) | [http://localhost:5000/api/health](http://localhost:5000/api/health) | ✅ `5001` vs `5000` (No conflict) |
| 📊 **Prometheus Metrics** | [http://localhost:5001/metrics](http://localhost:5001/metrics) | [http://localhost:5000/metrics](http://localhost:5000/metrics) | ✅ `5001` vs `5000` (No conflict) |
| 🗄️ **MongoDB Web GUI** | [http://localhost:8081](http://localhost:8081) | *(Docker only)* | ✅ `8081` (Dedicated) |
| 🍃 **MongoDB Database** | `127.0.0.1:27018` | `127.0.0.1:27017` | ✅ `27018` vs `27017` (No conflict) |
| 📈 **Prometheus Server** | [http://localhost:9091](http://localhost:9091) | [http://localhost:9090](http://localhost:9090) | ✅ `9091` vs `9090` (No conflict) |
| 📊 **Grafana Analytics** | [http://localhost:3001](http://localhost:3001) | [http://localhost:3000](http://localhost:3000) | ✅ `3001` vs `3000` (No conflict) |

#### Step 6: How to Stop Docker Containers
When you are finished testing:
```bash
# Stop application:
docker compose down

# Stop application and monitoring:
docker compose --profile monitoring down
```

---

### Option B: Run Manually with Node.js & npm (Development Mode)

#### 1. Start Backend:
```bash
cd server
npm install
npm run dev
# Backend starts at http://localhost:5000
```

#### 2. Start Frontend:
```bash
cd ../client
npm install
npm run dev
# Frontend starts at http://localhost:5173
```

---

### 🔑 Local Starter Accounts for Testing

The database automatically seeds starter demo accounts on first launch:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@eduvibe.com` | `admin123` | Approve faculty, manage all users, view system KPIs |
| **Faculty** | `robert.smith@eduvibe.com` | `password123` | Create courses, quizzes, assignments, mark attendance |
| **Student** | *(Self-Register)* | *(Your Password)* | Click **Register as Student** on login page to get roll number STU-2026-XXXX |

---

## ☁️ AWS Cloud Deployment with Terraform

```bash
cd devops/terraform

# 1. Initialize AWS provider plugins
terraform init

# 2. Preview resources
terraform plan

# 3. Build entire cloud infrastructure on AWS (~2 minutes)
terraform apply -auto-approve

# 4. Tear down everything when done ($0 Cost Protection)
terraform destroy -auto-approve
```

---

## 📂 Repository Structure

```text
EduVibe/
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── pages/             # LoginPage, StudentDashboard, FacultyDashboard, AdminDashboard
│   │   ├── context/           # AuthContext (JWT session management)
│   │   ├── App.jsx
│   │   └── index.css          # Design tokens & glassmorphic styling
│   ├── vercel.json            # Vercel deployment configuration & reverse proxy
│   ├── Dockerfile             # Multi-stage Nginx container build
│   ├── nginx.conf             # Reverse proxy configuration
│   └── .dockerignore          # Frontend Docker ignore
│
├── server/                     # Node.js Express Backend
│   ├── models/                # User, Course, Attendance, Quiz, Assignment
│   ├── routes/                # auth.js, student.js, faculty.js, admin.js
│   ├── middleware/            # JWT verification & Multer file uploads
│   ├── server.js              # Express app + /metrics Prometheus endpoint
│   ├── Dockerfile             # Alpine Linux Node.js container (non-root)
│   └── .dockerignore          # Secret and cache ignore
│
├── devops/
│   ├── terraform/             # AWS Infrastructure as Code (EC2, S3, CloudFront, ECR, IAM, Elastic IP)
│   ├── k8s/                   # Kubernetes manifests (Mongo, Backend, Frontend, Ingress, Secrets, ConfigMap)
│   ├── monitoring/            # Prometheus scrape config & Grafana compose
│   ├── docker-compose.yml     # Container orchestration
│   └── Jenkinsfile            # Multi-stage CI/CD pipeline
│
├── .dockerignore              # Root container build ignore
├── .gitignore                 # Git ignore for secrets & build outputs
├── docker-compose.yml         # Root container configuration
├── Jenkinsfile                # Root CI/CD pipeline
└── README.md
```

---

## 👤 Author
- **Ajay Gangwar** - [GitHub](https://github.com/ajaygangwar945)
- SEM 6 Project - INT 377
