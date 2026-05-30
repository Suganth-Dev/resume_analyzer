const { GoogleGenerativeAI } = require('@google/generative-ai');
const { JOB_ROLES } = require('../constants/jobRoles');
const { analyzeResume } = require('./analyzerService');

const getAIAnalysis = async (resumeText, jobRole) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('your_')) {
    console.log('[AI Service] No Gemini API key found in .env. Falling back to local rule-based parsing.');
    return {
      analysis: analyzeResume(resumeText, jobRole),
      isRealAI: false
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const roleConfig = JOB_ROLES[jobRole] || { skills: [] };
    const requiredSkills = roleConfig.skills;

    const prompt = `
      You are an expert ATS (Applicant Tracking System) analyzer and senior recruiter.
      Analyze the following resume text against the target job role: "${jobRole}".
      The predefined required skills for this role are: [${requiredSkills.join(', ')}].

      Evaluate the candidate and calculate scores based on these exact criteria:
      1. Skills Relevance (Max 30): Score based on matched vs required skills.
      2. Experience Depth (Max 20): Check years, keywords, seniority levels.
      3. Project Quality (Max 15): Check description action verbs (built, developed, optimized, etc.).
      4. Formatting & Structure (Max 10): Organization and standard headings.
      5. Keyword Optimization (Max 15): Density and presence of tech keywords.
      6. Education Strength (Max 10): Degree levels and certifications.

      Provide the results in raw JSON format (do not wrap in markdown or backticks like \`\`\`json, just return raw JSON text). 
      The JSON must contain exactly these keys:
      {
        "matchedSkills": ["skill1", "skill2"],
        "missingSkills": ["skill3"],
        "skillMatchPercentage": 75,
        "experienceScore": 15,
        "projectScore": 12,
        "formatScore": 8,
        "keywordScore": 11,
        "educationScore": 9,
        "totalScore": 70,
        "suggestions": [
          "Include technology X in your projects.",
          "Describe your experience with action verbs."
        ]
      }

      Resume Text to Analyze:
      ${resumeText}
    `;

    console.log(`[AI Service] Dispatched request to Gemini API for role: ${jobRole}...`);
    const result = await model.generateContent(prompt);
    let textResponse = result.response.text();

    // Clean up any potential markdown syntax wrappers in response
    textResponse = textResponse
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const aiResult = JSON.parse(textResponse);
    
    // Ensure all required numeric properties exist and are valid numbers
    const scoreSchemaKeys = ['skillMatchPercentage', 'experienceScore', 'projectScore', 'formatScore', 'keywordScore', 'educationScore', 'totalScore'];
    scoreSchemaKeys.forEach(key => {
      aiResult[key] = Math.min(Math.max(parseInt(aiResult[key], 10) || 0, 0), 100);
    });

    if (!Array.isArray(aiResult.matchedSkills)) aiResult.matchedSkills = [];
    if (!Array.isArray(aiResult.missingSkills)) aiResult.missingSkills = [];
    if (!Array.isArray(aiResult.suggestions)) aiResult.suggestions = [];

    console.log('[AI Service] Successfully received and parsed Gemini AI response.');
    return {
      analysis: aiResult,
      isRealAI: true
    };
  } catch (error) {
    console.error('[AI Service] Gemini API call failed. Falling back to local rule-based engine. Error:', error.message);
    return {
      analysis: analyzeResume(resumeText, jobRole),
      isRealAI: false
    };
  }
};

module.exports = { getAIAnalysis };
