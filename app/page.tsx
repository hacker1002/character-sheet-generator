'use client';

import { useState } from 'react';
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

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <main>
      {/* Show form if no result */}
      {!result && !isLoading && (
        <>
          <CharacterForm onSubmit={handleSubmit} isLoading={isLoading} />
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}
        </>
      )}

      {/* Show loading state */}
      {isLoading && <LoadingState />}

      {/* Show result */}
      {result && result.imageUrl && (
        <ResultDisplay
          imageUrl={result.imageUrl}
          metadata={result.metadata}
          onReset={handleReset}
        />
      )}
    </main>
  );
}
