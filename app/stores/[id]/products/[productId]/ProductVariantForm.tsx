'use client';

import React from 'react';
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
import { usePassiveFetcher } from '@/lib/api/fetcher';
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

  const colors = usePassiveFetcher<ProductColor[]>({
    url: 'product-colors',
    enabled: isOpen,
  });

  const handleFormSubmit = async (data: ProductVariantFormData) => {
    await onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Crear Nueva Variante
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
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
                  <div className="flex flex-wrap gap-2">
                    {sizes.data?.map((size) => (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => field.onChange(size.id)}
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
                )}
              />
            )}
            {errors.sizeId && (
              <p className="text-destructive text-sm">{errors.sizeId.message}</p>
            )}
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
                  <div className="flex flex-wrap gap-2">
                    {colors.data?.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => field.onChange(color.id)}
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
            {errors.colorId && (
              <p className="text-destructive text-sm">{errors.colorId.message}</p>
            )}
          </div>

          {/* Availability */}
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-primary">Disponibilidad</label>
            <Controller
              control={control}
              name="isAvailable"
              render={({ field }) => (
                <div className="flex items-center gap-2">
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
