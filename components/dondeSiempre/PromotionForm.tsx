'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FaCalendarAlt, FaPlus, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import Image from 'next/image';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';

// UI Components
import ImageUpload from '@/components/dondeSiempre/ImageUpload';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

// Utils
import { authorizedOfetch } from '@/lib/api/authorizedOfetch';
import { cn } from '@/lib/utils';
import { getBackendUrl } from '@/lib/config';
import { DateRange } from 'react-day-picker';
import { BackButton } from './BackButton';
import { MAX_DISCOUNT, MIN_DISCOUNT } from '@/lib/types/products/productsRules';

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string(),
});

export type Product = z.infer<typeof productSchema>;
// 1. Definición del Esquema de Validación con Zod
const promotionSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(255, 'El nombre de ser como máximo de 255 caracteres'),
  discountPercentage: z
    .preprocess(
      (val) => (val === '' || val === null ? 0 : val),
      z
        .number({
          error: 'El descuento debe ser un número válido.',
        })
        .min(MIN_DISCOUNT, `El descuento no puede ser menor a ${MIN_DISCOUNT}%.`)
        .max(MAX_DISCOUNT, `El descuento no puede ser mayor a ${MAX_DISCOUNT}%.`)
        .multipleOf(1, 'El descuento debe ser un número entero.')
        .nullable()
    )
    .optional(),
  description: z.string().max(255, 'El nombre de ser como máximo de 255 caracteres'),
  products: z.array(productSchema).min(1, 'Selecciona al menos un producto'),
  isActive: z.boolean(),
  // Para objetos anidados, validamos los campos internos
  dateRange: z
    .object({
      from: z.date({ error: 'Fecha de inicio requerida' }),
      to: z.date({ error: 'Fecha de fin requerida' }),
    })
    .refine((data) => data.from && data.to, {
      message: 'El rango de fechas es obligatorio',
    })
    .refine((data) => !data.from || !data.to || data.from < data.to, {
      message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    })
    .refine((data) => !data.to || data.to.getTime() >= Date.now(), {
      message: 'La fecha de finalización debe de ser posterior o igual a la fecha actual',
    }),
  // Para la imagen, validamos que no sea null
  promotionImage: z.any().nullable().optional(),
});

export type PromotionFormData = z.infer<typeof promotionSchema>;

interface PromotionFormProps {
  initialData?: Partial<PromotionFormData>;
  onSubmit: (data: PromotionFormData) => Promise<void>;
  isEditMode?: boolean;
  isLoading?: boolean;
  status: { type: 'success' | 'error'; message: string } | null;
}

