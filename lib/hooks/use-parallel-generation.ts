import { useState } from 'react';
import { ModelConfig } from '@/lib/models/model-config';
import { CharacterSheetResponse } from '@/lib/types';

/**
 * Request data for generation
 */
export interface GenerationRequest {
  systemPrompt: string;
  imageData: string;
  templateData?: string;
}

/**
 * Result for each model with label and model ID
 * Loading state tracks if this specific model is still generating
 */
export interface ModelResult extends CharacterSheetResponse {
  modelId: string;
  label: string;
  isLoading?: boolean; // Track loading state per model
}

/**
 * Hook for parallel generation with multiple models
 * Progressive display: Shows results as each model completes (don't wait for all)
 *
 * Benefits of client-side orchestration:
 * - Reuses existing /api/generate endpoint (YAGNI)
 * - Simpler than server-side orchestration (KISS)
 * - No API proliferation (DRY)
 * - Supports N models naturally
 * - Progressive results improve perceived performance
 */
export function useParallelGeneration() {
  const [results, setResults] = useState<ModelResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate character sheets with multiple models in parallel
   * Progressive display: Updates each model's result as it completes
   * @param request - Generation request data
   * @param models - Array of models to use for generation
   */
  const generateWithModels = async (
    request: GenerationRequest,
    models: ModelConfig[]
  ) => {
    setIsLoading(true);
    setError(null);

    // Initialize results with loading state for all models immediately
    const initialResults: ModelResult[] = models.map((model) => ({
      success: false,
      modelId: model.id,
      label: model.label,
      isLoading: true,
    }));
    setResults(initialResults);

    try {
      // Call API in parallel for each model
      const promises = models.map(async (model, idx) => {
        const startTime = Date.now(); // Track start time for this model

        try {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...request,
              provider: model.provider,
              model: model.model,
            }),
          });

          // Check for HTTP errors before parsing JSON
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              error: `HTTP ${response.status}: ${response.statusText}`,
            }));
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }

          const data: CharacterSheetResponse = await response.json();
          const endTime = Date.now(); // Track end time
          const durationMs = endTime - startTime; // Calculate duration

          const result: ModelResult = {
            ...data,
            modelId: model.id,
            label: model.label,
            isLoading: false,
            metadata: data.metadata
              ? {
                  ...data.metadata,
                  generationTime: durationMs, // Override with client-side duration
                }
              : {
                  provider: model.provider,
                  model: model.model,
                  generatedAt: new Date().toISOString(),
                  generationTime: durationMs,
                },
          };

          // Progressive update: Update this specific model's result immediately
          setResults((prevResults) =>
            prevResults.map((r, i) => (i === idx ? result : r))
          );

          return result;
        } catch (error: any) {
          const endTime = Date.now();
          const durationMs = endTime - startTime;

          // Handle individual model failure
          const errorResult: ModelResult = {
            success: false,
            error: error.message || 'Generation failed',
            modelId: model.id,
            label: model.label,
            isLoading: false,
            metadata: {
              provider: model.provider,
              model: model.model,
              generatedAt: new Date().toISOString(),
              generationTime: durationMs,
            },
          };

          // Progressive update: Update this specific model's error immediately
          setResults((prevResults) =>
            prevResults.map((r, i) => (i === idx ? errorResult : r))
          );

          return errorResult;
        }
      });

      // Wait for all to complete
      await Promise.allSettled(promises);

      // Check if all models failed
      setResults((currentResults) => {
        const allFailed = currentResults.every((r) => !r.success);
        if (allFailed) {
          setError('All models failed to generate. Please try again.');
        }
        return currentResults;
      });
    } catch (err: any) {
      console.error('Parallel generation error:', err);
      setError(err.message || 'Parallel generation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    results,
    isLoading,
    error,
    generateWithModels,
  };
}
