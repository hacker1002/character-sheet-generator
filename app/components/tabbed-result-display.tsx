'use client';

import { useState } from 'react';
import { ResultDisplay } from './result-display';
import { LoadingState } from './loading-state';
import { ModelResult } from '@/lib/hooks/use-parallel-generation';
import { ModelConfig } from '@/lib/models/model-config';

interface TabbedResultDisplayProps {
  models: ModelConfig[]; // Always show tabs for these models
  results: ModelResult[];
}

/**
 * Tabbed display component for multi-model generation results
 * Always shows tabs, displays results progressively as each model completes
 * Preserves active tab selection across regenerations
 */
export function TabbedResultDisplay({
  models,
  results,
}: TabbedResultDisplayProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Create display data by merging models with results
  const tabData = models.map((model) => {
    const result = results.find((r) => r.modelId === model.id);
    return {
      model,
      result: result || null,
    };
  });

  return (
    <div className="tabbed-result-display">
      {/* Tab Headers - Always visible */}
      <div className="tab-headers">
        {tabData.map((tab, idx) => {
          const { model, result } = tab;
          const isLoading = result?.isLoading ?? false;
          const hasSuccess = result?.success ?? false;
          const hasError = result && !result.success && !isLoading;

          return (
            <button
              key={model.id}
              className={`tab-header ${activeTab === idx ? 'active' : ''} ${
                hasSuccess ? 'success' : hasError ? 'error' : ''
              }`}
              onClick={() => setActiveTab(idx)}
              type="button"
            >
              {model.label}
              {isLoading && <span className="badge loading">⏳</span>}
              {hasSuccess && <span className="badge success">✓</span>}
              {hasError && <span className="badge error">✗</span>}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {tabData.map((tab, idx) => {
          const { model, result } = tab;
          const isLoading = result?.isLoading ?? false;

          return (
            <div
              key={model.id}
              className={`tab-panel ${activeTab === idx ? 'active' : 'hidden'}`}
            >
              {/* Show loading state for this specific model */}
              {isLoading && <LoadingState />}

              {/* Show result if successful */}
              {result?.success && result.imageData && (
                <ResultDisplay
                  imageData={result.imageData}
                  metadata={result.metadata}
                />
              )}

              {/* Show error if failed */}
              {result && !result.success && !isLoading && result.error && (
                <div className="error-message">
                  <strong>Generation Failed:</strong> {result.error}
                  <p className="hint">
                    This model may be unavailable or rate limited. Other models
                    may have succeeded.
                  </p>
                </div>
              )}

              {/* Show placeholder if no result yet (before first generation) */}
              {!result && !isLoading && (
                <div className="result-placeholder">
                  <p>Click &quot;Generate&quot; to see results</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
