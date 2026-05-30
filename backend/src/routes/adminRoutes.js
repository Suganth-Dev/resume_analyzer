const express = require('express');
const {
  adminLogin,
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getResumes,
  getResumeById,
  deleteResume
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Public Admin Login (Separate System)
router.post('/login', adminLogin);

// Protected Admin Routes (Requires authentication and role 'admin')
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/dashboard/stats', getDashboardStats);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/resumes', getResumes);
router.get('/resumes/:id', getResumeById);
router.delete('/resumes/:id', deleteResume);

module.exports = router;
