const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendError } = require('../utils/response');

const uploadDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename: replace special characters and duplicate underscores
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const cleanBase = baseName
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/__+/g, '_');
    cb(null, `${Date.now()}-${cleanBase}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';
  
  if (isPdfMime && isPdfExt) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const multerUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
}).single('resume');

const handleUpload = (req, res, next) => {
  multerUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return sendError(res, 'File size exceeds limit of 5MB', 400);
      }
      return sendError(res, `Upload error: ${err.message}`, 400);
    } else if (err) {
      return sendError(res, err.message, 400);
    }
    
    if (!req.file) {
      return sendError(res, 'No file uploaded', 400);
    }
    
    next();
  });
};

module.exports = { handleUpload };
