// Character sheet request/response types for API routes

export interface CharacterSheetRequest {
  systemPrompt: string;
  uploadId?: string; // Legacy: for file-based uploads
  imageData?: string; // Base64 image data (in-memory)
  templateData?: string; // Base64 template image data (for template-based generation)
  provider?: string; // Optional: override default provider
  model?: string; // Optional: override default model
}

export interface CharacterSheetResponse {
  success: boolean;
  imageUrl?: string; // Legacy: URL to saved file
  imageData?: string; // Base64 image data (in-memory)
  error?: string;
  metadata?: {
    provider: string;
    model: string;
    generatedAt: string;
    generationTime?: number; // Duration in milliseconds
    dimensions?: { width: number; height: number };
  };
}

export interface UploadResponse {
  success: boolean;
  uploadId?: string; // Legacy: for file-based uploads
  imageData?: string; // Base64 compressed image (in-memory)
  previewUrl?: string; // Data URL for preview
  error?: string;
  fileSize?: number;
}
