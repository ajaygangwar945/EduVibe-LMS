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

## 🌐 Live Cloud Deployment
- 🔗 **Web Portal**: [http://54.234.46.138:3005](http://54.234.46.138:3005)
- 🍃 **MongoDB Visual Cloud Explorer**: [http://54.234.46.138:8081](http://54.234.46.138:8081)
- 📊 **Prometheus Metrics**: [http://54.234.46.138:9090](http://54.234.46.138:9090)
- 📈 **Grafana Analytics**: [http://54.234.46.138:3001](http://54.234.46.138:3001)

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

---

## 🚀 Quick Start (Local Run with Docker)

Clone the repository and run all services with one command:

```bash
git clone https://github.com/ajaygangwar945/EduVibe-LMS.git
cd EduVibe-LMS
docker compose up -d --build
```

Access locally:
- **Frontend**: [http://localhost:3005](http://localhost:3005)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **MongoDB Explorer**: [http://localhost:8081](http://localhost:8081)

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
│   ├── Dockerfile             # Multi-stage Nginx container build
│   └── nginx.conf             # Reverse proxy configuration
│
├── server/                     # Node.js Express Backend
│   ├── models/                # User, Course, Attendance, Quiz, Assignment
│   ├── routes/                # auth.js, student.js, faculty.js, admin.js
│   ├── middleware/            # JWT verification & Multer file uploads
│   ├── server.js              # Express app + /metrics Prometheus endpoint
│   └── Dockerfile             # Alpine Linux Node.js container
│
├── devops/
│   ├── terraform/             # AWS Infrastructure as Code (EC2, S3, CloudFront, ECR, IAM)
│   ├── k8s/                   # Kubernetes manifests (Mongo, Backend, Frontend, Ingress)
│   ├── monitoring/            # Prometheus scrape config & Grafana compose
│   ├── docker-compose.yml     # Container orchestration
│   └── Jenkinsfile            # Multi-stage CI/CD pipeline
│
├── docker-compose.yml         # Root container configuration
└── README.md
```

---

## 👤 Author
- **Ajay Gangwar** - [GitHub](https://github.com/ajaygangwar945)
- SEM 6 Project - INT 377
