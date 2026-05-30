const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');
const { 
  sendWelcomeEmail, 
  sendLoginNotificationEmail, 
  sendPasswordResetEmail 
} = require('../services/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendError(res, 'Email is already registered', 400);
    }

    const user = await User.create({
      name,
      email,
      password
    });

    const token = generateToken(user._id);

    // Send Welcome Email asynchronously
    sendWelcomeEmail(user.email, user.name).catch(err => 
      console.error('Welcome email async send failed:', err)
    );

    return sendSuccess(res, 'Registration successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return sendError(res, 'Server error during registration', 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'Invalid email or password', 400);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 400);
    }

    const token = generateToken(user._id);

    // Send Login Notification Email asynchronously
    sendLoginNotificationEmail(user.email, user.name).catch(err => 
      console.error('Login alert email async send failed:', err)
    );

    return sendSuccess(res, 'Login successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 'Server error during login', 500);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, 'User profile fetched successfully', { user });
  } catch (error) {
    console.error('Get profile error:', error);
    return sendError(res, 'Server error fetching profile', 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const { name, email, currentPassword, newPassword } = req.body;

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return sendError(res, 'Email already in use', 400);
      }
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    if (newPassword) {
      if (!currentPassword) {
        return sendError(res, 'Current password is required to change password', 400);
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return sendError(res, 'Incorrect current password', 400);
      }
      user.password = newPassword;
    }

    await user.save();

    return sendSuccess(res, 'Profile updated successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return sendError(res, 'Server error updating profile', 500);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 'Email is required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return success response to avoid email enumeration security issues
      return sendSuccess(res, 'If that email exists, reset instructions have been sent.');
    }

    // Generate secure random reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour limit

    await user.save();

    // Construct reset link
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;

    // Send reset email
    const emailResult = await sendPasswordResetEmail(user.email, user.name, resetLink);
    if (!emailResult.success) {
      return sendError(res, 'Failed to send password reset email. Please try again later.', 500);
    }

    return sendSuccess(res, 'Password reset instructions sent successfully');
  } catch (error) {
    console.error('Forgot password controller error:', error);
    return sendError(res, 'Server error processing forgot password request', 500);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return sendError(res, 'Token and new password are required', 400);
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return sendError(res, 'Password reset token is invalid or has expired', 400);
    }

    // Update password (pre-save hook will handle hashing automatically)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return sendSuccess(res, 'Password has been reset successfully');
  } catch (error) {
    console.error('Reset password controller error:', error);
    return sendError(res, 'Server error resetting password', 500);
  }
};

module.exports = { register, login, getProfile, updateProfile, forgotPassword, resetPassword };
