/**
 * Model configuration for multi-model generation
 * Defines available models and their display settings
 */

export interface ModelConfig {
  id: string;
  label: string;
  provider: string;
  model: string;
  preview?: boolean;
}

/**
 * Default models for parallel generation
 * Currently supports three models:
 * - gemini-2.5-flash-image: Stable, fast generation
 * - gemini-3-pro-image-preview: Preview, advanced reasoning + text rendering
 * - flux-schnell: Replicate AI, fast generation (50 free/month, then $0.003/img)
 */
export const DEFAULT_MODELS: ModelConfig[] = [
  {
    id: "gemini-flash",
    label: "Gemini Flash",
    provider: "gemini",
    model: "gemini-2.5-flash-image",
    preview: false,
  },
  {
    id: "gemini-pro",
    label: "Gemini Pro (Preview)",
    provider: "gemini",
    model: "gemini-3-pro-image-preview",
    preview: true,
  },
  {
    id: "flux-schnell",
    label: "Flux Schnell",
    provider: "flux",
    model: "black-forest-labs/flux-schnell",
    preview: false,
  },
];

/**
 * All available models (for future extensibility)
 * Easy to add new models/providers here
 */
export const ALL_MODELS: ModelConfig[] = [
  ...DEFAULT_MODELS,
  // Future providers can be added here:
  // { id: 'openai-dalle', label: 'DALL-E 3', provider: 'openai', model: 'dall-e-3' },
  // { id: 'stability-sd', label: 'Stable Diffusion', provider: 'stability', model: 'sd-3' },
];

/**
 * Get model config by ID
 */
export function getModelById(id: string): ModelConfig | undefined {
  return ALL_MODELS.find((m) => m.id === id);
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: string): ModelConfig[] {
  return ALL_MODELS.filter((m) => m.provider === provider);
}
