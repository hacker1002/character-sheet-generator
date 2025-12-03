'use client';

import { useState, useEffect } from 'react';
import { CharacterForm } from './components/character-form';
import { ResultDisplay } from './components/result-display';
import { LoadingState } from './components/loading-state';
import { CharacterSheetFormData } from '@/lib/validators';
import { UploadResponse, CharacterSheetResponse } from '@/lib/types';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CharacterSheetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CharacterSheetFormData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Step 1: Upload image
      const formData = new FormData();
      formData.append('image', data.avatar);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData: UploadResponse = await uploadResponse.json();

      if (!uploadData.success || !uploadData.uploadId) {
        throw new Error(uploadData.error || 'Image upload failed');
      }

      // Step 2: Generate character sheet
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt: data.systemPrompt,
          uploadId: uploadData.uploadId,
        }),
      });

      const generateData: CharacterSheetResponse =
        await generateResponse.json();

      if (!generateData.success) {
        throw new Error(generateData.error || 'Character sheet generation failed');
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
      {/* Page Header - Above Both Columns */}
      <header className="page-header">
        <h1>Character Sheet Generator</h1>
        <p className="subtitle">
          Upload an avatar image and generate an 8-panel character sheet using AI
        </p>
      </header>

      <div className="main-grid">
        {/* Left Column - Form */}
        <section className="form-section">
          <CharacterForm onSubmit={handleSubmit} isLoading={isLoading} />
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}
        </section>

        {/* Right Column - Result */}
        <section className="result-section">
          {isLoading && <LoadingState />}
          {result && result.imageUrl && (
            <ResultDisplay
              imageUrl={result.imageUrl}
              metadata={result.metadata}
            />
          )}
          {!isLoading && !result && (
            <div className="result-placeholder">
              <p>Generated character sheet will appear here</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
