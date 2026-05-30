const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
  // Original camelCase fields
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobRole: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  extractedText: {
    type: String,
    required: true
  },
  matchedSkills: {
    type: [String],
    default: []
  },
  missingSkills: {
    type: [String],
    default: []
  },
  skillMatchPercentage: {
    type: Number,
    default: 0
  },
  experienceScore: {
    type: Number,
    default: 0
  },
  projectScore: {
    type: Number,
    default: 0
  },
  formatScore: {
    type: Number,
    default: 0
  },
  keywordScore: {
    type: Number,
    default: 0
  },
  educationScore: {
    type: Number,
    default: 0
  },
  totalScore: {
    type: Number,
    default: 0
  },
  suggestions: {
    type: [String],
    default: []
  },

  // Capitalized fields matching Section 4 ("Backend Storage Fields") of the specification image
  UserID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ResumeFilePath: {
    type: String
  },
  ExtractedText: {
    type: String
  },
  SelectedJobRole: {
    type: String
  },
  ResumeScore: {
    type: Number
  },
  SkillMatchPercentage: {
    type: Number
  },
  MissingSkills: {
    type: [String]
  },
  Suggestions: {
    type: [String]
  },
  CreatedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Sync capitalized and camelCase fields before saving to DB
resumeAnalysisSchema.pre('save', function(next) {
  this.UserID = this.userId;
  this.ResumeFilePath = this.filePath;
  this.ExtractedText = this.extractedText;
  this.SelectedJobRole = this.jobRole;
  this.ResumeScore = this.totalScore;
  this.SkillMatchPercentage = this.skillMatchPercentage;
  this.MissingSkills = this.missingSkills;
  this.Suggestions = this.suggestions;
  this.CreatedAt = this.createdAt || new Date();
  next();
});

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);

