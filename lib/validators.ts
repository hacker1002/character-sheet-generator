import { z } from 'zod';

// File validation constraints
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Simplified character sheet form schema with only 2 fields
 * Removed: name, gender fields (as per updated requirements)
 */
export const characterSheetSchema = z.object({
  // Avatar image upload (required, max 15MB, JPG/PNG/WebP only)
  // Note: Validated as File (component extracts from FileList before validation)
  avatar: z
    .instanceof(File, { message: 'Avatar image is required' })
    .refine(
      (file) => file.size > 0 && file.size <= MAX_FILE_SIZE,
      'Image must be less than 15MB'
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only JPG, PNG, and WebP formats are supported'
    ),

  // System prompt textarea (10-2000 characters)
  systemPrompt: z
    .string()
    .min(10, 'System prompt must be at least 10 characters')
    .max(2000, 'System prompt must be less than 2000 characters'),
});

// TypeScript type inference from Zod schema
export type CharacterSheetFormData = z.infer<typeof characterSheetSchema>;

/**
 * Default system prompt template for Vietnamese kindergarten character sheets
 * Pre-fills textarea to guide users
 */
export const DEFAULT_SYSTEM_PROMPT = `Character sheet of a cute Vietnamese kindergarten child, headshot only. Style: High-quality children's storybook illustration style, soft digital painting, warm colors, expressive, detailed facial features, cute and charming, hand-drawn texture, white background. Consistency: High fidelity to the original face features from the reference image, keeping exact hair style and face shape. Layout: A grid layout of 8 panels (4 columns x 2 rows). Content Row 1 (Front views): 1. Neutral expression, 2. Big happy smile, 3. Crying with tears, 4. Grumpy pouting face. Content Row 2 (Angles): 5. Left side profile, 6. Right side profile, 7. 3/4 angle view from front-left, 8. Back of the head view showing hair only. Negative Prompt: (distortion, bad anatomy, extra fingers, messy lines, text, watermark, blurry, realistic photo style, 3d render)`;

/**
 * Template-based generator schema with 2 image fields and system prompt
 */
export const templateGeneratorSchema = z.object({
  // Avatar image upload (required, max 15MB, JPG/PNG/WebP only)
  avatar: z
    .instanceof(File, { message: 'Avatar image is required' })
    .refine(
      (file) => file.size > 0 && file.size <= MAX_FILE_SIZE,
      'Image must be less than 15MB'
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only JPG, PNG, and WebP formats are supported'
    ),

  // Template image upload (required, max 15MB, JPG/PNG/WebP only)
  template: z
    .instanceof(File, { message: 'Template image is required' })
    .refine(
      (file) => file.size > 0 && file.size <= MAX_FILE_SIZE,
      'Template must be less than 15MB'
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only JPG, PNG, and WebP formats are supported'
    ),

  // System prompt textarea (10-2000 characters)
  systemPrompt: z
    .string()
    .min(10, 'System prompt must be at least 10 characters')
    .max(2000, 'System prompt must be less than 2000 characters'),
});

// TypeScript type inference from Zod schema
export type TemplateGeneratorFormData = z.infer<typeof templateGeneratorSchema>;

/**
 * Default system prompt for template-based generation
 */
export const TEMPLATE_SYSTEM_PROMPT = 'Generate result follow the input template image structure';
