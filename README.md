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
│ 1. Local (npm)     │ 2. Docker / K8s    │ 3. AWS + Vercel     │ 4. Vercel + Render     │
├────────────────────┼────────────────────┼─────────────────────┼────────────────────────┤
│ • Fast coding      │ • Compose & K8s    │ • Real AWS EC2      │ • Always live 24/7     │
│ • Hot reloading    │ • 5 Pod replicas   │ • Terraform IaC     │ • Zero maintenance     │
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
│   User Browser                                                              │
│         │                                                                   │
│         │ HTTP (Port 5173)                                                  │
│         ▼                                                                   │
│   [React 18 Frontend] ──── (Vite Dev Server)                                │
│         │                                                                   │
│         │ API Requests (Port 5000)                                          │
│         ▼                                                                   │
│   [Express Backend API] ──────► [MongoDB Atlas Cloud Database]              │
│         │               ──────► [Resend Cloud (6-Digit OTPs)]               │
│         │                                                                   │
│         │ Scrapes Telemetry (/metrics)                                      │
│         ▼                                                                   │
│   [Prometheus (Port 9090)] ───► [Grafana Dashboards (Port 3001)]            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 🐳 Method 2: Desktop Containers & Kubernetes (Docker Compose & Minikube)

---

Best if you have Docker Desktop or Minikube installed and want to run the application in isolated, reproducible Linux containers.

#### 📦 Option 2.1: Docker Compose (Multi-Container Desktop Engine)

##### 1. Choose Your Run Mode

###### Mode A: Core Application Stack (Frontend + Backend)
Starts the React Nginx web client and Express REST API:
```bash
docker compose up -d
```

###### Mode B: Full Observability Stack (Core + Prometheus + Grafana)
Starts the entire system including real-time monitoring and dashboards:
```bash
docker compose --profile monitoring up -d
```

##### 📍 Local Docker Service Ports & Endpoints

