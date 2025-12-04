import { NextRequest, NextResponse } from "next/server";
import { base64ToBuffer } from "@/lib/image-processor";
import { ProviderFactory } from "@/lib/providers/provider-factory";
import { CharacterSheetRequest, CharacterSheetResponse } from "@/lib/types";

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
    const {
      systemPrompt,
      imageData,
      templateData,
      provider: requestedProvider,
      model: requestedModel,
    } = body;

    // Validation: Required fields
    if (!systemPrompt || !imageData) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: systemPrompt, imageData",
        },
        { status: 400 }
      );
    }

    // Convert base64 to buffer (in-memory, Vercel-compatible)
    const imageBuffer = base64ToBuffer(imageData);

    // Convert template base64 to buffer if provided
    const templateBuffer = templateData
      ? base64ToBuffer(templateData)
      : undefined;

    // Get provider instance (use requested or default)
    let provider;
    if (requestedProvider && requestedModel) {
      provider = ProviderFactory.createProvider(
        requestedProvider as any,
        requestedModel
      );
    } else {
      provider = ProviderFactory.getDefaultProvider();
    }

    // Build complete prompt for character sheet generation
    const fullPrompt = systemPrompt;

    // Call provider to generate character sheet
    const result = await provider.generateCharacterSheet({
      prompt: fullPrompt,
      imageBuffer,
      mimeType: "image/webp",
      templateBuffer,
      templateMimeType: templateBuffer ? "image/webp" : undefined,
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

    // Return base64 image data (in-memory, Vercel-compatible)
    const generatedImageData = result.images[0];

    return NextResponse.json({
      success: true,
      imageData: generatedImageData,
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
