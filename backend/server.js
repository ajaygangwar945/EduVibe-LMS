const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const client = require('prom-client');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads folder exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// -------------------------------------------------------------
// Prometheus Metrics Setup
// -------------------------------------------------------------
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Custom metric: HTTP request duration histogram
const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5],
});
register.registerMetric(httpRequestDurationMicroseconds);

// Middleware to track metrics for every incoming request
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route ? req.route.path : req.path, code: res.statusCode });
  });
  next();
});

// Metrics endpoint for Prometheus scraper
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// -------------------------------------------------------------
// Security & Core Middleware
// -------------------------------------------------------------
app.disable('x-powered-by'); // Hide Express signature

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '0');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Safe JSON body parsing limits to prevent memory exhaustion / DoS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded PDFs and Videos statically with security protections
app.use('/uploads', express.static(uploadsPath, {
  dotfiles: 'deny',
  maxAge: '1d',
}));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'EduVibe LMS Backend API',
    status: 'running',
    version: '1.0.0',
    frontendUrl: 'http://localhost:5173',
    endpoints: {
      health: '/api/health',
      metrics: '/metrics',
      auth: '/api/auth',
      admin: '/api/admin',
      faculty: '/api/faculty',
      student: '/api/student',
    },
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'EduVibe Backend API',
  });
});

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/student', require('./routes/student'));

// Centralized error handler to prevent internal trace exposure
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected server error occurred',
  });
});

// -------------------------------------------------------------
// Database Connection
// -------------------------------------------------------------
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eduvibe';

const User = require('./models/User');

async function seedDefaultAdmin() {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const email = (process.env.ADMIN_EMAIL || 'ajay.12322931@lpu.in').toLowerCase().trim();
      const password = process.env.ADMIN_PASSWORD || '123456';
      await User.create({
        name: 'System Administrator',
        email,
        password,
        role: 'admin',
        department: 'Administration',
        regNumber: 'ADM-001',
        isApproved: true,
      });
      console.log(`[Admin Seed] ✅ Initialized single master administrator: ${email}`);
    } else {
      console.log(`[Admin Seed] ✅ Master administrator verified in database (${adminCount} admin).`);
    }
  } catch (err) {
    console.warn('[Admin Seed] Notice:', err.message);
  }
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log(`[Database] MongoDB connected successfully to ${MONGO_URI}`);
    await seedDefaultAdmin();
  })
  .catch((err) => {
    console.warn(`[Database Warning] Could not connect to local MongoDB (${err.message}). When running in Docker/AWS, MongoDB container will connect automatically.`);
  });

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 EduVibe Backend running on port ${PORT}`);
  console.log(`📁 Static files available at http://localhost:${PORT}/uploads`);
  console.log(`📊 Prometheus metrics at http://localhost:${PORT}/metrics`);
  console.log(`===============================================`);
});
