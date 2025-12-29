import { GoogleGenAI } from '@google/genai';
import { geminiConfig } from '../config/gemini.config.js';
import { bufferToBase64 } from '../utils/fileHandler.js';

class GeminiService {
  constructor() {
    this.ai = new GoogleGenAI({ apiKey: geminiConfig.apiKey });
  }

  /**
   * Creates a detailed prompt for pharmaceutical label extraction
   * Handles both single and multiple medicines
   */
  createExtractionPrompt() {
    return `You are an expert pharmaceutical analyst with 20+ years of experience in medicine labeling, drug composition analysis, and regulatory compliance.

CRITICAL INSTRUCTIONS:
1. Analyze this pharmaceutical label/document completely
2. Identify if it contains SINGLE or MULTIPLE medicines
3. Extract ALL medicines found on the label
4. Return ONLY valid JSON, no markdown, no explanations

OUTPUT FORMAT:

For SINGLE MEDICINE on label:
{
  "label_type": "single",
  "medicines": [
    {
      "medicine_name": "Complete brand/generic name",
      "composition": ["Active ingredient 1 with strength", "Active ingredient 2 with strength"],
      "strength": "Total dosage strength (e.g., 500mg, 10mg/5ml)",
      "form": "Tablet/Capsule/Syrup/Injection/Cream/etc",
      "manufacturer": "Full pharmaceutical company name",
      "batch_number": "Batch/Lot number if visible",
      "expiry_date": "Expiry date if visible",
      "usage": "Primary therapeutic indication/usage",
      "dosage": "Recommended dosage if visible",
      "warnings": "All warnings, contraindications, precautions",
      "side_effects": "Common side effects if listed",
      "storage": "Storage conditions if mentioned"
    }
  ]
}

For MULTIPLE MEDICINES on label (combo pack/strip/multi-drug):
{
  "label_type": "multiple",
  "medicines": [
    {
      "medicine_name": "First medicine name",
      "composition": ["Active ingredients with strengths"],
      "strength": "Dosage strength",
      "form": "Dosage form",
      "manufacturer": "Company name",
      "batch_number": "Batch number if visible",
      "expiry_date": "Expiry if visible",
      "usage": "Indication/usage",
      "dosage": "Recommended dosage",
      "warnings": "Warnings/precautions",
      "side_effects": "Side effects if listed",
      "storage": "Storage info"
    },
    {
      "medicine_name": "Second medicine name",
      "composition": ["Active ingredients with strengths"],
      "strength": "Dosage strength",
      "form": "Dosage form",
      "manufacturer": "Company name",
      "batch_number": "Batch number if visible",
      "expiry_date": "Expiry if visible",
      "usage": "Indication/usage",
      "dosage": "Recommended dosage",
      "warnings": "Warnings/precautions",
      "side_effects": "Side effects if listed",
      "storage": "Storage info"
    }
  ]
}

EXTRACTION RULES (CRITICAL):

1. COMPOSITION:
   - Include EXACT chemical names (e.g., "Paracetamol 500mg", "Ibuprofen 400mg")
   - For combinations, list ALL active ingredients separately
   - Include salt forms (e.g., "Metformin Hydrochloride")
   
2. STRENGTH:
   - Extract precise dosage (500mg, 10mg/5ml, 2.5%, etc.)
   - For combinations, show combined strength if listed
   
3. MEDICINE FORM:
   - Tablets, Capsules, Syrup, Suspension, Injection, Cream, Ointment, etc.
   
4. WARNINGS (Extract ALL):
   - Contraindications
   - Drug interactions
   - Pregnancy/lactation warnings
   - Age restrictions
   - Alcohol warnings
   - Driving/machinery warnings
   
5. USAGE:
   - Primary therapeutic use
   - Disease/condition it treats
   
6. DOSAGE:
   - Adult dosage
   - Pediatric dosage if mentioned
   - Frequency (once/twice/thrice daily)

7. IDENTIFY MULTIPLE MEDICINES BY:
   - Separate packaging within one label
   - Combo packs (e.g., "Kit contains: Medicine A + Medicine B")
   - Multi-strip packs
   - Different colored tablets/capsules mentioned
   - Multiple brand names on same label

NULL HANDLING:
- Use null for fields not visible/not mentioned
- Use empty array [] for composition if not found
- Do NOT make up information

PHARMACEUTICAL ACCURACY:
- Be precise with chemical names
- Maintain exact spellings
- Include units (mg, ml, %, IU, etc.)
- Preserve brand and generic names

Return ONLY the JSON object, nothing else.`;
  }

