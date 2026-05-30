const fs = require('fs');
const path = require('path');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const { extractTextFromPdf } = require('../services/pdfService');
const { getFallbackText } = require('../services/analyzerService');
const { getAIAnalysis } = require('../services/aiService');
const { sendSuccess, sendError } = require('../utils/response');

const uploadAndAnalyze = async (req, res) => {
  try {
    const { jobRole } = req.body;
    if (!jobRole) {
      if (req.file) fs.unlinkSync(req.file.path);
      return sendError(res, 'Job role is required', 400);
    }

    const { filename, path: filePath, size, mimetype } = req.file;

    // Extract text from PDF
    let extractedText;
    let fallbackUsed = false;
    try {
      extractedText = await extractTextFromPdf(filePath);
    } catch (parseError) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return sendError(res, parseError.message, 400);
    }

    if (!extractedText || extractedText.trim() === '') {
      // PDF is scanned or unreadable. Fallback to mock template matching job role.
      fallbackUsed = true;
      extractedText = getFallbackText(jobRole, req.user ? req.user.name : 'Suganth');
    }

    // Perform analysis
    let analysisResult;
    let isRealAI = false;
    try {
      const aiResponse = await getAIAnalysis(extractedText, jobRole);
      analysisResult = aiResponse.analysis;
      isRealAI = aiResponse.isRealAI;
    } catch (analysisError) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return sendError(res, analysisError.message, 400);
    }

    // Create entry in MongoDB
    const resumeAnalysis = new ResumeAnalysis({
      userId: req.user._id,
      jobRole,
      fileName: filename,
      filePath: filePath,
      fileSize: size,
      mimeType: mimetype,
      extractedText,
      ...analysisResult
    });

    await resumeAnalysis.save();

    return sendSuccess(
      res,
      fallbackUsed
        ? 'Scanned PDF detected. Using fallback mock template for analysis.'
        : 'Resume parsed and analyzed successfully',
      resumeAnalysis,
      201
    );
  } catch (error) {
    console.error('Resume upload & analysis error:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return sendError(res, 'Server error analyzing resume', 500);
  }
};

const getAllResumes = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;
    const query = { userId: req.user._id };

    if (search) {
      query.fileName = { $regex: search, $options: 'i' };
    }

    if (role) {
      query.jobRole = role;
    }

    const skipIndex = (page - 1) * limit;

    const resumes = await ResumeAnalysis.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skipIndex)
      .select('-extractedText'); // Exclude heavy text payload for performance

    const total = await ResumeAnalysis.countDocuments(query);

    return sendSuccess(res, 'User resumes retrieved successfully', {
      resumes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all resumes error:', error);
    return sendError(res, 'Server error retrieving resumes', 500);
  }
};

const getResumeById = async (req, res) => {
  try {
    const resume = await ResumeAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return sendError(res, 'Resume analysis not found', 404);
    }

    return sendSuccess(res, 'Resume analysis details fetched', resume);
  } catch (error) {
    console.error('Get resume by ID error:', error);
    return sendError(res, 'Server error fetching resume details', 500);
  }
};

const deleteResume = async (req, res) => {
  try {
    const resume = await ResumeAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

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

    return sendSuccess(res, 'Resume analysis and physical file deleted successfully');
  } catch (error) {
    console.error('Delete resume error:', error);
    return sendError(res, 'Server error deleting resume analysis', 500);
  }
};

const reanalyzeResume = async (req, res) => {
  try {
    const { jobRole } = req.body;
    if (!jobRole) {
      return sendError(res, 'Job role is required', 400);
    }

    const resume = await ResumeAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return sendError(res, 'Resume analysis not found', 404);
    }

    // Rerun scoring
    let analysisResult;
    try {
      const aiResponse = await getAIAnalysis(resume.extractedText, jobRole);
      analysisResult = aiResponse.analysis;
    } catch (analysisError) {
      return sendError(res, analysisError.message, 400);
    }

    resume.jobRole = jobRole;
    resume.matchedSkills = analysisResult.matchedSkills;
    resume.missingSkills = analysisResult.missingSkills;
    resume.skillMatchPercentage = analysisResult.skillMatchPercentage;
    resume.experienceScore = analysisResult.experienceScore;
    resume.projectScore = analysisResult.projectScore;
    resume.formatScore = analysisResult.formatScore;
    resume.keywordScore = analysisResult.keywordScore;
    resume.educationScore = analysisResult.educationScore;
    resume.totalScore = analysisResult.totalScore;
    resume.suggestions = analysisResult.suggestions;

    await resume.save();

    return sendSuccess(res, 'Resume analysis updated successfully', resume);
  } catch (error) {
    console.error('Reanalyze resume error:', error);
    return sendError(res, 'Server error reanalyzing resume', 500);
  }
};

module.exports = {
  uploadAndAnalyze,
  getAllResumes,
  getResumeById,
  deleteResume,
  reanalyzeResume
};
