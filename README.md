<p align="center">
  <img src="assets/eduvibe-banner.jpg" alt="EduVibe - Next-Gen Learning Management & Academic Portal" width="100%" height="200" style="object-fit: cover; border-radius: 8px;">
</p>

<div align="center">

# 🎓 EduVibe - Next-Gen Learning Management & Academic Portal

[![Vercel Live](https://img.shields.io/badge/Vercel-Live%20Website-black?style=for-the-badge&logo=vercel)](https://edu-vibe-lms.vercel.app/)
[![Render API](https://img.shields.io/badge/Render-Live%20API-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://eduvibe-lms-backend-api.onrender.com/api/health)
[![AWS Cloud](https://img.shields.io/badge/AWS-EC2%20%7C%20S3%20%7C%20CloudFront-orange?style=for-the-badge&logo=amazon-aws)](https://aws.amazon.com/)
[![Terraform](https://img.shields.io/badge/IaC-Terraform-purple?style=for-the-badge&logo=terraform)](https://www.terraform.io/)
[![Docker](https://img.shields.io/badge/Docker-Containers-blue?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Prometheus](https://img.shields.io/badge/Monitoring-Prometheus%20%2B%20Grafana-E6522C?style=for-the-badge&logo=prometheus)](https://prometheus.io/)

</div>

---

## 📖 About The Project

Welcome to EduVibe - Next-Gen Learning Management & Academic Portal! This platform is designed to make academic management effortless for students, faculty, and administrators by uniting course notes, video lectures, attendance tracking, and quizzes into one simple, modern web application.

### ✨ Key Features

- 📚 **Courses & Study Materials** - Browse syllabus, download PDF notes, and stream video lectures
- ⏱️ **Timed Quizzes** - Interactive multiple-choice tests with countdown timers and instant scores
- 📅 **Attendance Tracking** - Daily attendance logging with a 75% minimum warning alert
- 📝 **Assignment Portal** - Easy online homework submission with faculty review and grading
- 🔐 **Secure Verification** - Fast 6-digit email OTP verification and encrypted user accounts
- 🛡️ **Role Dashboards** - Dedicated workspaces tailored for Students, Faculty, and Admin
- 🎨 **Modern Glassmorphic UI** - Clean aesthetic with smooth animations and Dark & Light themes
- 📱 **Fully Responsive** - Works smoothly on mobile phones, tablets, and desktop devices

---

## 🚀 Live Website

The project is fully deployed and accessible online.  

[![Live](https://img.shields.io/badge/Live-Visit%20Site-brightgreen?style=for-the-badge)](https://edu-vibe-lms.vercel.app/)

---

## 🏗️ System Architecture

EduVibe is designed with a modern, decoupled cloud architecture that keeps the frontend fast, the backend scalable, and operations fully automated.

```mermaid
flowchart TD
    subgraph Clients["🌐 End Users"]
        Student["👨‍🎓 Students"]
        Faculty["👩‍🏫 Faculty"]
        Admin["🛡️ Admin"]
    end

    subgraph FrontendTier["⚡ Frontend Tier (Vercel Global Edge)"]
        SPA["React 18 SPA (Vite)<br/>Modern Glassmorphism UI<br/>Tailored Dark & Light Themes"]
        Proxy["Vercel Edge Reverse Proxy<br/>/api/* ➔ Backend Service<br/>/uploads/* ➔ Media Storage"]
    end

    subgraph BackendTier["⚙️ Backend API Tier (Node.js & Express)"]
        API["Express.js REST API Server<br/>Port 5000"]
        Auth["JWT Authentication &<br/>Bcrypt Password Security"]
        Routes["Routes: Auth, Student,<br/>Faculty & Admin Operations"]
        Metrics["Prometheus Exporter<br/>/metrics Endpoint"]
    end

    subgraph CloudServices["☁️ Cloud & Database Tier"]
        Mongo["🍃 MongoDB Atlas Cloud Database<br/>Managed Multi-Region Replica Set"]
        Resend["📧 Resend Email Microservice<br/>6-Digit Transactional OTP Delivery"]
        S3["📦 AWS S3 + CloudFront CDN<br/>High-Speed Video & PDF Streaming"]
    end

    subgraph MonitoringTier["📊 Observability Tier"]
        Prom["📈 Prometheus Scraper<br/>Gathers Latency & Request Rates"]
        Graf["📉 Grafana Dashboards<br/>Real-Time Health & Traffic Visualizer"]
    end

    Clients -->|HTTPS Traffic| SPA
    SPA --> Proxy
    Proxy -->|API Calls| API
    API --> Auth
    API --> Routes
    Routes <-->|Queries & Writes| Mongo
    Routes -->|Send OTPs| Resend
    Routes -->|Upload Notes / Videos| S3
    S3 -.->|Stream Media| Clients
    API -.-> Metrics
    Metrics -.-> Prom
    Prom --> Graf
```

---

## 🧰 Technology Stack

| Layer | Technologies Used | Why It Was Chosen |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Vanilla CSS | Fast rendering, sub-second Hot Module Replacement (HMR), and custom glassmorphism design system. |
| **Backend** | Node.js, Express.js | Lightweight, non-blocking I/O, ideal for REST APIs and file streaming. |
| **Database** | MongoDB Atlas Cloud, Mongoose | Flexible JSON document model, managed cloud backups, automated failover, and TLS encryption. |
| **Email Service** | Resend API | Reliable, real-time transactional email delivery for 6-digit OTP verification codes. |
| **Containers** | Docker, Docker Compose, Kubernetes | Runs the entire application consistently across any machine or cloud server. |
| **Infrastructure as Code** | Terraform | Automates cloud infrastructure creation on AWS in under 45 seconds. |
| **Cloud Hosting** | AWS (EC2, S3, CloudFront), Vercel, Render | High availability with $0.00 infrastructure cost adhering to Free Tier limits. |
| **Monitoring** | Prometheus & Grafana | Real-time observability tracking CPU, memory, HTTP request rates, and response latency. |

---

## 🚀 How to Run the Project (4 Ways)

You can run EduVibe in whichever way fits your setup:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             CHOOSE YOUR EXECUTION METHOD                               │
├────────────────────┬────────────────────┬─────────────────────┬────────────────────────┤
│ 1. Local (npm)     │ 2. Docker Compose  │ 3. AWS + Vercel     │ 4. Vercel + Render     │
├────────────────────┼────────────────────┼─────────────────────┼────────────────────────┤
│ • Fast coding      │ • 1 command start  │ • Real AWS EC2      │ • Always live 24/7     │
│ • Hot reloading    │ • Isolated sandbox │ • Terraform IaC     │ • Zero maintenance     │
│ • Vite + Express   │ • Full stack ready │ • GitHub Actions CD │ • $0.00 free tier      │
└────────────────────┴────────────────────┴─────────────────────┴────────────────────────┘
```

---

### 💻 Method 1: Local Development (Fastest for Coding)

---

Best if you want to make changes to the code with instant browser refresh.

#### 1. Setup Environment Files

Copy the example environment templates:

```bash
# In the root folder:
cp .env.example .env

# In the backend folder:
cp backend/.env.example backend/.env
```

*(Add your MongoDB connection string and Resend API key to `.env`).*

#### 2. Start the Backend API (Terminal 1)

```powershell
cd backend
npm install
npm run dev
```

*Backend runs on `http://localhost:5000`.*

#### 3. Start the Frontend (Terminal 2)

```powershell
cd frontend
npm install
npm run dev
```

*Open `http://localhost:5173` in your browser.*

#### 📍 Localhost Endpoints & Service URLs

- 💻 **Frontend Web App:** [http://localhost:5173](http://localhost:5173) (Vite Dev Server with instant hot reload)
- ⚙️ **Backend REST API:** [http://localhost:5000](http://localhost:5000) (Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health))
- 📊 **Prometheus Exporter:** [http://localhost:5000/metrics](http://localhost:5000/metrics) (Live server metrics)
- 🍃 **Database:** MongoDB Atlas Cloud Cluster (Configured via `MONGO_URI` in `.env`)
- 📈 **Prometheus Server:** [http://localhost:9090](http://localhost:9090) (Local metrics collector)
- 📉 **Grafana Dashboard:** [http://localhost:3001](http://localhost:3001) (Real-time observability dashboard)

#### 🗺️ Local Development Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       LOCAL DEVELOPMENT ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   🌐 User Browser                                                           │
│         │                                                                   │
│         │ HTTP (Port 5173)                                                  │
│         ▼                                                                   │
│   [💻 React 18 Frontend] ──── (Vite Dev Server)                             │
│         │                                                                   │
│         │ API Requests (Port 5000)                                          │
│         ▼                                                                   │
│   [⚙️ Express Backend API] ──────► [🍃 MongoDB Atlas Cloud Database]         │
│         │                  ──────► [📧 Resend Cloud (6-Digit OTPs)]         │
│         │                                                                   │
│         │ Scrapes Telemetry (/metrics)                                      │
│         ▼                                                                   │
│   [📊 Prometheus (Port 9090)] ───► [📈 Grafana Dashboards (Port 3001)]      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 🐳 Method 2: Docker Compose (All-in-One Container Stack)

---

Best if you have Docker Desktop installed and want to run everything with a single command.

```bash
# Start Frontend, Backend, and MongoDB GUI:
docker compose up -d

# OR Start with Prometheus & Grafana monitoring included:
docker compose --profile monitoring up -d
```

**Local Docker Service Ports:**

- 🎓 **Web Portal:** [http://localhost:3005](http://localhost:3005)
- ⚡ **Backend API:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- 🍃 **Mongo Express Database Viewer:** [http://localhost:8081](http://localhost:8081)
- 📊 **Prometheus Metrics:** [http://localhost:9090](http://localhost:9090)
- 📈 **Grafana Dashboards:** [http://localhost:3001](http://localhost:3001)

```bash
# To stop containers safely (preserves your database data):
docker compose --profile monitoring down
```

---

### ☁️ Method 3: Cloud Deployment (AWS + Vercel + Terraform)

---

Best for deploying your own cloud infrastructure on AWS.

```bash
# 1. Provision AWS EC2 & Security Groups in under 45 seconds:
cd devops/terraform
terraform init
terraform apply -auto-approve

# 2. View your live URLs:
terraform output

# 3. Deploy changes anytime by pushing to GitHub:
git push origin main
```

*(To tear down all AWS resources and avoid any charges, run `terraform destroy -auto-approve`).*

---

### 🌐 Method 4: Production Cloud Tier (Vercel + Render + MongoDB Atlas)

---

Live, permanent production deployment requiring **$0.00 cost** and zero virtual machines to manage:

- **Web Frontend:** [https://edu-vibe-lms.vercel.app/](https://edu-vibe-lms.vercel.app/) (Served across Vercel Global Edge)
- **Backend API:** [https://eduvibe-lms-backend-api.onrender.com/api/health](https://eduvibe-lms-backend-api.onrender.com/api/health) (Render Docker Service)
- **Database:** MongoDB Atlas M0 Cloud Replica Set (AWS Singapore)
- **Emails:** Resend Cloud API for real-time 6-digit OTP delivery

---

## 🔑 System Roles & Access Control

Access to EduVibe is strictly role-based:

| System Role | Login Identifier | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Master Administrator** | Configured in `.env` (`ADMIN_EMAIL`) | Configured in `.env` (`ADMIN_PASSWORD`) | Single Master Admin Policy. Approve new faculty accounts, review platform analytics, manage user accounts. |
| **Academic Faculty** | Registered Faculty Email | User-defined password | Create courses, upload syllabus PDFs and lecture videos, record attendance, build quizzes, grade homework. |
| **Student** | Registered Student Email | User-defined password | Watch videos, download notes, take quizzes, submit assignments, track attendance percentage. |
| **Mongo Express GUI** | Configured in `.env` (`MONGO_EXPRESS_USER`) | Configured in `.env` (`MONGO_EXPRESS_PASSWORD`) | Web-based database collection inspection tool *(Docker profile)*. |
| **Grafana Analytics** | Configured in `.env` (`GRAFANA_ADMIN_USER`) | Configured in `.env` (`GRAFANA_ADMIN_PASSWORD`) | Telemetry dashboards showing server load and request response times. |

---

## 🛡️ Security Hardening Highlights

EduVibe is built with defense-in-depth principles:

1. **NoSQL Injection Protection:** Every input undergoes type checking (`typeof string`) to prevent MongoDB operator injection.
2. **Bcrypt Password Hashing:** User passwords are encrypted with 10 salt rounds before hitting the database.
3. **Log Sanitization:** Server connection logs automatically mask database passwords (`mongodb+srv://user:****@cluster...`).
4. **OTP Protection:** Verification codes expire automatically after 5 minutes and are never leaked in production HTTP responses.
5. **Rate Limiting:** Authentication routes are protected against brute-force attacks (maximum 20 attempts per 15-minute window).
6. **Non-Root Containers:** Backend Docker containers run under the unprivileged `USER node` account.
7. **Security Headers:** Reverse proxy enforces `X-Content-Type-Options: nosniff` and `X-Frame-Options: SAMEORIGIN`.
8. **End-to-End Encryption:** All communication is encrypted via HTTPS / TLS 1.3, and cloud storage volumes are encrypted at rest.

---

## 📁 Repository Directory Structure

```text
EduVibe-LMS/
├── assets/
│   └── eduvibe-banner.jpg      # Hero banner image
│
├── frontend/                   # React 18 Frontend
│   ├── src/
│   │   ├── pages/              # Login, Student, Faculty & Admin Dashboards
│   │   ├── components/         # Background animation, icons, theme toggles
│   │   ├── context/            # AuthContext (JWT session management)
│   │   └── index.css           # Modern glassmorphism CSS design system
│   ├── vercel.json             # Vercel edge reverse proxy configuration
│   ├── Dockerfile              # Multi-stage Nginx container build
│   └── nginx.conf              # Reverse proxy & security headers
│
├── backend/                    # Node.js Express REST API
│   ├── models/                 # User, Course, Attendance, Quiz, Assignment
│   ├── routes/                 # auth.js, student.js, faculty.js, admin.js
│   ├── middleware/             # JWT auth validation & Multer file uploads
│   ├── utils/                  # Resend transactional email OTP service
│   ├── server.js               # Express application & /metrics endpoint
│   ├── Dockerfile              # Lightweight Node.js 20 Alpine container
│   └── uploads/                # Directory for uploaded notes & videos
│
├── devops/
│   ├── terraform/              # AWS Infrastructure as Code (EC2, SG, IAM)
│   ├── k8s/                    # Kubernetes manifests (Deployments, Services)
│   └── monitoring/             # Prometheus scrape configuration & Grafana dashboard
│
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD Pipeline
│
├── docker-compose.yml          # Multi-container orchestration definition
├── documentation.txt           # In-depth architectural & build reference manual
└── README.md                   # Project overview & quickstart guide
```

---

## 👤 Author & Engineering Details

- **Ajay Gangwar** — [GitHub Profile](https://github.com/ajaygangwar945)
- **Project:** EduVibe — Next-Gen Learning Management & Academic Portal
- **Specialization:** Cloud & DevOps Architecture Engineering
