'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  characterSheetSchema,
  CharacterSheetFormData,
  DEFAULT_SYSTEM_PROMPT,
} from '@/lib/validators';
import { ImageUpload } from './image-upload';

interface CharacterFormProps {
  onSubmit: (data: CharacterSheetFormData) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Simplified character sheet form with only 2 fields:
 * 1. Avatar image upload
 * 2. System prompt textarea
 */
export function CharacterForm({ onSubmit, isLoading }: CharacterFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<CharacterSheetFormData>({
    resolver: zodResolver(characterSheetSchema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: {
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="character-form">
      <h1>Character Sheet Generator</h1>
      <p className="subtitle">
        Upload an avatar image and generate an 8-panel character sheet using AI
      </p>

      {/* Avatar Upload with Preview */}
      <ImageUpload register={register} setValue={setValue} errors={errors} />

      {/* System Prompt Textarea */}
      <div className="form-field">
        <label htmlFor="systemPrompt">
          System Prompt <span className="required">*</span>
        </label>
        <textarea
          id="systemPrompt"
          rows={10}
          placeholder="Describe the character sheet style and layout..."
          {...register('systemPrompt')}
        />
        {errors.systemPrompt && (
          <span className="error">{errors.systemPrompt.message}</span>
        )}
        <span className="hint">
          Describe the style, layout, and expressions for the character sheet.
          Default template provided.
        </span>
      </div>

      {/* Submit Button */}
      <button type="submit" disabled={!isValid || isLoading}>
        {isLoading ? 'Generating...' : 'Generate Character Sheet'}
      </button>
    </form>
  );
}