export default function PromotionForm({
  initialData,
  onSubmit,
  isEditMode = false,
  isLoading = false,
  status,
}: PromotionFormProps) {
  // 2. Inicialización de React Hook Form
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      discountPercentage: initialData?.discountPercentage ?? 20,
      description: initialData?.description ?? '',
      products: initialData?.products ?? [],
      isActive: initialData?.isActive ?? true,
      dateRange: {
        from: initialData?.dateRange?.from ? new Date(initialData.dateRange.from) : undefined,
        to: initialData?.dateRange?.to ? new Date(initialData.dateRange.to) : undefined,
      },
      promotionImage: initialData?.promotionImage ? initialData.promotionImage : undefined,
    },
  });

  const [isPending, setPending] = useState<boolean>(false);
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const selectedProducts =
    useWatch({
      control,
      name: 'products',
    }) || [];

  const dateRange = useWatch({
    control,
    name: 'dateRange',
  });

  const onFormSubmit = async (data: PromotionFormData) => {
    if (isLoading || isSubmitting) return;
    setPending(true);
    // Formateamos las fechas al formato que espera tu API antes de enviar
    const formattedData = {
      ...data,
      startDate: data.dateRange.from ? format(data.dateRange.from, 'yyyy-MM-dd') : null,
      endDate: data.dateRange.to ? format(data.dateRange.to, 'yyyy-MM-dd') : null,
    };

    try {
      await onSubmit(formattedData);
    } finally {
      setPending(false);
    }
  };

  const removeProduct = (id: string) => {
    setValue(
      'products',
      selectedProducts.filter((p) => p.id !== id)
    );
  };

  const dateDisplay = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
      : format(dateRange.from, 'dd/MM/yyyy')
    : 'Selecciona el rango de fechas';

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="flex flex-col gap-6 max-w-md mx-auto w-full"
    >
      <BackButton
        variant="ghost"
        onAction={() => router.push(`/stores/${params.id}/promotions/manage`)}
      />
      <h1 className="text-2xl font-bold mb-2">
        {isEditMode ? 'Editar Promoción' : 'Nueva Promoción'}
      </h1>

      {/* Promotion Name */}
      <div
        className="relative border-2 border-secondary rounded-lg p-3"
        data-testid="promotion-name-input"
      >
        <label className="absolute -top-3 left-3 bg-white px-2 text-sm font-semibold text-primary">
          Nombre de la promoción
        </label>
        <input
          {...register('name')}
          className="w-full outline-none text-lg font-bold bg-transparent text-primary"
          placeholder="Ej. Rebajas de Verano"
        />
        {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div
        className="relative border-2 border-secondary rounded-lg p-3 flex flex-col gap-4"
        data-testid="promotion-discount-input"
      >
        <label className="absolute -top-3 left-3 bg-white px-2 text-sm font-semibold text-primary">
          Porcentaje de descuento*
        </label>
        <div className="flex items-center gap-4 mt-2">
          <Controller
            control={control}
            name="discountPercentage"
            render={({ field }) => (
              <>
                <Slider
                  value={[field.value]}
                  onValueChange={(val) => field.onChange(val[0])}
                  max={100}
                  min={1}
                  step={1}
                  className="flex-1 cursor-pointer"
                />
                <div className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1 min-w-[60px]">
                  <input
                    type="number"
                    value={field.value}
                    max={100}
                    min={1}
                    step={1}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    onKeyDown={(e) => {
                      if (e.key === '.' || e.key === ',') {
                        e.preventDefault();
                      }
                    }}
                    className="w-10 outline-none text-lg text-dark-blue font-bold bg-transparent text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-secondary font-bold">%</span>
                </div>
              </>
            )}
          />
        </div>
        {errors.discountPercentage && (
          <p className="text-destructive text-xs">{errors.discountPercentage.message}</p>
        )}
      </div>

      <div
        className={cn(
          'relative border-2 rounded-lg p-3 transition-colors',
          errors.dateRange ? 'border-destructive' : 'border-secondary'
        )}
        data-testid="promotion-duration-input"
      >
        <label className="absolute -top-3 left-3 bg-white px-2 text-sm font-semibold text-primary">
          Duración de la promoción
        </label>
        <Controller
          control={control}
          name="dateRange"
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex justify-between items-center w-full text-left outline-none"
                >
                  <div
                    className={cn(
                      'text-lg font-bold',
                      field.value?.from ? 'text-primary' : 'text-gray-300'
                    )}
                  >
                    {dateDisplay}
                  </div>
                  <FaCalendarAlt
                    className={cn(
                      'text-xl',
                      errors.dateRange ? 'text-destructive' : 'text-secondary'
                    )}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={field.value as DateRange | undefined}
                  onSelect={field.onChange}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {errors.dateRange && (
          <p className="text-destructive text-xs mt-1">{errors.dateRange.message}</p>
        )}
      </div>

      {/* Description */}
      <div
        className="relative border-2 border-secondary rounded-lg p-3"
        data-testid="promotion-description-input"
      >
        <label className="absolute -top-3 left-3 bg-white px-2 text-sm font-semibold text-primary">
          Descripción
        </label>
        <textarea
          {...register('description')}
          placeholder="Escribe una descripción..."
          className="w-full outline-none text-lg font-bold resize-none h-20 bg-transparent text-primary"
        />
        {errors.description && (
          <p className="text-destructive text-xs mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Products Section */}
      <div className="flex flex-col gap-4" data-testid="promotion-products-input">
        <h2 className="text-xl font-bold">Artículos en promoción</h2>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 text-secondary font-bold text-lg p-2 border-2 border-secondary rounded-md w-fit"
            >
              <FaPlus /> Añadir artículos
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 z-[100]" align="start">
            <ProductSelector
              onSelect={(product) => {
                if (!selectedProducts.some((p) => p.id === product.id)) {
                  setValue('products', [...selectedProducts, product]);
                }
              }}
              excludeIds={selectedProducts.map((p) => p.id)}
            />
          </PopoverContent>
        </Popover>

        {errors.products && (
          <p className="text-destructive text-sm font-bold">{errors.products.message}</p>
        )}

        <div className="flex flex-col gap-3">
          {selectedProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 border-2 rounded-lg p-2 border-secondary"
            >
              <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              </div>
              <div className="flex-1 font-bold text-lg text-secondary">{product.name}</div>
              <button
                type="button"
                onClick={() => removeProduct(product.id)}
                className="p-2 text-secondary hover:text-destructive"
              >
                <FaTimes size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={cn('flex flex-col gap-1', isEditMode && 'opacity-60')}>
        <h2 className="text-xl font-bold">Imagen de la promoción</h2>
        <Controller
          control={control}
          name="promotionImage"
          render={({ field }) => (
            <ImageUpload
              onChange={field.onChange}
              data-testid="promotion-image-input"
              existingImageUrl={initialData?.promotionImage}
              className={cn('mt-2', errors.promotionImage ? 'border-destructive' : '')}
            />
          )}
        />
        {errors.promotionImage && (
          <p className="text-destructive text-xs mt-1">{errors.promotionImage.message as string}</p>
        )}
      </div>

      {/* Active Toggle */}
      {initialData !== undefined && (
        <div className="flex items-center justify-between py-2">
          <span className="text-lg font-bold text-primary">Activa</span>
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="cursor-pointer"
              />
            )}
          />
        </div>
      )}

      {status && (
        <div
          className={cn(
            'flex items-center gap-2 p-4 rounded-lg animate-in fade-in slide-in-from-top-2',
            status.type === 'success'
              ? 'bg-secondary/10 text-secondary border border-secondary'
              : 'bg-destructive/10 text-destructive border border-destructive'
          )}
        >
          {status.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          <span className="font-bold">{status.message}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending || isLoading}
        className="bg-secondary text-white font-bold py-8 rounded-lg text-xl mt-4 w-full"
        data-testid="promotion-confirm-input"
      >
        {isPending || isLoading
          ? 'Cargando...'
          : isEditMode
            ? 'Guardar cambios'
            : 'Lanzar promoción'}
      </Button>
    </form>
  );
}

function ProductSelector({
  onSelect,
  excludeIds,
}: {
  onSelect: (product: Product) => void;
  excludeIds: string[];
}) {
  const params = useParams<{ id: string }>();
  const [storeProducts, setStoreProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      if (!params?.id) return;
      setLoading(true);
      try {
        const response = await authorizedOfetch(
          `${getBackendUrl()}/api/v1/stores/${params.id}/products`
        );

        // Map backend response to Product interface
        const mapped: Product[] = response.map(
          (p: { id: string; name: string; image?: string }) => ({
            id: p.id,
            name: p.name,
            imageUrl: p.image || '/static/img/outfit_placeholder.jpg',
          })
        );

        setStoreProducts(mapped);
      } catch (err) {
        console.error('Error fetching store products:', err);
        setStoreProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [params?.id]);

  const filteredProducts = storeProducts.filter(
    (p) => !excludeIds.includes(p.id) && p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col max-h-[400px]">
      <div className="p-3 border-b">
        <input
          type="text"
          placeholder="Buscar producto..."
          className="w-full p-2 border rounded-md text-sm outline-none focus:border-secondary"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="text-center py-4 text-gray-400 text-sm animate-pulse">
            Cargando productos...
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="flex flex-col gap-1">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelect(p)}
                className="flex items-center gap-3 p-2 hover:bg-secondary/5 rounded-md transition-colors text-left group"
              >
                <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                  <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                </div>
                <div className="flex-1 text-sm font-semibold group-hover:text-secondary truncate">
                  {p.name}
                </div>
                <FaPlus
                  className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                  size={12}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm">
            {search ? 'No se encontraron productos' : 'No hay productos disponibles'}
          </div>
        )}
      </div>
    </div>
  );
}
