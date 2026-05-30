const express = require('express');
const {
  uploadAndAnalyze,
  getAllResumes,
  getResumeById,
  deleteResume,
  reanalyzeResume
} = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');

const router = express.Router();

router.post('/upload', protect, handleUpload, uploadAndAnalyze);
router.get('/', protect, getAllResumes);
router.get('/:id', protect, getResumeById);
router.delete('/:id', protect, deleteResume);

// Support both PUT /:id and POST /reanalyze/:id for re-analysis requirements
router.put('/:id', protect, reanalyzeResume);
router.post('/reanalyze/:id', protect, reanalyzeResume);

module.exports = router;
