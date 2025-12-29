import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { extractLabelController, healthCheck } from './controllers/extractController.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =====================
// Middleware Configuration
// =====================

// CORS - Allow frontend to access API
app.use(cors()); // ✅ Allow all origins (prototype mode)

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================
// Multer Configuration (File Upload)
// =====================

// Configure multer for in-memory storage (no disk writes)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP images and PDF are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max (as per Gemini docs)
  }
});

// =====================
// Routes
// =====================

// Health check endpoint
app.get('/', healthCheck);
app.get('/api/health', healthCheck);

// Label extraction endpoint
app.post('/api/extract', upload.single('image'), extractLabelController);

// =====================
// Error Handling Middleware
// =====================

// Handle multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 50MB.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${error.message}`
    });
  }
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
  
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// =====================
// Start Server
// =====================





// Export for Vercel serverless
export default app;

// Only listen in development (not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
  console.log('\n🚀 ===================================');
  console.log(`   Label Extractor API Server`);
  console.log('   ===================================');
  console.log(`   📡 Server running on port ${PORT}`);
  console.log(`   🌐 URL: http://localhost:${PORT}`);
  console.log(`   📝 API Endpoint: http://localhost:${PORT}/api/extract`);
  console.log(`   ❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log('   ===================================\n');
  
  // Check API key
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn('⚠️  WARNING: GEMINI_API_KEY not configured!');
    console.warn('   Get your API key from: https://aistudio.google.com/apikey');
    console.warn('   Add it to the .env file\n');
  } else {
    console.log('✅ Gemini API Key configured\n');
  }
});
}