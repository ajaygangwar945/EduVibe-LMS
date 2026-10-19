const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../utils/emailService');
const { protect } = require('../middleware/auth');

// In-memory rate limiting against brute-force login attacks
const loginAttempts = new Map();
const rateLimitAuth = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 20;

  const record = loginAttempts.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowMs;
  }

  if (record.count >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts from this IP. Please wait 15 minutes before trying again.',
    });
  }

  record.count++;
  loginAttempts.set(ip, record);
  next();
};

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'eduvibe_docker_jwt_key_2026', {
    expiresIn: '7d',
  });
};

// @route   POST /api/auth/send-otp
// @desc    Send 6-digit OTP verification code via Resend
router.post('/send-otp', rateLimitAuth, async (req, res) => {
  try {
    const { email, purpose } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const validPurposes = ['registration', 'password_reset'];
    const cleanPurpose = validPurposes.includes(purpose) ? purpose : 'registration';

    // Validate email according to purpose
    if (cleanPurpose === 'registration') {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'This email is already registered. Please sign in instead.' });
      }
    } else if (cleanPurpose === 'password_reset') {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({ success: false, message: 'No registered account found with this email address.' });
      }
    }

    // Generate random 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Invalidate previous OTPs for this email and purpose
    await OTP.deleteMany({ email: cleanEmail, purpose: cleanPurpose });

    // Store new OTP with 5-minute auto expiration
    await OTP.create({
      email: cleanEmail,
      otp,
      purpose: cleanPurpose,
    });

    // Send email via Resend API
    const emailResult = await sendOTPEmail(cleanEmail, otp, cleanPurpose);

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Valid for 5 minutes.`,
      devOtp: process.env.NODE_ENV === 'production' ? undefined : (emailResult.delivered ? undefined : emailResult.devOtp),
    });
  } catch (error) {
    console.error('Error in send-otp:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/register-student
// @desc    Register a new student account (immediately active upon OTP verification)
router.post('/register-student', rateLimitAuth, async (req, res) => {
  try {
    const { name, email, password, phone, address, department, courseName, otp } = req.body;

    // Strict type check to prevent NoSQL operator injection
    if (!name || typeof name !== 'string' || !email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide valid name, email, and password.' });
    }

    if (!otp || typeof otp !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide the 6-digit verification code (OTP) sent to your email.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify OTP
    const validOtp = await OTP.findOne({ email: cleanEmail, otp: otp.trim(), purpose: 'registration' });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code (OTP). Please request a new code.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    // Auto-generate student registration number (e.g., STU-2026-4821)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const regNumber = `STU-2026-${randomSuffix}`;

    const student = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'student',
      phone: typeof phone === 'string' ? phone.trim() : '',
      address: typeof address === 'string' ? address.trim() : '',
      department: typeof department === 'string' ? department.trim() : 'Computer Science',
      courseName: typeof courseName === 'string' ? courseName.trim() : '',
      regNumber,
      isApproved: true,
    });

    const token = generateToken(student._id);

    // Consume and delete the validated OTP
    await OTP.deleteMany({ email: cleanEmail, purpose: 'registration' });

    res.status(201).json({
      success: true,
      message: 'Student account registered successfully!',
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role,
        regNumber: student.regNumber,
        department: student.department,
      },
    });
  } catch (error) {
    console.error('Error in student registration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/register-faculty
// @desc    Register a faculty member (pending admin approval upon OTP verification)
router.post('/register-faculty', rateLimitAuth, async (req, res) => {
  try {
    const { name, email, password, department, courseName, address, phone, otp } = req.body;

    // Strict type check to prevent NoSQL operator injection
    if (!name || typeof name !== 'string' || !email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide valid name, email, and password.' });
    }

    if (!otp || typeof otp !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide the 6-digit verification code (OTP) sent to your email.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify OTP
    const validOtp = await OTP.findOne({ email: cleanEmail, otp: otp.trim(), purpose: 'registration' });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code (OTP). Please request a new code.' });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const faculty = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'faculty',
      department: typeof department === 'string' ? department.trim() : 'Computer Science',
      courseName: typeof courseName === 'string' ? courseName.trim() : '',
      address: typeof address === 'string' ? address.trim() : '',
      phone: typeof phone === 'string' ? phone.trim() : '',
      isApproved: false, // Requires Admin Approval
    });

    // Consume and delete the validated OTP
    await OTP.deleteMany({ email: cleanEmail, purpose: 'registration' });

    res.status(201).json({
      success: true,
      message: 'Faculty registration submitted! Your account is pending admin approval. You will receive your Registration Number upon approval.',
      pendingApproval: true,
      user: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        department: faculty.department,
      },
    });
  } catch (error) {
    console.error('Error in faculty registration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/register-admin
// @desc    Register administrator account (only allowed if no admin exists)
router.post('/register-admin', rateLimitAuth, async (req, res) => {
  try {
    // Only ONE admin allowed in the entire system
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount >= 1) {
      return res.status(403).json({
        success: false,
        message: 'Admin registration is disabled: Only one master administrator is allowed in EduVibe.',
      });
    }

    const { name, email, password, phone, address, department } = req.body;

    if (!name || typeof name !== 'string' || !email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide valid name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const regNumber = `ADM-${randomSuffix}`;

    const admin = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: 'admin',
      phone: typeof phone === 'string' ? phone.trim() : '',
      address: typeof address === 'string' ? address.trim() : '',
      department: typeof department === 'string' ? department.trim() : 'Administration',
      regNumber,
      isApproved: true,
    });

    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully!',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        regNumber: admin.regNumber,
        department: admin.department,
      },
    });
  } catch (error) {
    console.error('Error in admin registration:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login for Student, Faculty, or Admin
router.post('/login', rateLimitAuth, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide valid email and password strings.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Role verification
    if (role && typeof role === 'string' && user.role !== role.trim()) {
      return res.status(403).json({
        success: false,
        message: `Account found, but role does not match. Please log in as '${user.role}'.`,
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check if faculty is approved
    if (user.role === 'faculty' && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your faculty account is pending admin approval. You will be given your Registration Number once approved.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        regNumber: user.regNumber,
        department: user.department,
        courseName: user.courseName,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password for any user account (Student, Faculty, Admin) with OTP
router.post('/reset-password', rateLimitAuth, async (req, res) => {
  try {
    const { email, newPassword, confirmPassword, otp } = req.body;

    if (!email || typeof email !== 'string' || !newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide email and new password.' });
    }

    if (!otp || typeof otp !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide the 6-digit verification code (OTP) sent to your email.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New password and confirm password do not match.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify OTP
    const validOtp = await OTP.findOne({ email: cleanEmail, otp: otp.trim(), purpose: 'password_reset' });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code (OTP). Please request a new code.' });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered user found with this email address.' });
    }

    user.password = newPassword;
    await user.save();

    // Consume and delete the validated OTP
    await OTP.deleteMany({ email: cleanEmail, purpose: 'password_reset' });

    res.json({
      success: true,
      message: `Password reset successfully for ${user.name} (${user.role.toUpperCase()})! You can now log in with your new password.`,
    });
  } catch (error) {
    console.error('Error in reset password:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get currently logged-in user profile
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
