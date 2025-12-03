'use client';

import { useState, useEffect } from 'react';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { CharacterSheetFormData } from '@/lib/validators';

interface ImageUploadProps {
  register: UseFormRegister<CharacterSheetFormData>;
  setValue: UseFormSetValue<CharacterSheetFormData>;
  errors: FieldErrors<CharacterSheetFormData>;
  onChange?: (file: File | null) => void;
}

/**
 * Image upload component with instant preview
 * Uses object URL for preview, cleans up on unmount
 * Extracts File from FileList and sets it in React Hook Form
 */
export function ImageUpload({ register, setValue, errors, onChange }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  // Cleanup object URL on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    const file = fileList?.[0];

    if (file) {
      // Revoke previous preview URL
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      // Create new preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Set File (not FileList) in React Hook Form
      setValue('avatar', file, { shouldValidate: true });
      onChange?.(file);
    } else {
      setPreview(null);
      setValue('avatar', null as any, { shouldValidate: true });
      onChange?.(null);
    }
  };

  return (
    <div className="form-field">
      <label htmlFor="avatar">
        Avatar Image <span className="required">*</span>
      </label>
      <input
        id="avatar"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />
      {errors.avatar && <span className="error">{errors.avatar.message}</span>}
      {preview && (
        <div className="preview">
          <img src={preview} alt="Avatar preview" />
        </div>
      )}
    </div>
  );
}
