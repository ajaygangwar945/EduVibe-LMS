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
// Core Middleware
// -------------------------------------------------------------
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded PDFs and Videos statically
app.use('/uploads', express.static(uploadsPath));

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

// -------------------------------------------------------------
// Database Connection & Auto-Seed Function
// -------------------------------------------------------------
const User = require('./models/User');
const Course = require('./models/Course');

const seedDefaultData = async () => {
  try {
    // 1. Seed Default Admin if not exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@eduvibe.com';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        regNumber: 'ADMIN-001',
        department: 'Administration',
        isApproved: true,
      });
      console.log(`[Seed] Default Admin account created (${adminEmail})`);
    }

    // 2. Seed Sample Approved Faculty if no faculty exist
    const facultyCount = await User.countDocuments({ role: 'faculty' });
    if (facultyCount === 0) {
      const sampleFaculty = await User.create({
        name: 'Dr. Robert Smith',
        email: 'robert.smith@eduvibe.com',
        password: 'password123',
        role: 'faculty',
        department: 'Computer Science',
        regNumber: 'FAC-2026-1001',
        isApproved: true,
      });

      // Seed Initial Sample Course
      await Course.create({
        title: 'Full-Stack Web Development',
        code: 'CS301',
        department: 'Computer Science',
        description: 'Comprehensive course covering React, Node.js, Cloud deployment and DevOps.',
        faculty: sampleFaculty._id,
      });

      console.log('[Seed] Sample faculty and starter course created.');
    }
  } catch (error) {
    console.error('[Seed Error]:', error.message);
  }
};

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eduvibe';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log(`[Database] MongoDB connected successfully to ${MONGO_URI}`);
    await seedDefaultData();
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
