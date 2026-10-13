const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'eduvibe_secret', {
    expiresIn: '7d',
  });
};

// @route   POST /api/auth/register-student
// @desc    Register a new student account (immediately active)
router.post('/register-student', async (req, res) => {
  try {
    const { name, email, password, phone, address, department, courseName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    // Auto-generate student registration number (e.g., STU-2026-4821)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const regNumber = `STU-2026-${randomSuffix}`;

    const student = await User.create({
      name,
      email,
      password,
      role: 'student',
      phone: phone || '',
      address: address || '',
      department: department || 'Computer Science',
      courseName: courseName || '',
      regNumber,
      isApproved: true,
    });

    const token = generateToken(student._id);

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
// @desc    Register a faculty member (pending admin approval)
router.post('/register-faculty', async (req, res) => {
  try {
    const { name, email, password, department, courseName, address, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const faculty = await User.create({
      name,
      email,
      password,
      role: 'faculty',
      department: department || 'Computer Science',
      courseName: courseName || '',
      address: address || '',
      phone: phone || '',
      isApproved: false, // Requires Admin Approval
    });

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

// @route   POST /api/auth/login
// @desc    Login for Student, Faculty, or Admin
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Role verification
    if (role && user.role !== role) {
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

// @route   GET /api/auth/me
// @desc    Get currently logged-in user profile
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
