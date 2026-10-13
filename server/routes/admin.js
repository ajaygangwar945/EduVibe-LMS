const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

// All routes here require Admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics for Admin
router.get('/stats', async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty', isApproved: true });
    const pendingFaculty = await User.countDocuments({ role: 'faculty', isApproved: false });
    const totalCourses = await Course.countDocuments();

    res.json({
      success: true,
      data: {
        totalStudents,
        totalFaculty,
        pendingFaculty,
        totalCourses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/pending-faculty
// @desc    Get all faculty accounts waiting for admin approval
router.get('/pending-faculty', async (req, res) => {
  try {
    const pendingList = await User.find({ role: 'faculty', isApproved: false }).select('-password');
    res.json({ success: true, count: pendingList.length, data: pendingList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/admin/approve-faculty/:id
// @desc    Approve faculty member, generate Registration Number & activate account
router.post('/approve-faculty/:id', async (req, res) => {
  try {
    const faculty = await User.findById(req.params.id);

    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).json({ success: false, message: 'Faculty member not found.' });
    }

    if (faculty.isApproved) {
      return res.status(400).json({ success: false, message: 'Faculty is already approved.' });
    }

    // Generate unique Registration Number e.g. FAC-2026-1025
    const count = await User.countDocuments({ role: 'faculty', isApproved: true });
    const regNumber = req.body.customRegNumber || `FAC-2026-${(1001 + count)}`;

    faculty.isApproved = true;
    faculty.regNumber = regNumber;
    
    // Optional password update by admin if provided
    if (req.body.newPassword) {
      faculty.password = req.body.newPassword;
    }

    await faculty.save();

    res.json({
      success: true,
      message: `Faculty approved successfully with Registration Number: ${regNumber}`,
      data: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        regNumber: faculty.regNumber,
        isApproved: faculty.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/admin/reject-faculty/:id
// @desc    Reject and delete pending faculty registration
router.delete('/reject-faculty/:id', async (req, res) => {
  try {
    const faculty = await User.findById(req.params.id);
    if (!faculty || faculty.role !== 'faculty') {
      return res.status(404).json({ success: false, message: 'Faculty member not found.' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Faculty registration rejected and removed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users list (filtered by role optional)
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/admin/reports
// @desc    Get institutional summary reports
router.get('/reports', async (req, res) => {
  try {
    const courses = await Course.find().populate('faculty', 'name email department');
    const totalAttendanceDays = await Attendance.countDocuments();

    res.json({
      success: true,
      data: {
        totalAttendanceDays,
        coursesSummary: courses.map(c => ({
          id: c._id,
          title: c.title,
          code: c.code,
          department: c.department,
          facultyName: c.faculty ? c.faculty.name : 'Unassigned',
          enrolledCount: c.enrolledStudents.length,
          materialsCount: c.materials.length,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
