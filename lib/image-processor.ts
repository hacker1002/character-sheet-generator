import sharp from 'sharp';
import { readFile, writeFile, unlink } from 'fs/promises';
import { join } from 'path';

/**
 * Compress image using Sharp with WebP format
 * Reduces file size while maintaining quality
 */
export async function compressImage(
  inputBuffer: Buffer,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<Buffer> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 80 } = options;

  try {
    const compressed = await sharp(inputBuffer)
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();

    return compressed;
  } catch (error: any) {
    throw new Error(`Image compression failed: ${error.message}`);
  }
}

/**
 * Convert buffer to base64 string for API transmission
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}

/**
 * Convert base64 string back to buffer
 */
export function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}

/**
 * Save uploaded file temporarily to public/uploads directory
 */
export async function saveUploadedFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  const filepath = join(uploadDir, filename);

  await writeFile(filepath, buffer);
  return filepath;
}

/**
 * Delete temporary file
 */
export async function deleteFile(filepath: string): Promise<void> {
  try {
    await unlink(filepath);
  } catch (error: any) {
    console.error(`Failed to delete file: ${filepath}`, error);
  }
}

/**
 * Load file as buffer from filesystem
 */
export async function loadFile(filepath: string): Promise<Buffer> {
  return await readFile(filepath);
}
