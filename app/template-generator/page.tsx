'use client';

import { useState, useEffect } from 'react';
import { TemplateForm } from '../components/template-form';
import { ResultDisplay } from '../components/result-display';
import { LoadingState } from '../components/loading-state';
import { TemplateGeneratorFormData, TEMPLATE_SYSTEM_PROMPT } from '@/lib/validators';
import { UploadResponse, CharacterSheetResponse } from '@/lib/types';

export default function TemplateGeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CharacterSheetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: TemplateGeneratorFormData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

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

      // Step 3: Generate character sheet with template
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt: TEMPLATE_SYSTEM_PROMPT,
          imageData: avatarData.imageData,
          templateData: templateData.imageData,
        }),
      });

      const generateData: CharacterSheetResponse =
        await generateResponse.json();

      if (!generateData.success) {
        throw new Error(
          generateData.error || 'Template-based generation failed'
        );
      }

      // Success: display result
      setResult(generateData);
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to result when generation completes
  useEffect(() => {
    if (result) {
      setTimeout(() => {
        document.querySelector('.result-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [result]);

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
          <TemplateForm onSubmit={handleSubmit} isLoading={isLoading} />
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}
        </section>

        {/* Right Column - Result */}
        <section className="result-section">
          {isLoading && <LoadingState />}
          {result && result.imageData && (
            <ResultDisplay
              imageData={result.imageData}
              metadata={result.metadata}
            />
          )}
          {!isLoading && !result && (
            <div className="result-placeholder">
              <p>Generated result will appear here</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
