const { body, validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation error', 400, errors.array());
  }
  next();
};

const registerValidator = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validateFields
];

const loginValidator = [
  body('email').isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validateFields
];

const profileValidator = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
  body('email').optional().isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('currentPassword').optional().notEmpty().withMessage('Current password is required if updating password'),
  body('newPassword').optional().isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  validateFields
];

module.exports = { registerValidator, loginValidator, profileValidator };
