const fs = require('fs');
const pdfParse = require('pdf-parse');

const extractTextFromPdf = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text || '';
  } catch (error) {
    console.error('PDF Text Extraction Service Error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

module.exports = { extractTextFromPdf };
