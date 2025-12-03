// Character sheet request/response types for API routes

export interface CharacterSheetRequest {
  systemPrompt: string;
  uploadId: string;
  provider?: string; // Optional: override default provider
}

export interface CharacterSheetResponse {
  success: boolean;
  imageUrl?: string;
  imageData?: string;
  error?: string;
  metadata?: {
    provider: string;
    model: string;
    generatedAt: string;
    dimensions?: { width: number; height: number };
  };
}

export interface UploadResponse {
  success: boolean;
  uploadId?: string;
  previewUrl?: string;
  error?: string;
  fileSize?: number;
}
