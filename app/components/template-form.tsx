"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  templateGeneratorSchema,
  TemplateGeneratorFormData,
  TEMPLATE_SYSTEM_PROMPT,
} from "@/lib/validators";
import { useState, useEffect } from "react";
import { UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";

interface TemplateFormProps {
  onSubmit: (data: TemplateGeneratorFormData) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Template-based generator form with 2 image upload fields and system prompt:
 * 1. Avatar image upload (character reference)
 * 2. Template image upload (layout structure)
 * 3. System prompt textarea (customizable instructions)
 */
export function TemplateForm({ onSubmit, isLoading }: TemplateFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<TemplateGeneratorFormData>({
    resolver: zodResolver(templateGeneratorSchema),
    mode: "onBlur", // Validate on blur for better UX
    defaultValues: {
      systemPrompt: TEMPLATE_SYSTEM_PROMPT,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      {/* Avatar Image Upload */}
      <div className="form-field">
        <h3>1. Upload Avatar Image</h3>
        <p className="section-description">
          Upload the character image you want to generate variations of
        </p>
        <AvatarImageUpload setValue={setValue} errors={errors} />
      </div>

      {/* Template Image Upload */}
      <div className="form-field">
        <h3>2. Upload Template Image</h3>
        <p className="section-description">
          Upload the template structure you want the AI to follow
        </p>
        <TemplateImageUpload setValue={setValue} errors={errors} />
      </div>

      {/* System Prompt */}
      <div className="form-field">
        <h3>3. System Prompt</h3>
        <label htmlFor="systemPrompt">
          Generation Instructions <span className="required">*</span>
        </label>
        <textarea
          id="systemPrompt"
          rows={6}
          placeholder="Describe how to use the template..."
          {...register("systemPrompt")}
        />
        {errors.systemPrompt && (
          <span className="error">{errors.systemPrompt.message}</span>
        )}
        <span className="hint">
          Customize the instructions for how AI should use the template. Default: "Generate result follow the input template image structure"
        </span>
      </div>

      {/* Info Box */}
      <div className="info-box">
        <strong>How it works:</strong>
        <p>
          The AI will analyze the template image structure and generate a
          similar layout using your avatar image based on your custom instructions.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="submit-button"
      >
        {isLoading ? "Generating..." : "Generate with Template"}
      </button>
    </form>
  );
}

/**
 * Avatar image upload component
 */
function AvatarImageUpload({
  setValue,
  errors,
}: {
  setValue: UseFormSetValue<TemplateGeneratorFormData>;
  errors: FieldErrors<TemplateGeneratorFormData>;
}) {
  const [preview, setPreview] = useState<string | null>(null);

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
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setValue("avatar", file, { shouldValidate: true });
    } else {
      setPreview(null);
      setValue("avatar", null as any, { shouldValidate: true });
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

      {/* Fixed Preview Container */}
      <div className="fixed-preview">
        {preview ? (
          <img src={preview} alt="Avatar preview" className="preview-image" />
        ) : (
          <div className="preview-placeholder">
            <span className="placeholder-text">
              Avatar preview will appear here
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Template image upload component
 */
function TemplateImageUpload({
  setValue,
  errors,
}: {
  setValue: UseFormSetValue<TemplateGeneratorFormData>;
  errors: FieldErrors<TemplateGeneratorFormData>;
}) {
  const [preview, setPreview] = useState<string | null>(null);

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
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setValue("template", file, { shouldValidate: true });
    } else {
      setPreview(null);
      setValue("template", null as any, { shouldValidate: true });
    }
  };

  return (
    <div className="form-field">
      <label htmlFor="template">
        Template Image <span className="required">*</span>
      </label>
      <input
        id="template"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />
      {errors.template && (
        <span className="error">{errors.template.message}</span>
      )}

      {/* Fixed Preview Container */}
      <div className="fixed-preview">
        {preview ? (
          <img src={preview} alt="Template preview" className="preview-image" />
        ) : (
          <div className="preview-placeholder">
            <span className="placeholder-text">
              Template preview will appear here
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
