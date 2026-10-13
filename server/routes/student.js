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

// Protect all student routes
router.use(protect);
router.use(authorize('student'));

// @route   GET /api/student/dashboard
// @desc    Get student profile & overview of enrolled courses
router.get('/dashboard', async (req, res) => {
  try {
    const student = await User.findById(req.user._id).populate({
      path: 'enrolledCourses',
      populate: { path: 'faculty', select: 'name email department' },
    });

    res.json({
      success: true,
      data: {
        profile: {
          id: student._id,
          name: student.name,
          email: student.email,
          regNumber: student.regNumber,
          department: student.department,
          phone: student.phone,
          address: student.address,
        },
        enrolledCourses: student.enrolledCourses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/student/courses
// @desc    Browse all available courses in the college
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('faculty', 'name email department')
      .sort({ createdAt: -1 });

    const student = await User.findById(req.user._id);
    const enrolledIds = student.enrolledCourses.map(id => id.toString());

    // Mark which courses the student is already enrolled in
    const coursesWithStatus = courses.map(course => ({
      ...course.toObject(),
      isEnrolled: enrolledIds.includes(course._id.toString()),
    }));

    res.json({ success: true, count: coursesWithStatus.length, data: coursesWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/student/courses/:id/enroll
// @desc    Enroll student in a course
router.post('/courses/:id/enroll', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid course ID format.' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const student = await User.findById(req.user._id);

    // Reliable ObjectId string check to prevent duplicate enrollments
    const alreadyEnrolled = student.enrolledCourses.some(id => id.toString() === course._id.toString());
    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this course.' });
    }

    student.enrolledCourses.push(course._id);
    await student.save();

    const courseHasStudent = course.enrolledStudents.some(id => id.toString() === student._id.toString());
    if (!courseHasStudent) {
      course.enrolledStudents.push(student._id);
      await course.save();
    }

    res.json({ success: true, message: `Successfully enrolled in ${course.title}!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/student/quizzes
// @desc    Get all quizzes available for the student's enrolled courses
router.get('/quizzes', async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    const quizzes = await Quiz.find({ course: { $in: student.enrolledCourses } })
      .populate('course', 'title code')
      .sort({ createdAt: -1 });

    // Format quizzes: mask correct answers for pending quizzes, show student's past score if already taken
    const formattedQuizzes = quizzes.map(quiz => {
      const submission = quiz.submissions.find(
        sub => sub.student.toString() === req.user._id.toString()
      );

      return {
        id: quiz._id,
        title: quiz.title,
        course: quiz.course,
        durationMinutes: quiz.durationMinutes,
        totalQuestions: quiz.questions.length,
        hasSubmitted: !!submission,
        score: submission ? submission.score : null,
        totalPoints: submission ? submission.totalPoints : null,
        submittedAt: submission ? submission.submittedAt : null,
        // Only return questions without the answers revealed if not taken yet
        questions: quiz.questions.map(q => ({
          _id: q._id,
          questionText: q.questionText,
          options: q.options,
          points: q.points,
        })),
      };
    });

    res.json({ success: true, count: formattedQuizzes.length, data: formattedQuizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/student/quizzes/:id/submit
// @desc    Submit answers for a quiz with instant auto-grading
router.post('/quizzes/:id/submit', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid quiz ID format.' });
    }

    const { answers } = req.body; // Array of selected option indices
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found.' });
    }

    // Authorization check: Verify student is enrolled in the quiz course
    const student = await User.findById(req.user._id);
    const isEnrolled = student.enrolledCourses.some(id => id.toString() === quiz.course.toString());
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: 'You must be enrolled in this course to take the quiz.' });
    }

    // Check if student already submitted
    const existing = quiz.submissions.find(
      sub => sub.student.toString() === req.user._id.toString()
    );
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted this quiz.' });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers must be submitted as an array.' });
    }

    // Calculate score
    let score = 0;
    let totalPoints = 0;

    quiz.questions.forEach((q, idx) => {
      totalPoints += q.points || 1;
      if (answers[idx] !== undefined && Number(answers[idx]) === q.correctOptionIndex) {
        score += q.points || 1;
      }
    });

    quiz.submissions.push({
      student: req.user._id,
      answers: answers || [],
      score,
      totalPoints,
      submittedAt: new Date(),
    });

    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz submitted successfully!',
      data: {
        score,
        totalPoints,
        percentage: totalPoints > 0 ? ((score / totalPoints) * 100).toFixed(1) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/student/assignments
// @desc    Get assignments for enrolled courses with student submission status
router.get('/assignments', async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    const assignments = await Assignment.find({ course: { $in: student.enrolledCourses } })
      .populate('course', 'title code')
      .populate('faculty', 'name email')
      .sort({ dueDate: 1 });

    const formattedAssignments = assignments.map(a => {
      const mySubmission = a.submissions.find(
        sub => sub.student.toString() === req.user._id.toString()
      );

      return {
        id: a._id,
        title: a.title,
        description: a.description,
        course: a.course,
        faculty: a.faculty,
        dueDate: a.dueDate,
        maxMarks: a.maxMarks,
        fileAttachmentUrl: a.fileAttachmentUrl,
        hasSubmitted: !!mySubmission,
        submission: mySubmission || null,
      };
    });

    res.json({ success: true, count: formattedAssignments.length, data: formattedAssignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/student/assignments/:id/submit
// @desc    Submit assignment PDF file
router.post('/assignments/:id/submit', upload.single('submissionFile'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid assignment ID format.' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    // Verify student is enrolled in the course that issued this assignment
    const student = await User.findById(req.user._id);
    const isEnrolled = student.enrolledCourses.some(id => id.toString() === assignment.course.toString());
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: 'You must be enrolled in this course to submit assignments.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF submission file.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    // Check if already submitted -> update or append
    const existingIndex = assignment.submissions.findIndex(
      sub => sub.student.toString() === req.user._id.toString()
    );

    if (existingIndex !== -1) {
      assignment.submissions[existingIndex].fileUrl = fileUrl;
      assignment.submissions[existingIndex].fileName = req.file.originalname;
      assignment.submissions[existingIndex].submittedAt = new Date();
    } else {
      assignment.submissions.push({
        student: req.user._id,
        fileUrl,
        fileName: req.file.originalname,
        submittedAt: new Date(),
      });
    }

    await assignment.save();

    res.json({
      success: true,
      message: 'Assignment submitted successfully!',
      fileUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/student/attendance
// @desc    Get student's overall attendance & subject-wise breakdown
router.get('/attendance', async (req, res) => {
  try {
    const student = await User.findById(req.user._id).populate('enrolledCourses', 'title code');
    const enrolledCourseIds = student.enrolledCourses.map(c => c._id);

    const logs = await Attendance.find({ course: { $in: enrolledCourseIds } }).populate('course', 'title code');

    let totalClasses = 0;
    let presentClasses = 0;
    const courseStats = {};

    student.enrolledCourses.forEach(c => {
      courseStats[c._id.toString()] = {
        courseTitle: c.title,
        courseCode: c.code,
        total: 0,
        present: 0,
        percentage: 0,
      };
    });

    logs.forEach(log => {
      // Null-safety check for course reference
      if (!log.course || !log.course._id) return;
      const courseIdStr = log.course._id.toString();

      const record = log.records.find(
        r => r.student && r.student.toString() === req.user._id.toString()
      );

      if (record && courseStats[courseIdStr]) {
        totalClasses++;
        courseStats[courseIdStr].total++;

        if (record.status === 'present') {
          presentClasses++;
          courseStats[courseIdStr].present++;
        }
      }
    });

    // Calculate percentages
    Object.keys(courseStats).forEach(key => {
      const stat = courseStats[key];
      stat.percentage = stat.total > 0 ? ((stat.present / stat.total) * 100).toFixed(1) : 100;
    });

    const overallPercentage = totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(1) : 100;

    res.json({
      success: true,
      data: {
        totalClasses,
        presentClasses,
        overallPercentage,
        courseBreakdown: Object.values(courseStats),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
