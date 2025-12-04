import { BaseProvider, ProviderConfig } from "./types";
import { GeminiProvider } from "./gemini-provider";
import { FluxProvider } from "./flux-provider";

type ProviderType =
  | "gemini"
  | "flux"
  | "openai"
  | "anthropic"
  | "stability"
  | "replicate";

// Type for provider constructor
type ProviderConstructor = new (config: ProviderConfig) => BaseProvider;

/**
 * Factory for creating and managing AI provider instances
 * Implements registry pattern for extensibility
 */
export class ProviderFactory {
  private static providers: Map<string, ProviderConstructor> = new Map<
    string,
    ProviderConstructor
  >([
    ["gemini", GeminiProvider],
    ["flux", FluxProvider],
    // Future providers will be added here:
    // ['openai', OpenAIProvider],
    // ['anthropic', AnthropicProvider],
  ]);

  /**
   * Create provider instance by type
   * @throws Error if provider not implemented or invalid config
   */
  static createProvider(type: ProviderType, model?: string): BaseProvider {
    const ProviderClass = this.providers.get(type);

    if (!ProviderClass) {
      throw new Error(`Provider '${type}' not implemented`);
    }

    const apiKey = this.getApiKeyForProvider(type);

    const provider = new ProviderClass({
      name: type,
      apiKey: apiKey,
      defaultModel: model,
    });

    if (!provider.validateConfig()) {
      throw new Error(`Invalid configuration for provider '${type}'`);
    }

    return provider;
  }

  /**
   * Get default provider from environment configuration
   */
  static getDefaultProvider(): BaseProvider {
    const defaultType = (process.env.DEFAULT_PROVIDER ||
      "gemini") as ProviderType;
    return this.createProvider(defaultType);
  }

  /**
   * Get API key for specific provider from environment
   * @private
   */
  private static getApiKeyForProvider(type: ProviderType): string {
    const keyMap: Record<ProviderType, string> = {
      gemini: process.env.GEMINI_API_KEY || "",
      flux: process.env.REPLICATE_API_TOKEN || "",
      openai: process.env.OPENAI_API_KEY || "",
      anthropic: process.env.ANTHROPIC_API_KEY || "",
      stability: process.env.STABILITY_API_KEY || "",
      replicate: process.env.REPLICATE_API_TOKEN || "",
    };

    const apiKey = keyMap[type];

    if (!apiKey) {
      throw new Error(
        `API key not found for provider '${type}'. Check your .env.local file.`
      );
    }

    return apiKey;
  }

  /**
   * Get list of available provider types
   */
  static getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