  /**
   * Extracts pharmaceutical information from image/PDF
   */
  async extractLabelInfo(fileBuffer, mimeType) {
    try {
      console.log(`🔍 Processing file with Gemini (${mimeType})...`);

      // Convert buffer to base64
      const base64Data = bufferToBase64(fileBuffer);

      // Prepare contents array
      const contents = [
        { text: this.createExtractionPrompt() },
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        }
      ];

      // Generate content using the new SDK
      const response = await this.ai.models.generateContent({
        model: geminiConfig.model,
        contents: contents,
        generationConfig: geminiConfig.generationConfig,
      });

      const text = response.text;

      console.log('📄 Raw Gemini response:', text);

      // Parse the JSON response
      const extractedData = this.parseResponse(text);
      
      return extractedData;

    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      throw new Error(`Gemini extraction failed: ${error.message}`);
    }
  }

  /**
   * Parses Gemini response and extracts JSON
   */
  parseResponse(responseText) {
    try {
      // Remove markdown code blocks if present
      let cleanedText = responseText.trim();
      
      // Remove ```json and ``` markers
      cleanedText = cleanedText.replace(/```json\s*/g, '');
      cleanedText = cleanedText.replace(/```\s*/g, '');
      
      // Try to find JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.validateAndNormalize(parsed);
      }

      throw new Error('No valid JSON found in response');
      
    } catch (error) {
      console.error('❌ JSON Parse Error:', error.message);
      console.error('Response text:', responseText);
      
      // Return empty structure for backward compatibility
      return {
        label_type: "single",
        medicines: [{
          medicine_name: null,
          composition: [],
          strength: null,
          form: null,
          manufacturer: null,
          batch_number: null,
          expiry_date: null,
          usage: null,
          dosage: null,
          warnings: null,
          side_effects: null,
          storage: null,
          error: 'Failed to parse response'
        }]
      };
    }
  }

  /**
   * Validates and normalizes extracted data
   * Handles both single and multiple medicines
   */
  validateAndNormalize(data) {
    // Ensure label_type exists
    const labelType = data.label_type || "single";
    
    // Ensure medicines is an array
    let medicines = [];
    
    if (Array.isArray(data.medicines)) {
      medicines = data.medicines.map(med => this.normalizeMedicine(med));
    } else if (data.medicine_name) {
      // Legacy format - convert to new format
      medicines = [this.normalizeMedicine(data)];
    }

    return {
      label_type: labelType,
      medicines: medicines.length > 0 ? medicines : [this.getEmptyMedicine()]
    };
  }

  /**
   * Normalizes a single medicine object
   */
  normalizeMedicine(medicine) {
    return {
      medicine_name: medicine.medicine_name || null,
      composition: Array.isArray(medicine.composition) 
        ? medicine.composition.filter(item => item && item.trim()) 
        : [],
      strength: medicine.strength || null,
      form: medicine.form || null,
      manufacturer: medicine.manufacturer || null,
      batch_number: medicine.batch_number || null,
      expiry_date: medicine.expiry_date || null,
      usage: medicine.usage || null,
      dosage: medicine.dosage || null,
      warnings: medicine.warnings || null,
      side_effects: medicine.side_effects || null,
      storage: medicine.storage || null
    };
  }

  /**
   * Returns empty medicine structure
   */
  getEmptyMedicine() {
    return {
      medicine_name: null,
      composition: [],
      strength: null,
      form: null,
      manufacturer: null,
      batch_number: null,
      expiry_date: null,
      usage: null,
      dosage: null,
      warnings: null,
      side_effects: null,
      storage: null
    };
  }
}

export default new GeminiService();