- 🎓 **Web Portal (Frontend):** [http://localhost:3005](http://localhost:3005) (Nginx reverse proxy container)
- ⚡ **Backend API Server:** [http://localhost:5000](http://localhost:5000) (Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health))
- 📊 **Prometheus Exporter:** [http://localhost:5000/metrics](http://localhost:5000/metrics) (Live container telemetry)
- 🍃 **Database:** MongoDB Atlas Cloud Cluster (Configured via `MONGO_URI` in `.env`)
- 📈 **Prometheus Server:** [http://localhost:9090](http://localhost:9090) (Scrapes `/metrics` across `eduvibe-network`)
- 📉 **Grafana Dashboards:** [http://localhost:3001](http://localhost:3001) (Pre-configured real-time metrics visualizer)

##### 🗺️ Docker Compose Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DOCKER COMPOSE ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   User Browser                                                              │
│         │                                                                   │
│         │ HTTP (Port 3005)                                                  │
│         ▼                                                                   │
│   [Docker: eduvibe-frontend] ──── (Nginx Container on Port 3005)            │
│         │                                                                   │
│         │ Internal Bridge Network (eduvibe-network)                         │
│         ▼                                                                   │
│   [Docker: eduvibe-backend] (Port 5000)                                     │
│         ├───► [MongoDB Atlas Cloud Database]                                │
│         ├───► [Resend Cloud (6-Digit OTP Delivery)]                         │
│         │                                                                   │
│         │ Telemetry (/metrics)                                              │
│         ▼                                                                   │
│   [Docker: eduvibe-prometheus] (Port 9090)                                  │
│         │                                                                   │
│         │ Visualizes Metrics                                                │
│         ▼                                                                   │
│   [Docker: eduvibe-grafana] (Port 3001)                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

##### 🛑 Stop Docker Compose Stack
```bash
# Stops stack safely; uploads and data volumes preserved:
docker compose --profile monitoring down
```

---

#### ☸️ Option 2.2: Minikube (Local Kubernetes Cluster with 5 Replicas)

Deploy EduVibe onto a local single-node Kubernetes cluster featuring 8 total Pods (including 5 load-balanced Backend replicas, PVC storage, Prometheus, and Grafana).

##### 1. Start Minikube & Configure Docker Environment
```powershell
# Start local Kubernetes control-plane:
minikube start --driver=docker

# Point your terminal Docker CLI to Minikube's internal registry:
minikube docker-env | Invoke-Expression
```

##### 2. Build Container Images Inside Minikube
```bash
docker build -t eduvibe-backend:latest ./backend
docker build -t eduvibe-frontend:latest ./frontend
```

##### 3. Deploy Kubernetes Manifests & In-Cluster Secrets
```bash
# 1. Create dedicated 'eduvibe' isolated namespace:
kubectl apply -f devops/k8s/namespace.yaml

# 2. Inject environment secrets directly from your root .env file:
kubectl create secret generic eduvibe-secrets --namespace=eduvibe --from-env-file=".env" --dry-run=client -o yaml | kubectl apply -f -

# 3. Deploy Backend (5 Pod Replicas + PVC), Frontend (Nginx), and Monitoring:
kubectl apply -f devops/k8s/backend.yaml
kubectl apply -f devops/k8s/frontend.yaml
kubectl apply -f devops/k8s/monitoring.yaml
```

##### 4. Verify Cluster Health & Pods
```bash
kubectl get pods -n eduvibe -o wide
kubectl get deployments -n eduvibe
```
*(Confirms backend `5/5 READY`, frontend `1/1 READY`, prometheus `1/1 READY`, and grafana `1/1 READY`).*

##### 📍 Minikube Service Ports & Endpoints

- 🎓 **Web Portal (Frontend Pod):** [http://localhost:3006](http://localhost:3006) (Run: `kubectl port-forward svc/frontend -n eduvibe 3006:80` or `minikube service frontend -n eduvibe`)
- ⚡ **Backend API Service:** Port `5000` (ClusterIP load-balancing across 5 backend pod replicas)
- 📊 **Prometheus Exporter:** Port `5000/metrics` (Scraped in-cluster by Prometheus pod)
- 🍃 **Database:** MongoDB Atlas Cloud (Injected via Kubernetes Secret `eduvibe-secrets`)
- 📈 **Prometheus Server:** Port `9090` (In-cluster NodePort monitoring service)
- 📉 **Grafana Dashboard:** [http://localhost:3002](http://localhost:3002) (Run: `kubectl port-forward svc/grafana -n eduvibe 3002:3000`)
- ☸️ **Kubernetes Console:** `minikube dashboard` (Launches official Kubernetes web dashboard)

##### 🗺️ Minikube Kubernetes Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MINIKUBE KUBERNETES CLUSTER                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   User Browser                                                              │
│         │                                                                   │
│         │ HTTP (Port 3006 via port-forward)                                 │
│         ▼                                                                   │
│   [k8s: frontend-deployment] (1 Pod / Nginx Service)                        │
│         │                                                                   │
│         │ Internal Cluster DNS (http://backend:5000)                        │
│         ▼                                                                   │
│   [k8s: backend-service] ──── (ClusterIP Service)                           │
│         ├───► [Pod: backend-replica-1] ───► [MongoDB Atlas Cloud]           │
│         ├───► [Pod: backend-replica-2] ───► [Resend (6-Digit OTPs)]         │
│         ├───► [Pod: backend-replica-3]                                      │
│         ├───► [Pod: backend-replica-4]                                      │
│         └───► [Pod: backend-replica-5] ───► [PVC: backend-uploads-pvc]      │
│                     │                                                       │
│                     │ Scrapes /metrics                                      │
│                     ▼                                                       │
│   [k8s: prometheus-deployment] (Port 9090)                                  │
│         │                                                                   │
│         │ Visualizes Metrics                                                │
│         ▼                                                                   │
│   [k8s: grafana-deployment] (Port 3002 via port-forward)                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

##### 🛑 Stop & Clean Up Minikube
```bash
# Safely pause the cluster (preserves pods and PVC storage):
minikube stop

# OR delete the eduvibe namespace completely:
kubectl delete namespace eduvibe

# Complete wipe (deletes local Minikube cluster VM):
minikube delete
```

---

### ☁️ Method 3: Cloud Deployment (AWS + Vercel + Terraform)

---

Best for deploying a production-ready Decoupled Hybrid Cloud Architecture adhering 100% to the AWS Free Tier ($0.00 billable cost). The React web client is deployed on Vercel's Global Edge Network, while backend API, Prometheus, and Grafana containers run on an AWS EC2 instance (`t2.micro`, Ubuntu 22.04 LTS) in Mumbai (`ap-south-1`).

#### 1. Provision AWS Infrastructure with Terraform (Under 45 Seconds)

```bash
cd devops/terraform
terraform init
terraform apply -auto-approve
```

To display your live deployed endpoints:
```bash
terraform output
```

#### 2. Automated Continuous Deployment (GitHub Actions)

Every push to the `main` branch automatically triggers the CI/CD pipeline ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)):
1. Runs full syntax and quality validation on all JavaScript files.
2. Builds and validates Docker container images.
3. Dynamically queries AWS EC2 state and public IP via instance ID (`i-06a67a3041f734369`).
4. Connects via SSH to pull the latest code, rebuild containers, and prune unused images with zero downtime.

```bash
git push origin main
```

#### 3. Manual SSH Terminal Access (Optional)

You can SSH directly into the AWS EC2 instance to inspect live Docker containers:
```bash
ssh -i ~/.ssh/webserver.pem ubuntu@<YOUR_AWS_EC2_IP>
docker ps
curl http://localhost:5000/api/health
```

#### 📍 Live Cloud Service Ports & Endpoints

- 🌐 **Web Frontend (Vercel Global Edge):** [https://edu-vibe-lms.vercel.app/](https://edu-vibe-lms.vercel.app/)
- ⚡ **Backend API Server (AWS EC2):** `http://<YOUR_AWS_EC2_IP>:5000` (Health check: `http://<YOUR_AWS_EC2_IP>:5000/api/health`)
  *(Verified EC2 IP: [`http://16.4.32.15:5000/api/health`](http://16.4.32.15:5000/api/health))*
- 📊 **Prometheus Exporter:** `http://<YOUR_AWS_EC2_IP>:5000/metrics` (Live EC2 container metrics)
- 🍃 **Database:** MongoDB Atlas M0 Cloud Replica Set (Encrypted TLS connection)
- 📈 **Prometheus Server:** `http://<YOUR_AWS_EC2_IP>:9090` (Scrapes `/metrics` across AWS instance)
- 📉 **Grafana Dashboards:** `http://<YOUR_AWS_EC2_IP>:3001` (Live production telemetry visualizer)

#### 🗺️ AWS Hybrid Cloud Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                   AWS HYBRID CLOUD DEPLOYMENT ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   User Browser                                                              │
│         │                                                                   │
│         │ HTTPS (Global Edge Network)                                       │
│         ▼                                                                   │
│   [Vercel Global Edge] ────── (React 18 SPA at edu-vibe-lms.vercel.app)     │
│         │                                                                   │
│         │ Edge Reverse Proxy (/api/* ──► AWS EC2)                           │
│         ▼                                                                   │
│   [AWS EC2 t2.micro Node] ─── (Ubuntu 22.04 LTS in Mumbai ap-south-1)       │
│         ├───► [Docker: backend-api] (Port 5000 /api/health)                 │
│         │         ├───► [MongoDB Atlas Managed Cloud Database]              │
│         │         └───► [Resend API (Transactional OTP Emails)]             │
│         │                                                                   │
│         ├───► [Docker: frontend] (Nginx Container on Port 3005)             │
│         ├───► [Docker: prometheus] (Metrics Scraper on Port 9090)           │
│         └───► [Docker: grafana] (Telemetry Dashboard on Port 3001)          │
│                                                                             │
│   Continuous Deployment (GitHub Actions Runner)                             │
│         │                                                                   │
│         │ Dynamic IP Discovery & Automated SSH Deploy                       │
│         ▼                                                                   │
│   [Live EC2 Instance] ─────── (Zero-Downtime Container Rebuild)             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 4. Cost Protection ($0.00 Free Tier) & Teardown

- **Pause EC2 Instance** (Stops hourly compute while preserving the 20GB root volume):
  ```bash
  aws ec2 stop-instances --instance-ids i-06a67a3041f734369
  ```
- **Resume EC2 Instance** (GitHub Actions auto-discovers the new IP upon push):
  ```bash
  aws ec2 start-instances --instance-ids i-06a67a3041f734369
  ```
- **Complete Cloud Teardown** (Terminates all AWS infrastructure in under 45 seconds):
  ```bash
  cd devops/terraform
  terraform destroy -auto-approve
  ```

---

### 🌐 Method 4: Production Cloud Tier (Vercel + Render + MongoDB Atlas)

---

Always-available, 24/7 permanent production deployment requiring **$0.00 infrastructure cost** and zero virtual machines to manage. The React 18 single-page application is served globally across Vercel's Edge Network with edge proxying and SSL, while the containerized Node.js REST API runs on Render's Docker Web Service, connecting to an encrypted MongoDB Atlas Cloud database and delivering transactional emails via Resend.

#### 📍 Production Cloud Service Ports & Endpoints

- 🌐 **Web Frontend (Vercel Global Edge):** [https://edu-vibe-lms.vercel.app/](https://edu-vibe-lms.vercel.app/) (Served over HTTP/2 with TLS 1.3)
- ⚡ **Backend API Server (Render):** [https://eduvibe-lms-backend-api.onrender.com](https://eduvibe-lms-backend-api.onrender.com) (Containerized Express Engine)
- 🔌 **API Health Check:** [https://eduvibe-lms-backend-api.onrender.com/api/health](https://eduvibe-lms-backend-api.onrender.com/api/health)
- 📊 **Prometheus Exporter:** [https://eduvibe-lms-backend-api.onrender.com/metrics](https://eduvibe-lms-backend-api.onrender.com/metrics) (Live production telemetry)
- 🍃 **Database:** MongoDB Atlas M0 Cloud Replica Set (`AWS ap-southeast-1` Singapore)
- 📧 **Transactional Emails:** Resend Cloud API for real-time 6-digit OTP delivery
- 📖 **Full Engineering Manual:** [`documentation.txt`](https://github.com/ajaygangwar945/EduVibe-LMS/blob/main/documentation.txt)

#### 🗺️ Production Cloud Tier Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                  PRODUCTION CLOUD TIER ARCHITECTURE (24/7)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   User Browser (Global Clients)                                             │
│         │                                                                   │
│         │ HTTPS (HTTP/2, TLS 1.3)                                           │
│         ▼                                                                   │
│   [Vercel Global Edge CDN] ──── (https://edu-vibe-lms.vercel.app)           │
│         │                                                                   │
│         │ Edge Reverse Proxy (/api/* ──► Render Web Service)                │
│         ▼                                                                   │
│   [Render Docker Service] ───── (eduvibe-lms-backend-api.onrender.com)      │
│         ├───► [MongoDB Atlas M0 Cloud] (Managed Replica Set in Singapore)   │
│         ├───► [Resend Email Microservice] (Real-Time 6-Digit OTP Delivery)  │
│         └───► [Prometheus Exporter] (/metrics Live Telemetry Endpoint)      │
│                                                                             │
│   Automated Git Push Deployments (GitHub ──► Render & Vercel)               │
│         │                                                                   │
│         │ Automatic Webhook Container Builds & Zero-Downtime Rollouts       │
│         ▼                                                                   │
│   [Production Cloud Tier] ───── ($0.00 Infrastructure Cost & 24/7 Uptime)     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 🧪 Live Automated Health Verification

You can verify the production services directly from your terminal:

```bash
# 1. Verify live backend health status (HTTP 200 OK from Render):
curl https://eduvibe-lms-backend-api.onrender.com/api/health

# 2. Inspect real-time Prometheus telemetry metrics:
curl https://eduvibe-lms-backend-api.onrender.com/metrics
```

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
