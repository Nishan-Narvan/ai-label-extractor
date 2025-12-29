import fs from 'fs';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

/**
 * Converts file buffer to base64 string
 */
export function bufferToBase64(buffer) {
  return buffer.toString('base64');
}

/**
 * Gets MIME type from file
 */
export function getMimeType(file) {
  const mimeType = file.mimetype;
  
  // Validate supported types
  const supportedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  if (!supportedTypes.includes(mimeType)) {
    throw new Error(`Unsupported file type: ${mimeType}. Supported: images (jpg, png, webp) and PDF`);
  }

  return mimeType;
}

/**
 * Validates file size (max 50MB as per Gemini docs)
 */
export function validateFileSize(file) {
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size is 50MB, got ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  }
}

/**
 * Cleans up temporary file
 */
export async function cleanupFile(filepath) {
  try {
    if (filepath && fs.existsSync(filepath)) {
      await unlinkAsync(filepath);
      console.log(`🗑️  Cleaned up temporary file: ${filepath}`);
    }
  } catch (error) {
    console.error('Error cleaning up file:', error.message);
  }
}

/**
 * Formats file information for logging
 */
export function getFileInfo(file) {
  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: `${(file.size / 1024).toFixed(2)} KB`,
    encoding: file.encoding
  };
}