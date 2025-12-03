'use client';

interface ResultDisplayProps {
  imageUrl: string;
  metadata?: {
    provider: string;
    model: string;
    generatedAt: string;
  };
}

/**
 * Display component for generated character sheet
 * Shows image and metadata
 */
export function ResultDisplay({ imageUrl, metadata }: ResultDisplayProps) {
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
        </div>
      )}
    </div>
  );
}
