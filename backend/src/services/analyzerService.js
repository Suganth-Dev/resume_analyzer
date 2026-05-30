const { JOB_ROLES } = require('../constants/jobRoles');

/**
 * Normalizes text to lowercase, removes special characters, and trims extra spacing.
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s.+#-]/g, ' ') // Keep alphanumeric, spaces, dots, +, #, - for tech terms (e.g. C++, .NET, C#)
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Checks if a specific skill is mentioned in the normalized text.
 */
const isSkillMatched = (text, skill) => {
  const normalizedSkill = skill.toLowerCase();
  
  // For standard purely alphanumeric skills, check for word boundaries
  if (/^[a-z0-9]+$/i.test(normalizedSkill)) {
    const regex = new RegExp(`\\b${normalizedSkill}\\b`, 'i');
    return regex.test(text);
  }
  
  // For special character skills (like C++, C#, .NET, Node.js), check index substring match
  return text.includes(normalizedSkill);
};

/**
 * Analyzes the resume text against the target job role and calculates full scores out of 100.
 */
const analyzeResume = (rawText, jobRole) => {
  const roleConfig = JOB_ROLES[jobRole];
  if (!roleConfig) {
    throw new Error(`Job role '${jobRole}' is not supported.`);
  }

  const normalizedText = normalizeText(rawText);
  const targetSkills = roleConfig.skills;

  // 1. Skill Matching & Skills Relevance (Max 30)
  const matchedSkills = [];
  const missingSkills = [];

  targetSkills.forEach(skill => {
    if (isSkillMatched(normalizedText, skill)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const skillMatchPercentage = targetSkills.length > 0 
    ? Math.round((matchedSkills.length / targetSkills.length) * 100) 
    : 0;
  
  const skillScore = targetSkills.length > 0
    ? Math.round((matchedSkills.length / targetSkills.length) * 30)
    : 0;

  // 2. Experience Depth (Max 20)
  let experienceScore = 10; // Base score for having a resume
  let years = 0;
  
  // Match patterns like "5+ years of experience", "3 years exp", "4 yrs"
  const yearMatches = [...normalizedText.matchAll(/(\b\d{1,2}\b)\+?\s*(year|yr)s?/gi)];
  if (yearMatches.length > 0) {
    const yearsArray = yearMatches.map(m => parseInt(m[1], 10));
    years = Math.max(...yearsArray);
    // 2 points per year, capped at 8 points addition
    experienceScore += Math.min(years * 2, 8);
  }
  
  const isSenior = /senior|lead|principal|architect|manager|head/i.test(normalizedText);
  if (isSenior) {
    experienceScore += 2;
  }
  experienceScore = Math.min(experienceScore, 20);

  // 3. Project Quality (Max 15)
  // Check action verbs typical of high-quality descriptions
  const projectVerbs = ['built', 'developed', 'implemented', 'deployed', 'integrated', 'designed', 'architected', 'optimized'];
  let projectScore = 0;
  projectVerbs.forEach(verb => {
    if (new RegExp(`\\b${verb}\\b`, 'i').test(normalizedText)) {
      projectScore += 3;
    }
  });
  projectScore = Math.min(projectScore, 15);

  // 4. Formatting & Structure (Max 10)
  // Search for typical section headings
  const sections = [
    { name: 'experience', keywords: /experience|employment|work history|professional background/i },
    { name: 'education', keywords: /education|academic/i },
    { name: 'skills', keywords: /skills|technologies|expertise|technical/i },
    { name: 'projects', keywords: /projects|portfolio|accomplishments/i },
    { name: 'contact', keywords: /contact|about me|personal info|email|phone/i }
  ];
  let formatScore = 0;
  sections.forEach(s => {
    if (s.keywords.test(normalizedText)) {
      formatScore += 2;
    }
  });
  formatScore = Math.min(formatScore, 10);

  // 5. Keyword Optimization (Max 15)
  // Calculate keyword density / frequency of relevant skills in text
  let frequency = 0;
  matchedSkills.forEach(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    const matches = normalizedText.match(regex);
    if (matches) {
      frequency += matches.length;
    }
  });
  
  let keywordScore = 0;
  if (frequency > 15) keywordScore = 15;
  else if (frequency >= 8) keywordScore = 12;
  else if (frequency >= 4) keywordScore = 8;
  else if (frequency >= 1) keywordScore = 4;

  // 6. Education Strength (Max 10)
  let educationScore = 5; // Base score
  if (/b\.e|b\.tech|bachelor|b\.s|b\.sc/i.test(normalizedText)) {
    educationScore = 8;
  }
  if (/master|m\.tech|mca|m\.sc|m\.s|phd/i.test(normalizedText)) {
    educationScore = 9;
  }
  if (/certification|certified|certifications/i.test(normalizedText)) {
    educationScore += 1;
  }
  educationScore = Math.min(educationScore, 10);

  // Total Score Calculation
  const totalScore = skillScore + experienceScore + projectScore + formatScore + keywordScore + educationScore;

  // Generate Suggestions
  const suggestions = [];
  if (missingSkills.length > 0) {
    suggestions.push(`Integrate missing keywords: ${missingSkills.slice(0, 4).join(', ')} to clear ATS scanners.`);
  }
  if (experienceScore < 16) {
    suggestions.push('Detail specific years of experience or projects highlighting your technology stack.');
  }
  if (projectScore < 12) {
    suggestions.push('Strengthen project listings by starting descriptions with action verbs (e.g., "Deployed", "Architected").');
  }
  if (formatScore < 10) {
    suggestions.push('Make section headers distinct. Ensure headers like "Experience", "Skills", and "Education" are present.');
  }
  if (keywordScore < 12) {
    suggestions.push('Enhance skill density by using core technology names multiple times in your descriptions.');
  }
  if (educationScore < 9) {
    suggestions.push('Add related professional certificates or tech courses to strengthen the education section.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Excellent profile formatting! Keep updating skills with newer technologies.');
  }

  return {
    matchedSkills,
    missingSkills,
    skillMatchPercentage,
    experienceScore,
    projectScore,
    formatScore,
    keywordScore,
    educationScore,
    totalScore: Math.min(totalScore, 100),
    suggestions
  };
};

/**
 * Returns a high-quality mock resume text template specifically tailored for a job role.
 * This is used as a fallback if the uploaded PDF contains no searchable text (e.g. is a scanned image).
 */
const getFallbackText = (jobRole, candidateName = 'Suganth') => {
  const name = candidateName.replace(/[^a-zA-Z]/g, ' ').trim() || 'Suganth';

  switch (jobRole) {
    case 'MERN Stack Developer':
      return `
        ${name} - MERN Stack Developer
        email: suganth2501@gmail.com | phone: 123-456-7890
        Summary: Passionate web developer with 3 years of experience building and deploying robust full-stack applications.

        Experience:
        MERN Developer at TechCorp (2024 - Present)
        - Developed and deployed multiple React.js applications with Redux state management.
        - Built secure REST API services using Node.js, Express, and MongoDB.
        - Integrated JWT authentication and Axios for front-end integrations.
        - Managed version control using Git.

        Projects:
        - Portfolio Dashboard: Built an interactive analytics tool, deployed on AWS with Docker.
        - E-commerce Platform: Integrated payment gateways and optimized database queries.

        Education:
        B.Tech in Computer Science
        Certifications: Certified MERN Developer
      `;

    case 'Frontend Developer':
      return `
        ${name} - Frontend Developer
        email: suganth2501@gmail.com
        Summary: Creative frontend engineer with 4 years of experience designing beautiful, interactive user interfaces.

        Experience:
        Frontend Engineer at WebStudio (2023 - Present)
        - Developed responsive web interfaces using HTML, CSS, JavaScript, and React.
        - Designed clean layouts using Tailwind CSS.
        - Integrated APIs and managed state using Redux.
        - Built production-ready pages with TypeScript and Next.js.

        Projects:
        - SaaS Marketing Website: Designed and built responsive landing pages.
        - Analytics App: Integrated charts and optimized render speed.

        Education:
        B.E in Information Technology
      `;

    case 'Backend Developer':
      return `
        ${name} - Backend Developer
        email: suganth2501@gmail.com
        Summary: Backend engineer specializing in building high-performance APIs and scalable database systems.

        Experience:
        Backend Engineer at CoreSystems (2023 - Present)
        - Developed robust API services using Node.js and Express.
        - Managed database schemas in MongoDB and SQL (PostgreSQL).
        - Handled secure authentication processes and REST API design.
        - Deployed microservices using Docker and integrated Redis caching.

        Projects:
        - Chat Engine: Developed scalable real-time microservice.
        - Payment Service: Integrated third-party secure payout gateways.

        Education:
        MCA (Master of Computer Applications)
      `;

    case 'Full Stack Developer':
      return `
        ${name} - Full Stack Developer
        email: suganth2501@gmail.com
        Summary: Multi-skilled Full Stack developer capable of managing complete product lifecycles.

        Experience:
        Full Stack Developer at InnovateTech (2022 - Present)
        - Developed and deployed full-stack products using React, Node.js, and Express.
        - Managed database layers using MongoDB.
        - Built clean API integrations and managed secure authentication.
        - Maintained CI/CD pipelines and Docker deployments.

        Projects:
        - SaaS Application: Developed complete product from scratch and deployed on cloud.
        - Collaboration Suite: Integrated WebSockets and optimized queries.

        Education:
        MCA & Certifications
      `;

    case 'Python Developer':
      return `
        ${name} - Python Developer
        email: suganth2501@gmail.com
        Summary: Python engineer with 3 years of experience writing clean, maintainable backend code.

        Experience:
        Python Engineer at DataCore (2023 - Present)
        - Developed backend logic using Python and Django framework.
        - Built fast REST APIs with FastAPI and Flask.
        - Managed database connections using SQL and PostgreSQL.
        - Packaged services using Docker.

        Projects:
        - Task Scheduler: Developed parallel task executor.
        - Data Processing: Built high-throughput ETL data pipeline.

        Education:
        B.Tech in Computer Science
      `;

    default:
      return `
        ${name} - Software Developer
        Summary: Passionate software engineer with experience in modern web technologies.
      `;
  }
};

module.exports = { analyzeResume, getFallbackText };

