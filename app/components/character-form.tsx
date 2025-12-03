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
 * Layout: Two-column grid on desktop, stacked on mobile
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
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      {/* Image Upload */}
      <ImageUpload register={register} setValue={setValue} errors={errors} />

      {/* System Prompt */}
      <div className="form-field">
        <label htmlFor="systemPrompt">
          System Prompt <span className="required">*</span>
        </label>
        <textarea
          id="systemPrompt"
          rows={12}
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
