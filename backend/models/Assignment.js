const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    maxMarks: {
      type: Number,
      default: 100,
    },
    // Optional brief PDF attached by teacher
    fileAttachmentUrl: {
      type: String,
      default: '',
    },
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        fileUrl: {
          type: String,
          required: true,
        },
        fileName: {
          type: String,
          default: 'submission.pdf',
        },
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        marks: {
          type: Number,
          default: null,
        },
        feedback: {
          type: String,
          default: '',
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
