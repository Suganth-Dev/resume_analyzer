import { jsPDF } from 'jspdf';

export const exportAnalysisToPDF = (analysis, userName) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const textColor = '#1e293b'; // Slate 800
  const subTextColor = '#64748b'; // Slate 500

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('AI RESUME ANALYZER', 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(167, 139, 250); // violet 400
  doc.text('ATS Score & Job Description Alignment Report', 15, 26);

  // Header Metadata (Right Align)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date(analysis.createdAt).toLocaleDateString()}`, 145, 18);
  doc.text(`Candidate: ${userName || 'User Profile'}`, 145, 24);
  doc.text(`Target Role: ${analysis.jobRole}`, 145, 30);
  doc.text(`File: ${analysis.fileName.replace(/^\d+-/, '')}`, 145, 36);

  // Header Accent bar
  doc.setFillColor(139, 92, 246); // violet 500
  doc.rect(0, 42, 210, 2, 'F');

  // 2. Score Summary Layout
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('1. CORE ASSESSMENT METRICS', 15, 58);

  // Score Metric Card
  doc.setFillColor(248, 250, 252); // slate 50
  doc.setDrawColor(226, 232, 240); // slate 200
  doc.setLineWidth(0.4);
  doc.rect(15, 64, 85, 32, 'FD');

  doc.setTextColor(124, 58, 237); // violet 600
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(`${analysis.totalScore}/100`, 25, 82);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(subTextColor);
  doc.text('Total ATS Optimization Score', 25, 89);

  // Alignment Metric Card
  doc.setFillColor(248, 250, 252);
  doc.rect(110, 64, 85, 32, 'FD');

  doc.setTextColor(2, 132, 199); // Sky 600
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text(`${analysis.skillMatchPercentage}%`, 120, 82);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(subTextColor);
  doc.text('Required Skills Match Rate', 120, 89);

  // 3. Category Score breakdown
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Detailed Scoring Breakdown:', 15, 108);

  const scoreCategories = [
    { name: 'Skills Relevance (Max 30 pts)', score: `${Math.round((analysis.skillMatchPercentage / 100) * 30)}` },
    { name: 'Experience Indicators & Depth (Max 20 pts)', score: `${analysis.experienceScore}` },
    { name: 'Project Quality & Action Keywords (Max 15 pts)', score: `${analysis.projectScore}` },
    { name: 'Formatting, Headers & Structure (Max 10 pts)', score: `${analysis.formatScore}` },
    { name: 'ATS Keyword Optimization Density (Max 15 pts)', score: `${analysis.keywordScore}` },
    { name: 'Education Level & Certifications (Max 10 pts)', score: `${analysis.educationScore}` }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  let listY = 116;
  scoreCategories.forEach(cat => {
    doc.setTextColor(textColor);
    doc.text(cat.name, 20, listY);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(124, 58, 237);
    doc.text(`${cat.score} pts`, 175, listY);
    
    doc.setFont('helvetica', 'normal');
    // Draw micro dotted line
    doc.setDrawColor(241, 245, 249);
    doc.line(20, listY + 2, 190, listY + 2);
    
    listY += 8;
  });

  // 4. Skills Gap & Alignment
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('2. TECHNOLOGY ALIGNMENT GAP', 15, listY + 5);
  listY += 12;

  // Matched Skills
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(22, 163, 74); // green 600
  doc.text('MATCHED SKILLS:', 15, listY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textColor);
  const matchStr = (analysis.matchedSkills && analysis.matchedSkills.length > 0) 
    ? analysis.matchedSkills.join(', ') 
    : 'No matching skills found in text';
  const splitMatched = doc.splitTextToSize(matchStr, 175);
  doc.text(splitMatched, 15, listY + 5);
  
  listY += 5 + (splitMatched.length * 4.5) + 3;

  // Missing Skills
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(220, 38, 38); // red 600
  doc.text('MISSING SKILLS (SKILL GAP):', 15, listY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textColor);
  const missStr = (analysis.missingSkills && analysis.missingSkills.length > 0) 
    ? analysis.missingSkills.join(', ') 
    : 'Perfect match! No missing skills detected.';
  const splitMissing = doc.splitTextToSize(missStr, 175);
  doc.text(splitMissing, 15, listY + 5);

  listY += 5 + (splitMissing.length * 4.5) + 6;

  // 5. ATS Suggestions
  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('3. ATS OPTIMIZATION RECOMMENDATIONS', 15, listY);
  listY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(textColor);

  const suggestionsList = analysis.suggestions || [];
  suggestionsList.forEach((suggestion, index) => {
    const fullSuggestion = `${index + 1}. ${suggestion}`;
    const splitSuggestion = doc.splitTextToSize(fullSuggestion, 175);
    
    // Page boundary check - move footer if we overflow A4 height
    if (listY > 265) {
      doc.addPage();
      listY = 20; // reset list Y on new page
    }
    
    doc.text(splitSuggestion, 15, listY);
    listY += splitSuggestion.length * 5;
  });

  // Footer assessment banner on bottom
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 282, 210, 15, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(0, 282, 210, 282);
    
    doc.setTextColor(subTextColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Confidential - Personal ATS Performance Assessment Report', 15, 291);
    doc.text(`Page ${i} of ${pageCount}`, 190, 291);
  }

  // Save report
  const cleanBaseName = analysis.fileName.replace(/^\d+-/, '').replace(/\.pdf$/i, '');
  doc.save(`${cleanBaseName}_ATS_Report.pdf`);
};
