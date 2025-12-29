import geminiService from '../services/geminiService.js';
import { 
  getMimeType, 
  validateFileSize, 
  cleanupFile, 
  getFileInfo 
} from '../utils/fileHandler.js';

/**
 * Controller for handling label extraction requests
 */
export const extractLabelController = async (req, res) => {
  let filePath = null;

  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please upload an image or PDF file.'
      });
    }

    const file = req.file;
    filePath = file.path;

    // Log file info
    const fileInfo = getFileInfo(file);
    console.log('📁 File received:', fileInfo);

    // Validate file
    validateFileSize(file);
    const mimeType = getMimeType(file);

    console.log('✅ File validation passed');

    // Extract information using Gemini
    const extractedData = await geminiService.extractLabelInfo(
      file.buffer, 
      mimeType
    );

    console.log('✅ Extraction completed successfully');

    // Send response
    res.json({
      success: true,
      data: extractedData,
      metadata: {
        fileName: file.originalname,
        fileSize: fileInfo.size,
        processedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Extraction error:', error);

    // Send error response
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to extract label information',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

  } finally {
    // Cleanup temporary file if it exists
    if (filePath) {
      await cleanupFile(filePath);
    }
  }
};

/**
 * Health check endpoint
 */
export const healthCheck = (req, res) => {
  res.json({
    success: true,
    message: 'Label Extractor API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};