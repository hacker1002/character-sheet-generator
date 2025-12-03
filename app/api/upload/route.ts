import { NextRequest, NextResponse } from 'next/server';
import { compressImage } from '@/lib/image-processor';
import { UploadResponse } from '@/lib/types';

// Configure route for larger uploads
export const runtime = 'nodejs';
export const maxDuration = 30; // 30s timeout

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 15 * 1024 * 1024; // 15MB

/**
 * POST /api/upload
 * Handles image upload, validates, compresses, and saves temporarily
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    // Validation: File exists
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validation: File type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Use JPG, PNG, or WebP.',
        },
        { status: 400 }
      );
    }

    // Validation: File size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File exceeds 15MB limit' },
        { status: 400 }
      );
    }

    // Process image: compress with Sharp
    const buffer = Buffer.from(await file.arrayBuffer());
    const compressed = await compressImage(buffer, { quality: 85 });

    // Convert to base64 for in-memory storage (Vercel-compatible)
    const base64 = compressed.toString('base64');
    const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Create data URL for preview
    const previewUrl = `data:image/webp;base64,${base64}`;

    return NextResponse.json({
      success: true,
      uploadId,
      imageData: base64,
      previewUrl,
      fileSize: compressed.length,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
