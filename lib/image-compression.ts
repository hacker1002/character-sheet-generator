import imageCompression from "browser-image-compression";

/**
 * Configuration for image compression
 */
export interface CompressionConfig {
  maxSizeMB?: number;
  initialQuality?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

/**
 * Default compression configuration
 * - maxSizeMB: 3MB target size
 * - initialQuality: 0.9 (90% quality, visually identical)
 * - maxWidthOrHeight: 2048px (preserves resolution for most use cases)
 * - useWebWorker: true (non-blocking UI)
 */
const DEFAULT_CONFIG: CompressionConfig = {
  maxSizeMB: 3,
  initialQuality: 0.9,
  maxWidthOrHeight: 2048,
  useWebWorker: true,
};

/**
 * Size threshold for compression (3MB in bytes)
 * Files larger than this will be compressed
 */
const SIZE_THRESHOLD = 3 * 1024 * 1024; // 3MB

/**
 * Supported image MIME types for compression
 */
const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Compress an image file if it exceeds the size threshold
 *
 * @param file - Original image file
 * @param config - Optional compression configuration
 * @returns Compressed file (or original if < threshold)
 *
 * @example
 * ```typescript
 * const compressedFile = await compressImage(file);
 * if (compressedFile.size < file.size) {
 *   console.log('Compressed from', file.size, 'to', compressedFile.size);
 * }
 * ```
 */
export async function compressImage(
  file: File,
  config: CompressionConfig = {}
): Promise<File> {
  // Validate file type first
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    console.warn("File is not a valid image type, skipping compression");
    return file;
  }

  // Skip compression if file is already small enough
  if (file.size <= SIZE_THRESHOLD) {
    return file;
  }

  try {
    const options = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    // Perform compression using browser-image-compression
    const compressedFile = await imageCompression(file, options);

    // If compression didn't help (rare), return original
    if (compressedFile.size >= file.size) {
      console.info("Compression did not reduce file size, using original");
      return file;
    }

    return compressedFile;
  } catch (error) {
    // On compression failure, return original file
    console.error("Image compression failed:", error);
    return file;
  }
}

/**
 * Get human-readable file size
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
