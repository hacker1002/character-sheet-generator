import { GoogleGenAI } from '@google/genai';
import {
  BaseProvider,
  GenerationRequest,
  GenerationResult,
  ProviderConfig,
} from './types';

/**
 * Google Gemini provider implementation for character sheet generation
 * Uses Gemini 2.5 Flash Image model for native image generation
 * Updated to use new @google/genai SDK
 */
export class GeminiProvider extends BaseProvider {
  private client: GoogleGenAI;

  constructor(config: ProviderConfig) {
    super(config);
    // Initialize with API key - new SDK accepts apiKey in constructor
    this.client = new GoogleGenAI({ apiKey: config.apiKey });
  }

  get name(): string {
    return 'gemini';
  }

  validateConfig(): boolean {
    // Gemini API keys start with "AIza"
    return !!this.config.apiKey && this.config.apiKey.startsWith('AIza');
  }

  async generateCharacterSheet(
    request: GenerationRequest
  ): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      // Convert avatar buffer to base64 for Gemini API
      const imageBase64 = request.imageBuffer.toString('base64');

      // Prepare request with new API format - simplified structure
      const contents: any[] = [
        { text: request.prompt },
        {
          inlineData: {
            mimeType: request.mimeType,
            data: imageBase64,
          },
        },
      ];

      // If template image is provided, add it to contents
      if (request.templateBuffer && request.templateMimeType) {
        const templateBase64 = request.templateBuffer.toString('base64');
        contents.push({
          inlineData: {
            mimeType: request.templateMimeType,
            data: templateBase64,
          },
        });

        // Enhance prompt to reference template
        contents[0].text = `${request.prompt}. The first image is the character/avatar to use. The second image is the template structure to follow. Generate the result based on the avatar following the exact layout and structure shown in the template.`;
      }

      const modelName = this.config.defaultModel || 'gemini-2.5-flash-image';

      // Build request config based on model type
      const requestConfig: any = {
        model: modelName,
        contents,
      };

      // gemini-3-pro-image-preview requires special config
      if (modelName === 'gemini-3-pro-image-preview') {
        requestConfig.config = {
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: {
            aspectRatio: '1:1', // Default to square for character sheets
            imageSize: '2K', // High resolution
          },
        };
      }

      // Call Gemini API with new SDK format
      const response = await this.client.models.generateContent(requestConfig);

      // Extract image data from response
      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      const imageData = parts.find((p: any) => p.inlineData)?.inlineData?.data;

      if (!imageData) {
        throw new Error('No image data in Gemini response');
      }

      const generationTime = Date.now() - startTime;

      return {
        success: true,
        provider: this.name,
        images: [imageData],
        metadata: {
          model: this.config.defaultModel || 'gemini-2.5-flash-image',
          generatedAt: new Date().toISOString(),
          generationTime,
        },
      };
    } catch (error: any) {
      const generationTime = Date.now() - startTime;

      // Handle specific error cases
      if (error.status === 429) {
        return {
          success: false,
          provider: this.name,
          images: [],
          metadata: {
            model: this.config.defaultModel || 'gemini-2.5-flash-image',
            generatedAt: new Date().toISOString(),
            generationTime,
          },
          error: 'Rate limit exceeded. Free tier: 1,500 requests/day.',
        };
      }

      if (error.status === 401) {
        return {
          success: false,
          provider: this.name,
          images: [],
          metadata: {
            model: this.config.defaultModel || 'gemini-2.5-flash-image',
            generatedAt: new Date().toISOString(),
            generationTime,
          },
          error: 'Invalid API key. Check GEMINI_API_KEY in .env.local',
        };
      }

      // Generic error response
      return {
        success: false,
        provider: this.name,
        images: [],
        metadata: {
          model: this.config.defaultModel || 'gemini-2.5-flash-image',
          generatedAt: new Date().toISOString(),
          generationTime,
        },
        error: `Generation failed: ${error.message || 'Unknown error'}`,
      };
    }
  }
}
