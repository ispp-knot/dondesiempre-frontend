'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { FaImage, FaLock } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { ALLOWED_IMAGE_TYPES } from '@/lib/utils/imageType';

interface ImageUploadProps {
  onChange: (file: File | null) => void;
  existingImageUrl?: string;
  disabled?: boolean;
  className?: string;
}

export default function ImageUpload({
  onChange,
  existingImageUrl,
  disabled = false,
  className,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(existingImageUrl ?? null);
  const [hasFile, setHasFile] = useState(false);
  const [typeError, setTypeError] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        e.target.value = '';
        setTypeError(true);
        return;
      }
      setTypeError(false);
      setPreview(URL.createObjectURL(file));
      setHasFile(true);
      onChange(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role={disabled ? 'presentation' : 'button'}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'border-2 border-dashed rounded-lg py-12 flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden',
        disabled
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
          : 'border-secondary cursor-pointer hover:bg-secondary/5',
        className
      )}
    >
      {preview && (
        <Image
          src={preview}
          alt="Preview"
          fill
          unoptimized
          className={cn('object-cover', disabled ? 'opacity-30 grayscale' : 'opacity-30')}
        />
      )}
      <div
        className={cn(
          'flex items-center gap-2 font-bold z-10',
          disabled ? 'text-gray-300' : 'text-secondary'
        )}
      >
        {disabled ? <FaLock size={24} /> : <FaImage size={24} />}
        <span>
          {disabled
            ? 'Carga de imagen bloqueada'
            : hasFile || existingImageUrl
              ? 'Cambiar imagen'
              : 'Añadir imagen'}
        </span>
      </div>
      {!disabled && (
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      )}
      {!disabled && (
        <p className="text-red-500 text-xs z-10 [text-shadow:0_0_4px_white,0_0_8px_white,0_0_12px_white]">
          {typeError && 'Formato no válido. Solo se aceptan: JPG, PNG, WebP, AVIF, HEIC, HEIF'}
        </p>
      )}
    </div>
  );
}
