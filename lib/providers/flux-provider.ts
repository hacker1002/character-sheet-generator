import Replicate from "replicate";
import {
  BaseProvider,
  GenerationRequest,
  GenerationResult,
  ProviderConfig,
} from "./types";

/**
 * Flux provider implementation using Replicate AI
 * Uses black-forest-labs/flux-schnell model for fast image generation
 * Free tier: 50 images/month, then $0.003/img
 */
export class FluxProvider extends BaseProvider {
  private replicate: Replicate;

  constructor(config: ProviderConfig) {
    super(config);
    this.replicate = new Replicate({
      auth: config.apiKey,
    });
  }

  get name(): string {
    return "flux";
  }

  validateConfig(): boolean {
    // Replicate API tokens start with "r8_"
    return !!this.config.apiKey && this.config.apiKey.startsWith("r8_");
  }

  async generateCharacterSheet(
    request: GenerationRequest
  ): Promise<GenerationResult> {
    const startTime = Date.now();

    try {
      // Convert avatar buffer to base64 data URI for Replicate API
      const imageDataUri = `data:${
        request.mimeType
      };base64,${request.imageBuffer.toString("base64")}`;

      // Prepare prompt - enhance with template instruction if template provided
      let enhancedPrompt = request.prompt;
      if (request.templateBuffer && request.templateMimeType) {
        enhancedPrompt = `${request.prompt}. Transform the character/avatar following the exact layout and structure of a character sheet template. Keep the character's appearance and details, but present it in a professional character sheet format.`;
      }

      // Call Replicate API with flux-schnell model
      const output = await this.replicate.run(
        "black-forest-labs/flux-kontext-pro",
        {
          input: {
            prompt: enhancedPrompt,
            image: imageDataUri, // Image-to-image transformation
            strength: 0, // How much to modify (0-1, 0.8 works well)
            num_inference_steps: 4, // Optimized for speed
            num_outputs: 1,
          },
        }
      );

      // Handle response - Replicate returns array or single output
      const outputArray = Array.isArray(output) ? output : [output];
      let imageUrl = outputArray[0];

      if (!imageUrl) {
        throw new Error("No image data in Replicate response");
      }

      // Ensure we have a string URL
      if (typeof imageUrl !== "string") {
        imageUrl = `${imageUrl}`;
      }

      // Fetch image and convert to base64 (if it's a URL)
      const base64Image = imageUrl.startsWith("http")
        ? await this.fetchImageAsBase64(imageUrl)
        : imageUrl;

      const generationTime = Date.now() - startTime;

      return {
        success: true,
        provider: this.name,
        images: [base64Image],
        metadata: {
          model: this.config.defaultModel || "flux-schnell",
          generatedAt: new Date().toISOString(),
          generationTime,
        },
      };
    } catch (error: any) {
      const generationTime = Date.now() - startTime;

      // Handle specific error cases
      if (error.message?.includes("rate limit")) {
        return {
          success: false,
          provider: this.name,
          images: [],
          metadata: {
            model: this.config.defaultModel || "flux-schnell",
            generatedAt: new Date().toISOString(),
            generationTime,
          },
          error: "Rate limit exceeded. Free tier: 50 images/month.",
        };
      }

      if (
        error.message?.includes("authentication") ||
        error.message?.includes("401")
      ) {
        return {
          success: false,
          provider: this.name,
          images: [],
          metadata: {
            model: this.config.defaultModel || "flux-schnell",
            generatedAt: new Date().toISOString(),
            generationTime,
          },
          error: `Invalid API key. ${error.message}`,
        };
      }

      // Generic error response
      return {
        success: false,
        provider: this.name,
        images: [],
        metadata: {
          model: this.config.defaultModel || "flux-schnell",
          generatedAt: new Date().toISOString(),
          generationTime,
        },
        error: `Generation failed: ${error.message || "Unknown error"}`,
      };
    }
  }

  /**
   * Fetch image from URL and convert to base64
   * @private
   */
  private async fetchImageAsBase64(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer).toString("base64");
  }
}
