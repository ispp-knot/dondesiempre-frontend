'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import ErrorText from '@/components/dondeSiempre/ErrorText';

const variantSchema = z.object({
  sizeId: z.string().min(1, 'Debes seleccionar una talla'),
  colorId: z.string().min(1, 'Debes seleccionar un color'),
  isAvailable: z.boolean(),
});

export type ProductVariantFormData = z.infer<typeof variantSchema>;

interface ProductVariantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductVariantFormData) => Promise<void>;
  isSubmitting: boolean;
  error?: string | null;
  onErrorClear?: () => void;
}

interface ProductSize {
  id: string;
  name: string;
}

interface ProductColor {
  id: string;
  name: string;
  hexCode: string;
}

export default function ProductVariantForm({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  onErrorClear,
}: ProductVariantFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductVariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      sizeId: '',
      colorId: '',
      isAvailable: true,
    },
  });

  const sizes = usePassiveFetcher<ProductSize[]>({
    url: 'product-sizes',
    enabled: isOpen,
  });

  const letterSizes = sizes.data?.filter((size) => isNaN(parseFloat(size.name)));
  const numericSizes = sizes.data?.filter((size) => !isNaN(parseFloat(size.name)));

  const createSize = useActiveFetcher<ProductSize>({
    url: 'product-sizes',
    method: 'POST',
  });

  const colors = usePassiveFetcher<ProductColor[]>({
    url: 'product-colors',
    enabled: isOpen,
  });

  const [numericSize, setNumericSize] = useState('');

  const handleClose = () => {
    reset();
    setNumericSize('');
    onErrorClear?.();
    onClose();
  };

  const handleFormSubmit = async (data: ProductVariantFormData) => {
    let resolvedSizeId = data.sizeId;

    if (numericSize) {
      const existing = numericSizes?.find((s) => parseFloat(s.name) === parseFloat(numericSize));
      if (existing) {
        resolvedSizeId = existing.id;
      } else {
        const created = await createSize.fetch({
          body: { size: numericSize },
        });
        resolvedSizeId = created.id;
      }
    }

    await onSubmit({ ...data, sizeId: resolvedSizeId });
    reset();
    setNumericSize('');
  };

  const handleFieldChange = () => {
    if (error) {
      onErrorClear?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" data-testid="dialog-variant">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary" data-testid="title-new-variant">
            Crear Nueva Variante
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
          {/* Error Message */}
          {error && <p className="text-destructive text-sm font-semibold">{error}</p>}

          {/* Size Selection */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-primary">Talla *</label>
            {sizes.isLoading ? (
              <LoadingText />
            ) : sizes.isError ? (
              <ErrorText error={sizes.error} />
            ) : (
              <Controller
                control={control}
                name="sizeId"
                render={({ field }) => (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2" data-testid="size-list">
                      {letterSizes?.map((size) => (
                        <button
                          key={size.id}
                          data-testid={`size-${size.name}`}
                          type="button"
                          onClick={() => {
                            field.onChange(size.id);
                            setNumericSize('');
                            handleFieldChange();
                          }}
                          className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm transition-colors ${
                            field.value === size.id
                              ? 'border-secondary bg-secondary text-white'
                              : 'border-gray-300 text-secondary hover:border-secondary'
                          }`}
                        >
                          {size.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground shrink-0">
                        O introduce una talla numérica:
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={numericSize}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNumericSize(val);
                          if (val) {
                            field.onChange('__numeric__');
                            handleFieldChange();
                          } else {
                            field.onChange('');
                          }
                        }}
                        placeholder="Ej. 42"
                        className="w-24 h-9 rounded-md border border-input px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  </div>
                )}
              />
            )}
            {errors.sizeId && <p className="text-destructive text-sm">{errors.sizeId.message}</p>}
          </div>

          {/* Color Selection */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-primary">Color *</label>
            {colors.isLoading ? (
              <LoadingText />
            ) : colors.isError ? (
              <ErrorText error={colors.error} />
            ) : (
              <Controller
                control={control}
                name="colorId"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2" data-testid="color-list">
                    {colors.data?.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        data-testid={`color-${color.name}`}
                        onClick={() => {
                          field.onChange(color.id);
                          handleFieldChange();
                        }}
                        title={color.name}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 font-semibold text-sm transition-colors ${
                          field.value === color.id
                            ? 'border-secondary bg-secondary/10'
                            : 'border-gray-300 hover:border-secondary'
                        }`}
                      >
                        <span
                          className="w-6 h-6 rounded-full border border-gray-300 shrink-0"
                          style={{ backgroundColor: color.hexCode }}
                        />
                        <span className="text-secondary">{color.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              />
            )}
            {errors.colorId && <p className="text-destructive text-sm">{errors.colorId.message}</p>}
          </div>

          {/* Availability */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-primary">Disponibilidad</label>
            <Controller
              control={control}
              name="isAvailable"
              render={({ field }) => (
                <div className="flex items-center gap-2" data-testid="data-disp">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="text-secondary">Disponible para la venta</span>
                </div>
              )}
            />
          </div>

          <DialogFooter className="mt-4">
            <Button
              data-testid="cancel-button"
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              data-testid="submit-button"
              disabled={isSubmitting}
              className="bg-secondary hover:bg-dark-secondary text-white font-bold"
            >
              {isSubmitting ? 'Creando...' : 'Crear Variante'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
