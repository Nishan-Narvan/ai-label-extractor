import dotenv from 'dotenv';

dotenv.config();

export const geminiConfig = {
  apiKey: process.env.GEMINI_API_KEY, // ✅ Read from .env file (more secure)
  model: "gemini-2.5-flash", // ✅ CHANGED - This is the verified working model
  
  // Generation config for structured output
  generationConfig: {
    temperature: 0.1, // Low temperature for consistent extraction
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 2048,
  },
};

// Validation
if (!geminiConfig.apiKey || geminiConfig.apiKey === 'your_gemini_api_key_here') {
  console.error('⚠️  GEMINI_API_KEY is not set in .env file');
  console.log('Get your API key from: https://aistudio.google.com/apikey');
}