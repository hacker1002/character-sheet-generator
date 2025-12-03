'use client';

interface ResultDisplayProps {
  imageUrl: string;
  metadata?: {
    provider: string;
    model: string;
    generatedAt: string;
  };
  onReset?: () => void;
}

/**
 * Display component for generated character sheet
 * Shows image and metadata, with option to generate another
 */
export function ResultDisplay({
  imageUrl,
  metadata,
  onReset,
}: ResultDisplayProps) {
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

      {onReset && (
        <button onClick={onReset} className="reset-button">
          Generate Another
        </button>
      )}
    </div>
  );
}
