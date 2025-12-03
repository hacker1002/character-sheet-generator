import { NextRequest, NextResponse } from "next/server";
import {
  loadFile,
  base64ToBuffer,
  saveUploadedFile,
} from "@/lib/image-processor";
import { ProviderFactory } from "@/lib/providers/provider-factory";
import { CharacterSheetRequest, CharacterSheetResponse } from "@/lib/types";
import { join } from "path";

export const runtime = "nodejs";
export const maxDuration = 60; // Provider-dependent, can take longer

/**
 * POST /api/generate
 * Generate character sheet using AI provider
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<CharacterSheetResponse>> {
  try {
    const body: CharacterSheetRequest = await request.json();
    const { systemPrompt, uploadId, provider: requestedProvider } = body;

    // Validation: Required fields
    if (!systemPrompt || !uploadId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: systemPrompt, uploadId",
        },
        { status: 400 }
      );
    }

    // Load uploaded image
    const uploadPath = join(
      process.cwd(),
      "public",
      "uploads",
      `${uploadId}.webp`
    );
    const imageBuffer = await loadFile(uploadPath);

    // Get provider instance (use requested or default)
    const provider = requestedProvider
      ? ProviderFactory.createProvider(requestedProvider as any, {
          name: requestedProvider,
          apiKey:
            process.env[`${requestedProvider.toUpperCase()}_API_KEY`] || "",
        })
      : ProviderFactory.getDefaultProvider();

    // Build complete prompt for character sheet generation
    const fullPrompt = systemPrompt;

    // Call provider to generate character sheet
    const result = await provider.generateCharacterSheet({
      prompt: fullPrompt,
      imageBuffer,
      mimeType: "image/webp",
    });

    // Check if generation succeeded
    if (!result.success || !result.images[0]) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Generation failed",
          metadata: {
            provider: result.provider,
            model: result.metadata.model,
            generatedAt: result.metadata.generatedAt,
          },
        },
        { status: 500 }
      );
    }

    // Save generated image to public/uploads
    const generatedBuffer = base64ToBuffer(result.images[0]);
    const generatedFilename = `generated-${uploadId}-${result.provider}.png`;
    await saveUploadedFile(generatedBuffer, generatedFilename);

    return NextResponse.json({
      success: true,
      imageUrl: `/uploads/${generatedFilename}`,
      metadata: {
        provider: result.provider,
        model: result.metadata.model,
        generatedAt: result.metadata.generatedAt,
      },
    });
  } catch (error: any) {
    console.error("Generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Character sheet generation failed",
      },
      { status: 500 }
    );
  }
}
