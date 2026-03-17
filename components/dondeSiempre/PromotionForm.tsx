'use client';

import React, { useState, useRef } from 'react';
import {
  FaCalendarAlt,
  FaPlus,
  FaTimes,
  FaImage,
  FaCheckCircle,
  FaExclamationCircle,
  FaLock,
} from 'react-icons/fa';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
}

export interface PromotionFormData {
  name: string;
  discountPercentage: number;
  description: string;
  products: Product[];
  dateRange?: DateRange;
  publishToInstagram: boolean;
  promotionImage: File | null;
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData?.name ?? '');
  const [discountPercentage, setDiscountPercentage] = useState<number>(
    initialData?.discountPercentage ?? 20
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(initialData?.dateRange);
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [products, setProducts] = useState<Product[]>(initialData?.products ?? []);
  const [publishToInstagram, setPublishToInstagram] = useState(
    initialData?.publishToInstagram ?? true
  );
  const [promotionImage, setPromotionImage] = useState<File | null>(
    initialData?.promotionImage ?? null
  );
  const [promotionImagePreview, setPromotionImagePreview] = useState<string | null>(
    initialData?.promotionImage ? URL.createObjectURL(initialData.promotionImage) : null
  );

  const handleDiscountChange = (value: number[]) => {
    setDiscountPercentage(value[0]);
  };

  const handleDiscountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value, 10);
    if (!Number.isNaN(value)) {
      setDiscountPercentage(Math.min(100, Math.max(1, value)));
    } else if (e.target.value === '') {
      setDiscountPercentage(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPromotionImage(file);
      setPromotionImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageClick = () => {
    if (!isEditMode) {
      fileInputRef.current?.click();
    }
  };

  const handleImageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleImageClick();
    }
  };

  const removeProduct = (id: string) => {
    if (!isEditMode) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      discountPercentage,
      description,
      products,
      dateRange,
      publishToInstagram,
      promotionImage,
    });
  };

  const dateDisplay = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
      : format(dateRange.from, 'dd/MM/yyyy')
    : isEditMode
      ? 'Fechas no disponibles'
      : 'Selecciona el rango de fechas';

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-6 max-w-md mx-auto w-full">
      <h1 className="text-2xl font-bold mb-2">
        {isEditMode ? 'Editar Promoción' : 'Nueva Promoción'}
      </h1>

      {/* Status Messages */}
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

      {/* Promotion Name */}
      <div
        className={cn(
          'relative border-2 rounded-lg p-3 transition-colors',
          isEditMode
            ? 'border-gray-200 bg-gray-50 opacity-80'
            : 'border-secondary group-focus-within:border-dark-secondary'
        )}
      >
        <label
          htmlFor="promo-name"
          className={cn(
            'absolute -top-3 left-3 bg-white px-2 text-sm font-semibold flex items-center gap-1',
            isEditMode ? 'text-gray-400' : 'text-primary'
          )}
        >
          {isEditMode && <FaLock size={10} />} Nombre de la promoción
        </label>
        <input
          id="promo-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          readOnly={isEditMode}
          className={cn(
            'w-full outline-none text-lg font-bold bg-transparent',
            isEditMode
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-primary placeholder:text-gray-300'
          )}
          placeholder={isEditMode ? '' : 'Ej. Rebajas de Verano'}
        />
      </div>

      {/* Discount Percentage */}
      <div className="relative border-2 border-secondary rounded-lg p-3 group flex flex-col gap-4">
        <label
          htmlFor="promo-discount-input"
          className="absolute -top-3 left-3 bg-white px-2 text-sm font-semibold text-primary z-10"
        >
          Porcentaje de descuento*
        </label>
        <div className="flex items-center gap-4 mt-2">
          <Slider
            value={[discountPercentage]}
            onValueChange={handleDiscountChange}
            max={100}
            min={1}
            step={1}
            className="flex-1 cursor-pointer"
          />
          <div className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1 min-w-[60px]">
            <input
              id="promo-discount-input"
              type="number"
              value={discountPercentage || ''}
              onChange={handleDiscountInputChange}
              className="w-8 outline-none text-lg text-dark-blue font-bold bg-transparent text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-secondary font-bold">%</span>
          </div>
        </div>
      </div>

      {/* Duration */}
      <div
        className={cn(
          'relative border-2 rounded-lg p-3 transition-colors',
          isEditMode ? 'border-gray-200 bg-gray-50 opacity-80' : 'border-secondary'
        )}
      >
        <label
          className={cn(
            'absolute -top-3 left-3 bg-white px-2 text-sm font-semibold flex items-center gap-1',
            isEditMode ? 'text-gray-400' : 'text-primary'
          )}
        >
          {isEditMode && <FaLock size={10} />} Duración de la promoción
        </label>

        {isEditMode ? (
          <div className="flex justify-between items-center w-full cursor-not-allowed">
            <div className="text-lg text-gray-500 font-bold">{dateDisplay}</div>
            <FaCalendarAlt className="text-gray-300 text-xl" />
          </div>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex justify-between items-center w-full text-left outline-none">
                <div
                  className={cn('text-lg font-bold', dateRange ? 'text-primary' : 'text-gray-300')}
                >
                  {dateDisplay}
                </div>
                <FaCalendarAlt className="text-secondary text-xl" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Description */}
      <div
        className={cn(
          'relative border-2 rounded-lg p-3 transition-colors',
          isEditMode ? 'border-gray-200 bg-gray-50 opacity-80' : 'border-secondary'
        )}
      >
        <label
          htmlFor="promo-description"
          className={cn(
            'absolute -top-3 left-3 bg-white px-2 text-sm font-semibold flex items-center gap-1',
            isEditMode ? 'text-gray-400' : 'text-primary'
          )}
        >
          {isEditMode && <FaLock size={10} />} Descripción
        </label>
        <textarea
          id="promo-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          readOnly={isEditMode}
          placeholder={isEditMode ? '' : 'Escribe una breve descripción de la promoción...'}
          className={cn(
            'w-full outline-none text-lg font-bold resize-none h-20 bg-transparent',
            isEditMode
              ? 'text-gray-500 cursor-not-allowed'
              : 'text-primary placeholder:text-gray-300'
          )}
        />
      </div>

      {/* Products Section */}
      <div className={cn('flex flex-col gap-4', isEditMode && 'opacity-80')}>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Artículos en promoción {isEditMode && <FaLock size={14} className="text-gray-400" />}
          </h2>
        </div>

        {!isEditMode && (
          <button className="flex items-center gap-2 text-secondary font-bold text-lg hover:text-dark-secondary transition-colors w-fit">
            <FaPlus /> Añadir artículos
          </button>
        )}

        <div className="flex flex-col gap-3">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className={cn(
                  'flex items-center gap-4 border-2 rounded-lg p-2 transition-colors',
                  isEditMode ? 'border-gray-100 bg-gray-50' : 'border-secondary'
                )}
              >
                <div
                  className={cn(
                    'relative w-16 h-16 rounded overflow-hidden flex-shrink-0',
                    isEditMode && 'grayscale'
                  )}
                >
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                </div>
                <div
                  className={cn(
                    'flex-1 font-bold text-lg',
                    isEditMode ? 'text-gray-400' : 'text-secondary'
                  )}
                >
                  {product.name}
                </div>
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="p-2 text-secondary hover:text-destructive transition-colors"
                  >
                    <FaTimes size={18} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic">
              {isEditMode
                ? 'No hay productos seleccionados o no se pudieron cargar.'
                : 'No hay productos seleccionados.'}
            </p>
          )}
        </div>
      </div>

      {/* Promotion Image */}
      <div className={cn('flex flex-col gap-1', isEditMode && 'opacity-60')}>
        <h2 className="text-xl font-bold flex items-center gap-2">
          Imagen de la promoción {isEditMode && <FaLock size={14} className="text-gray-400" />}
        </h2>
        {!isEditMode && (
          <p className="text-secondary text-xs font-semibold">
            Se usará como imagen de fondo en el banner y stories
          </p>
        )}
        <div
          role={isEditMode ? 'presentation' : 'button'}
          tabIndex={isEditMode ? -1 : 0}
          onClick={handleImageClick}
          onKeyDown={handleImageKeyDown}
          className={cn(
            'border-2 border-dashed rounded-lg py-12 flex flex-col items-center justify-center gap-2 mt-2 transition-all relative overflow-hidden',
            isEditMode
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-secondary cursor-pointer hover:bg-secondary/5'
          )}
        >
          {promotionImagePreview ? (
            <Image
              src={promotionImagePreview}
              alt="Preview"
              fill
              className={cn('object-cover', isEditMode ? 'opacity-30 grayscale' : 'opacity-30')}
            />
          ) : null}
          <div
            className={cn(
              'flex items-center gap-2 font-bold z-10',
              isEditMode ? 'text-gray-300' : 'text-secondary'
            )}
          >
            <FaImage size={24} />
            <span>
              {isEditMode
                ? 'Carga de imagen bloqueada'
                : promotionImagePreview
                  ? 'Cambiar imagen'
                  : 'Añadir imagen'}
            </span>
          </div>
          {!isEditMode && (
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          )}
        </div>
      </div>

      {/* Instagram Toggle */}
      <div className={cn('flex items-center justify-between py-2', isEditMode && 'opacity-60')}>
        <span
          className={cn(
            'text-lg font-bold flex items-center gap-2',
            isEditMode ? 'text-gray-400' : 'text-primary'
          )}
        >
          Publicar en Instagram {isEditMode && <FaLock size={14} />}
        </span>
        <Switch
          checked={publishToInstagram}
          onCheckedChange={isEditMode ? undefined : setPublishToInstagram}
          disabled={isEditMode}
          className={cn(
            isEditMode ? 'cursor-not-allowed data-[state=checked]:bg-gray-300' : 'cursor-pointer'
          )}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading || (isEditMode && status?.type === 'success')}
        className="bg-secondary text-white font-bold py-8 rounded-lg text-xl mt-4 cursor-pointer hover:bg-dark-secondary transform transition active:scale-[0.98] w-full disabled:opacity-50"
      >
        {isLoading
          ? isEditMode
            ? 'Guardando...'
            : 'Lanzando...'
          : isEditMode
            ? 'Guardar cambios'
            : 'Lanzar promoción'}
      </Button>
    </form>
  );
}
