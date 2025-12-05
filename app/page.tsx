"use client";

import { useState, useEffect } from "react";
import { CharacterForm } from "./components/character-form";
import { TabbedResultDisplay } from "./components/tabbed-result-display";
import { LoadingState } from "./components/loading-state";
import { CharacterSheetFormData } from "@/lib/validators";
import { UploadResponse } from "@/lib/types";
import { useParallelGeneration } from "@/lib/hooks/use-parallel-generation";
import { DEFAULT_MODELS } from "@/lib/models/model-config";
import { compressImage } from "@/lib/image-compression";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    results,
    isLoading: isGenerating,
    error: generationError,
    generateWithModels,
  } = useParallelGeneration();

  const handleSubmit = async (data: CharacterSheetFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Upload image
      const formData = new FormData();

      const avatarCompressed = await compressImage(data.avatar);
      formData.append("image", avatarCompressed);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData: UploadResponse = await uploadResponse.json();

      if (!uploadData.success || !uploadData.imageData) {
        throw new Error(uploadData.error || "Image upload failed");
      }

      // Step 2: Generate with multiple models in parallel
      await generateWithModels(
        {
          systemPrompt: data.systemPrompt,
          imageData: uploadData.imageData,
        },
        DEFAULT_MODELS
      );
    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-scroll to results when generation completes
  useEffect(() => {
    if (results.length > 0) {
      setTimeout(() => {
        document.querySelector(".result-section")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [results]);

  return (
    <main className="page-container">
      {/* Page Header - Above Both Columns */}
      <header className="page-header">
        <h1>Character Sheet Generator</h1>
        <p className="subtitle">
          Upload an avatar image and generate an 8-panel character sheet using
          AI
        </p>
      </header>

      <div className="main-grid">
        {/* Left Column - Form */}
        <section className="form-section">
          <CharacterForm
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
