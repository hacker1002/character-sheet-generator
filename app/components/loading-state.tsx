"use client";

/**
 * Loading state component with spinner and message
 * Displayed while AI is generating the character sheet
 */
export function LoadingState() {
  return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Generating your character sheet...</p>
      <p className="loading-hint">This may take 10-60 seconds</p>
    </div>
  );
}
