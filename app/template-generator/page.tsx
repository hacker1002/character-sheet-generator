'use client';

import { useState, useEffect } from 'react';
import { TemplateForm } from '../components/template-form';
import { TabbedResultDisplay } from '../components/tabbed-result-display';
import { LoadingState } from '../components/loading-state';
import { TemplateGeneratorFormData } from '@/lib/validators';
import { UploadResponse } from '@/lib/types';
import { useParallelGeneration } from '@/lib/hooks/use-parallel-generation';
import { DEFAULT_MODELS } from '@/lib/models/model-config';

export default function TemplateGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    results,
    isLoading: isGenerating,
    error: generationError,
    generateWithModels,
  } = useParallelGeneration();

  const handleSubmit = async (data: TemplateGeneratorFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Upload avatar image
      const avatarFormData = new FormData();
      avatarFormData.append('image', data.avatar);

      const avatarUploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: avatarFormData,
      });

      const avatarData: UploadResponse = await avatarUploadResponse.json();

      if (!avatarData.success || !avatarData.imageData) {
        throw new Error(avatarData.error || 'Avatar upload failed');
      }

      // Step 2: Upload template image
      const templateFormData = new FormData();
      templateFormData.append('image', data.template);

      const templateUploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: templateFormData,
      });

      const templateData: UploadResponse = await templateUploadResponse.json();

      if (!templateData.success || !templateData.imageData) {
        throw new Error(templateData.error || 'Template upload failed');
      }

      // Step 3: Generate with multiple models in parallel
      await generateWithModels(
        {
          systemPrompt: data.systemPrompt,
          imageData: avatarData.imageData,
          templateData: templateData.imageData,
        },
        DEFAULT_MODELS
      );
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to results when generation completes
  useEffect(() => {
    if (results.length > 0) {
      setTimeout(() => {
        document.querySelector('.result-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [results]);

  return (
    <main className="page-container">
      {/* Page Header */}
      <header className="page-header">
        <h1>Template-Based Generator</h1>
        <p className="subtitle">
          Upload an avatar and a template image - AI will generate results following the template structure
        </p>
      </header>

      <div className="main-grid">
        {/* Left Column - Form */}
        <section className="form-section">
          <TemplateForm
            onSubmit={handleSubmit}
            isLoading={isLoading || isGenerating}
          />
          {(error || generationError) && (
            <div className="error-message">
              <strong>Error:</strong> {error || generationError}
            </div>
          )}
        </section>

        {/* Right Column - Results with Tabs (Always visible) */}
        <section className="result-section">
          <TabbedResultDisplay models={DEFAULT_MODELS} results={results} />
        </section>
      </div>
    </main>
  );
}
