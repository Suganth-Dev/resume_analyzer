const express = require('express');
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/authController');
const { registerValidator, loginValidator, profileValidator } = require('../middleware/validator');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, profileValidator, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
