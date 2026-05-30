const ResumeAnalysis = require('../models/ResumeAnalysis');
const { sendSuccess, sendError } = require('../utils/response');

const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all analyses for calculations
    const resumes = await ResumeAnalysis.find({ userId })
      .select('jobRole totalScore skillMatchPercentage fileName createdAt')
      .sort({ createdAt: 1 });

    if (resumes.length === 0) {
      return sendSuccess(res, 'No resume data available yet.', {
        summary: {
          totalResumes: 0,
          averageScore: 0,
          bestScore: 0,
          averageSkillMatch: 0
        },
        charts: {
          scoreTrends: [],
          roleBreakdown: [],
          skillMatchPie: []
        }
      });
    }

    const totalResumes = resumes.length;
    let sumScore = 0;
    let bestScore = 0;
    let sumSkillMatch = 0;

    const roleCounts = {};
    const skillBuckets = {
      'Low (< 50%)': 0,
      'Moderate (50-70%)': 0,
      'Good (70-85%)': 0,
      'Excellent (> 85%)': 0
    };

    resumes.forEach(resume => {
      sumScore += resume.totalScore;
      sumSkillMatch += resume.skillMatchPercentage;
      if (resume.totalScore > bestScore) {
        bestScore = resume.totalScore;
      }

      // Role counting
      roleCounts[resume.jobRole] = (roleCounts[resume.jobRole] || 0) + 1;

      // Grouping skill match percentage
      const sm = resume.skillMatchPercentage;
      if (sm < 50) {
        skillBuckets['Low (< 50%)']++;
      } else if (sm <= 70) {
        skillBuckets['Moderate (50-70%)']++;
      } else if (sm <= 85) {
        skillBuckets['Good (70-85%)']++;
      } else {
        skillBuckets['Excellent (> 85%)']++;
      }
    });

    const averageScore = Math.round(sumScore / totalResumes);
    const averageSkillMatch = Math.round(sumSkillMatch / totalResumes);

    // Format for Recharts Bar / Pie / Line charts
    const roleBreakdown = Object.keys(roleCounts).map(role => ({
      name: role,
      value: roleCounts[role]
    }));

    const skillMatchPie = Object.keys(skillBuckets)
      .map(bucket => ({
        name: bucket,
        value: skillBuckets[bucket]
      }))
      .filter(item => item.value > 0);

    // Limit trends chart to last 8 resumes, chronological
    const trendLimit = resumes.slice(-8);
    const scoreTrends = trendLimit.map(resume => {
      // Remove timestamp suffix or clean name for display
      const cleanName = resume.fileName.replace(/^\d+-/, '');
      const displayName = cleanName.length > 15 ? cleanName.substring(0, 12) + '...' : cleanName;
      return {
        name: displayName,
        score: resume.totalScore,
        skills: resume.skillMatchPercentage,
        date: new Date(resume.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      };
    });

    return sendSuccess(res, 'Dashboard statistics fetched successfully', {
      summary: {
        totalResumes,
        averageScore,
        bestScore,
        averageSkillMatch
      },
      charts: {
        scoreTrends,
        roleBreakdown,
        skillMatchPie
      }
    });
  } catch (error) {
    console.error('Dashboard statistics fetching error:', error);
    return sendError(res, 'Server error fetching dashboard statistics', 500);
  }
};

module.exports = { getStats };
