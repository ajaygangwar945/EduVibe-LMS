const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Quiz = require('../models/Quiz');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protect all faculty routes
router.use(protect);
router.use(authorize('faculty', 'admin'));

// @route   GET /api/faculty/my-courses
// @desc    Get courses taught by this faculty member
router.get('/my-courses', async (req, res) => {
  try {
    const courses = await Course.find({ faculty: req.user._id })
      .populate('enrolledStudents', 'name email regNumber department')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/faculty/courses
// @desc    Create a new course/subject
router.post('/courses', async (req, res) => {
  try {
    const { title, code, department, description } = req.body;

    const existingCourse = await Course.findOne({ code: code.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({ success: false, message: 'A course with this code already exists.' });
    }

    const course = await Course.create({
      title,
      code: code.toUpperCase(),
      department: department || req.user.department,
      description,
      faculty: req.user._id,
    });

    res.status(201).json({ success: true, message: 'Course created successfully!', data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/faculty/courses/:id/upload-material
// @desc    Upload lecture PDF or Video to a course
router.post('/courses/:id/upload-material', upload.single('file'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID format.' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // IDOR protection: Verify faculty owns this course or is admin
    if (req.user.role !== 'admin' && course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to upload materials to this course.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a valid PDF, Document, or Video file to upload.' });
    }

    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const isVideo = ['mp4', 'webm', 'mkv', 'mov', 'avi'].includes(ext);
    const fileType = isVideo ? 'video' : 'pdf';

    const fileUrl = `/uploads/${req.file.filename}`;
    const materialTitle = (req.body.title && typeof req.body.title === 'string')
      ? req.body.title.trim()
      : req.file.originalname;

    course.materials.push({
      title: materialTitle,
      type: fileType,
      fileUrl: fileUrl,
      uploadedAt: new Date(),
    });

    await course.save();

    res.status(201).json({
      success: true,
      message: `${fileType.toUpperCase()} uploaded successfully!`,
      data: course.materials[course.materials.length - 1],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/faculty/courses/:id/students
// @desc    Get enrolled students for a specific course
router.get('/courses/:id/students', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID format.' });
    }

    const course = await Course.findById(req.params.id).populate('enrolledStudents', 'name email regNumber department phone');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // IDOR protection: Verify faculty owns this course or is admin
    if (req.user.role !== 'admin' && course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view student roster for this course.' });
    }

    res.json({ success: true, data: course.enrolledStudents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/faculty/attendance
// @desc    Mark attendance for enrolled students on a specific date
router.post('/attendance', async (req, res) => {
  try {
    const { courseId, date, records } = req.body;

    if (!courseId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Please provide courseId, date, and student records array.' });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID format.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // IDOR protection: Verify faculty owns this course or is admin
    if (req.user.role !== 'admin' && course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to mark attendance for this course.' });
    }

    // Check if attendance already exists for this date and course
    let attendance = await Attendance.findOne({ course: courseId, date });

    if (attendance) {
      attendance.records = records;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        course: courseId,
        faculty: req.user._id,
        date,
        records,
      });
    }

    res.json({ success: true, message: 'Attendance marked successfully!', data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/faculty/attendance/:courseId
// @desc    Get all attendance logs for a course
router.get('/attendance/:courseId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID format.' });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    if (req.user.role !== 'admin' && course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view attendance logs for this course.' });
    }

    const logs = await Attendance.find({ course: req.params.courseId })
      .populate('records.student', 'name regNumber email')
      .sort({ date: -1 });

    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/faculty/quizzes
// @desc    Create a new quiz for a course
router.post('/quizzes', async (req, res) => {
  try {
    const { title, courseId, durationMinutes, questions } = req.body;

    if (!title || !courseId || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide title, course, and at least one question.' });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID format.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // IDOR protection: Verify faculty owns this course or is admin
    if (req.user.role !== 'admin' && course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to create quizzes for this course.' });
    }

    const quiz = await Quiz.create({
      title: title.trim(),
      course: courseId,
      faculty: req.user._id,
      durationMinutes: Number(durationMinutes) || 15,
      questions,
    });

    res.status(201).json({ success: true, message: 'Quiz created successfully!', data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/faculty/quizzes
// @desc    Get all quizzes created by this faculty
router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ faculty: req.user._id })
      .populate('course', 'title code')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: quizzes.length, data: quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/faculty/assignments
// @desc    Create a new assignment for a course
router.post('/assignments', upload.single('attachment'), async (req, res) => {
  try {
    const { title, description, courseId, dueDate, maxMarks } = req.body;

    if (!title || !courseId || !dueDate) {
      return res.status(400).json({ success: false, message: 'Please provide title, course, and due date.' });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID format.' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    // IDOR protection: Verify faculty owns this course or is admin
    if (req.user.role !== 'admin' && course.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to create assignments for this course.' });
    }

    const fileAttachmentUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const assignment = await Assignment.create({
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      course: courseId,
      faculty: req.user._id,
      dueDate,
      maxMarks: Number(maxMarks) || 100,
      fileAttachmentUrl,
    });

    res.status(201).json({ success: true, message: 'Assignment created successfully!', data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/faculty/assignments
// @desc    Get all assignments created by this faculty
router.get('/assignments', async (req, res) => {
  try {
    const assignments = await Assignment.find({ faculty: req.user._id })
      .populate('course', 'title code')
      .populate('submissions.student', 'name email regNumber')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/faculty/assignments/:assignmentId/grade/:submissionId
// @desc    Grade a student's assignment submission
router.post('/assignments/:assignmentId/grade/:submissionId', async (req, res) => {
  try {
    const { marks, feedback } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.assignmentId) || !mongoose.Types.ObjectId.isValid(req.params.submissionId)) {
      return res.status(400).json({ success: false, message: 'Invalid assignment or submission ID format.' });
    }

    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    // IDOR protection: Verify faculty owns this assignment or is admin
    if (req.user.role !== 'admin' && assignment.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to grade this assignment.' });
    }

    const numericMarks = Number(marks);
    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > assignment.maxMarks) {
      return res.status(400).json({ success: false, message: `Marks must be a valid number between 0 and ${assignment.maxMarks}.` });
    }

    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    submission.marks = numericMarks;
    submission.feedback = typeof feedback === 'string' ? feedback.trim() : '';

    await assignment.save();

    res.json({ success: true, message: 'Submission graded successfully!', data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
