const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const { sendSuccess, sendError } = require('../utils/response');
const fs = require('fs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Administrative Login
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'Invalid credentials', 400);
    }

    // Direct role verification
    if (user.role !== 'admin') {
      return sendError(res, 'Access denied. Administrative privileges required.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 400);
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 'Admin authentication successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return sendError(res, 'Server error during admin login', 500);
  }
};

/**
 * Aggregations for Admin Dashboard Stats & Graphs
 */
const getDashboardStats = async (req, res) => {
  try {
    // 1. KPI Aggregations
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalResumes = await ResumeAnalysis.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    const scoreStats = await ResumeAnalysis.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$totalScore' },
          highestScore: { $max: '$totalScore' }
        }
      }
    ]);

    const averageScore = scoreStats.length > 0 ? Math.round(scoreStats[0].avgScore) : 0;
    const highestScore = scoreStats.length > 0 ? scoreStats[0].highestScore : 0;

    const activeUsersList = await ResumeAnalysis.distinct('userId');
    const activeUsers = activeUsersList.length;

    // 2. Uploads per day chart
    const uploadsByDate = await ResumeAnalysis.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { name: "$_id", count: 1, _id: 0 } }
    ]);

    // 3. User registrations per day
    const registrationsByDate = await User.aggregate([
      { $match: { role: 'user' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { name: "$_id", count: 1, _id: 0 } }
    ]);

    // 4. Job role distribution
    const roleDistribution = await ResumeAnalysis.aggregate([
      {
        $group: {
          _id: "$jobRole",
          value: { $sum: 1 }
        }
      },
      { $project: { name: "$_id", value: 1, _id: 0 } }
    ]);

    // 5. Average score trends per day
    const averageScoreTrends = await ResumeAnalysis.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          score: { $avg: "$totalScore" }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { name: "$_id", score: { $round: ["$score", 1] }, _id: 0 } }
    ]);

    // 6. Top matched skills
    const topMatchedSkills = await ResumeAnalysis.aggregate([
      { $unwind: "$matchedSkills" },
      { $group: { _id: "$matchedSkills", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 6 },
      { $project: { name: "$_id", value: 1, _id: 0 } }
    ]);

    // 7. Top missing skills
    const topMissingSkills = await ResumeAnalysis.aggregate([
      { $unwind: "$missingSkills" },
      { $group: { _id: "$missingSkills", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
      { $limit: 6 },
      { $project: { name: "$_id", value: 1, _id: 0 } }
    ]);

    return sendSuccess(res, 'Admin statistics aggregated successfully', {
      summary: {
        totalUsers,
        totalResumes,
        totalAnalyses: totalResumes,
        averageScore,
        highestScore,
        totalAdmins,
        activeUsers
      },
      charts: {
        uploadsByDate,
        registrationsByDate,
        roleDistribution,
        averageScoreTrends,
        topSkills: topMatchedSkills,
        topMissingSkills
      }
    });
  } catch (error) {
    console.error('Admin stats aggregation error:', error);
    return sendError(res, 'Server error aggregating statistics', 500);
  }
};

/**
 * Admin User Management APIs
 */
const getUsers = async (req, res) => {
  try {
    // Lookup to find resume counts and averages per user
    const users = await User.aggregate([
      { $match: { role: 'user' } },
      {
        $lookup: {
          from: 'resumeanalyses',
          localField: '_id',
          foreignField: 'userId',
          as: 'resumes'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          totalResumes: { $size: "$resumes" },
          averageScore: {
            $cond: {
              if: { $gt: [{ $size: "$resumes" }, 0] },
              then: { $round: [{ $avg: "$resumes.totalScore" }, 1] },
              else: 0
            }
          }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return sendSuccess(res, 'All platform users fetched', users);
  } catch (error) {
    console.error('Admin fetch users error:', error);
    return sendError(res, 'Server error retrieving users', 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const resumes = await ResumeAnalysis.find({ userId: user._id })
      .select('-extractedText')
      .sort({ createdAt: -1 });

    const totalResumes = resumes.length;
    const averageScore = totalResumes > 0 
      ? Math.round(resumes.reduce((acc, r) => acc + r.totalScore, 0) / totalResumes) 
      : 0;
    const highestScore = totalResumes > 0 
      ? Math.max(...resumes.map(r => r.totalScore)) 
      : 0;

    const latestAnalysis = totalResumes > 0 ? resumes[0] : null;

    return sendSuccess(res, 'User detail report compiled', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      stats: {
        totalResumes,
        averageScore,
        highestScore,
        latestAnalysis
      },
      history: resumes
    });
  } catch (error) {
    console.error('Admin fetch user detail error:', error);
    return sendError(res, 'Server error retrieving user details', 500);
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    return sendSuccess(res, 'User updated successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    return sendError(res, 'Server error updating user credentials', 500);
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Prevent deleting itself
    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'Admin cannot self-delete from admin portal', 400);
    }

    // Clean up all associated PDF resumes from disk
    const analyses = await ResumeAnalysis.find({ userId: user._id }).select('filePath');
    analyses.forEach(analysis => {
      if (fs.existsSync(analysis.filePath)) {
        try {
          fs.unlinkSync(analysis.filePath);
        } catch (unlinkError) {
          console.error('Failed to unlink file during user delete:', unlinkError);
        }
      }
    });

    // Delete all analysis records
    await ResumeAnalysis.deleteMany({ userId: user._id });
    
    // Delete user
    await User.deleteOne({ _id: user._id });

    return sendSuccess(res, 'User and all associated resume assets deleted');
  } catch (error) {
    console.error('Admin delete user error:', error);
    return sendError(res, 'Server error deleting user', 500);
  }
};

/**
 * Admin Resume Auditing APIs
 */
const getResumes = async (req, res) => {
  try {
    const resumes = await ResumeAnalysis.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          jobRole: 1,
          fileName: 1,
          filePath: 1,
          fileSize: 1,
          mimeType: 1,
          totalScore: 1,
          skillMatchPercentage: 1,
          createdAt: 1,
          userName: "$user.name",
          userEmail: "$user.email",
          matchedSkills: 1,
          missingSkills: 1,
          experienceScore: 1,
          projectScore: 1,
          formatScore: 1,
          keywordScore: 1,
          educationScore: 1,
          suggestions: 1
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return sendSuccess(res, 'All platform resumes fetched successfully', resumes);
  } catch (error) {
    console.error('Admin fetch resumes error:', error);
    return sendError(res, 'Server error retrieving resumes', 500);
  }
};

const getResumeById = async (req, res) => {
  try {
    const resume = await ResumeAnalysis.findById(req.params.id);
    if (!resume) {
      return sendError(res, 'Resume not found', 404);
    }
    return sendSuccess(res, 'Resume fetched', resume);
  } catch (error) {
    console.error('Admin fetch resume details error:', error);
    return sendError(res, 'Server error retrieving resume details', 500);
  }
};

const deleteResume = async (req, res) => {
  try {
    const resume = await ResumeAnalysis.findById(req.params.id);
    if (!resume) {
      return sendError(res, 'Resume analysis not found', 404);
    }

    // Delete physical file
    if (fs.existsSync(resume.filePath)) {
      try {
        fs.unlinkSync(resume.filePath);
      } catch (fileError) {
        console.error('Failed to delete PDF file on disk:', fileError);
      }
    }

    await ResumeAnalysis.deleteOne({ _id: resume._id });

    return sendSuccess(res, 'Resume analysis and asset deleted');
  } catch (error) {
    console.error('Admin delete resume error:', error);
    return sendError(res, 'Server error deleting resume analysis', 500);
  }
};

module.exports = {
  adminLogin,
  getDashboardStats,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getResumes,
  getResumeById,
  deleteResume
};
