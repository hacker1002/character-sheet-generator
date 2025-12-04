'use client';

interface ResultDisplayProps {
  imageData: string; // Base64 image data
  metadata?: {
    provider: string;
    model: string;
    generatedAt: string;
    generationTime?: number; // Duration in milliseconds
  };
}

/**
 * Display component for generated character sheet
 * Shows image and metadata (base64 in-memory)
 */
export function ResultDisplay({ imageData, metadata }: ResultDisplayProps) {
  // Convert base64 to data URL for display
  const imageUrl = `data:image/png;base64,${imageData}`;

  return (
    <div className="result-display">
      <h2>Generated Character Sheet</h2>

      <div className="result-image">
        <img src={imageUrl} alt="Generated character sheet" />
      </div>

      {metadata && (
        <div className="result-metadata">
          <p>
            <strong>Provider:</strong> {metadata.provider}
          </p>
          <p>
            <strong>Model:</strong> {metadata.model}
          </p>
          <p>
            <strong>Generated:</strong>{' '}
            {new Date(metadata.generatedAt).toLocaleString()}
          </p>
          {metadata.generationTime && (
            <p>
              <strong>Duration:</strong>{' '}
              {(metadata.generationTime / 1000).toFixed(2)}s
            </p>
          )}
        </div>
      )}
    </div>
  );
}
