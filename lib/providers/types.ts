// Provider abstraction interfaces for AI image generation services

export interface GenerationRequest {
  prompt: string;
  imageBuffer: Buffer;
  mimeType: string;
}

export interface GenerationResult {
  success: boolean;
  provider: string;
  images: string[]; // Base64 encoded images
  metadata: {
    model: string;
    generatedAt: string;
    generationTime: number;
    tokensUsed?: number;
    dimensions?: { width: number; height: number };
  };
  error?: string;
}

export interface ProviderConfig {
  name: string;
  apiKey: string;
  defaultModel?: string;
}

/**
 * Base abstract class for all AI image generation providers.
 * Each provider must extend this class and implement required methods.
 */
export abstract class BaseProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  abstract get name(): string;

  /**
   * Validate provider configuration (API key format, etc.)
   */
  abstract validateConfig(): boolean;

  /**
   * Generate character sheet using provider's API
   */
  abstract generateCharacterSheet(
    request: GenerationRequest
  ): Promise<GenerationResult>;
}
