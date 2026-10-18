const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed extensions and MIME types whitelist
const ALLOWED_EXTENSIONS = new Set([
  'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'mp4', 'webm', 'mkv', 'mov', 'avi'
]);

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'video/mp4',
  'video/webm',
  'video/x-matroska',
  'video/quicktime',
  'video/x-msvideo',
  'video/avi',
]);

// Storage configuration with secure random filenames
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const randomHex = crypto.randomBytes(12).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    const safeField = file.fieldname.replace(/[^a-zA-Z0-9_-]/g, '');
    cb(null, `${safeField}-${Date.now()}-${randomHex}${ext}`);
  },
});

// File filter enforcing both extension and MIME validation
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error('Invalid file extension! Only PDFs, Documents, Images, and Videos are allowed.'), false);
  }

  // Check MIME type if present
  if (file.mimetype && !ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    return cb(new Error('Invalid file MIME type! Please upload a legitimate document or video.'), false);
  }

  cb(null, true);
};

// 100 MB max limit to accommodate lecture video clips
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 1,
  },
  fileFilter: fileFilter,
});

module.exports = upload;
