'use client';

import 'dotenv/config';
import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus, FaTimes, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import ImageUpload from '@/components/dondeSiempre/ImageUpload';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useParams } from 'next/navigation';
import { authorizedOfetch } from '@/lib/api/authorizedOfetch';
import { cn } from '@/lib/utils';
import { getBackendUrl } from '@/lib/config';

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
  isActive: boolean;
  endDate: string | null;
  startDate: string | null;
  publishToInstagram: boolean;
  promotionImage: File | null;
  existingImageUrl?: string;
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
  const [name, setName] = useState(initialData?.name ?? '');
  const [discountPercentage, setDiscountPercentage] = useState<number>(
    initialData?.discountPercentage ?? 20
  );
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    initialData?.startDate || initialData?.endDate
      ? {
          from: initialData.startDate ? new Date(initialData.startDate) : undefined,
          to: initialData.endDate ? new Date(initialData.endDate) : undefined,
        }
      : undefined
  );
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [products, setProducts] = useState<Product[]>(initialData?.products ?? []);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [publishToInstagram] = useState(initialData?.publishToInstagram ?? true);
  const [promotionImage, setPromotionImage] = useState<File | null>(
    initialData?.promotionImage ?? null
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

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedData = {
      name,
      discountPercentage,
      description,
      isActive,
      promotionImage,
      publishToInstagram,
      products,
      startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
      endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
    };
    onSubmit(formattedData);
  };

  const dateDisplay = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}`
      : format(dateRange.from, 'dd/MM/yyyy')
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
      <div className="relative border-2 border-secondary group-focus-within:border-dark-secondary rounded-lg p-3 transition-colors">
        <label
          htmlFor="promo-name"
          className="absolute -top-3 left-3 bg-white px-2 text-sm font-semibold flex items-center gap-1 text-primary"
        >
          Nombre de la promoción
        </label>
        <input
          id="promo-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full outline-none text-lg font-bold bg-transparent text-primary placeholder:text-gray-300"
          placeholder="Ej. Rebajas de Verano"
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
      <div className="relative border-2 border-secondary rounded-lg p-3 transition-colors">
        <label className="absolute -top-3 left-3 bg-white px-2 text-sm font-semibold flex items-center gap-1 text-primary">
          Duración de la promoción
        </label>

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
      </div>

      {/* Description */}
      <div className="relative border-2 border-secondary rounded-lg p-3 transition-colors">
        <label
          htmlFor="promo-description"
          className="absolute -top-3 left-3 bg-white px-2 text-sm font-semibold flex items-center gap-1 text-primary"
        >
          Descripción
        </label>
        <textarea
          id="promo-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Escribe una breve descripción de la promoción..."
          className="w-full outline-none text-lg font-bold resize-none h-20 bg-transparent text-primary placeholder:text-gray-300"
        />
      </div>

      {/* Products Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold flex items-center gap-2">Artículos en promoción</h2>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 text-secondary font-bold text-lg hover:text-dark-secondary transition-colors w-fit p-2 border-2 border-secondary rounded-md"
              onClick={() => console.log('Popover Trigger Clicked')}
            >
              <FaPlus /> Añadir artículos
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 z-[100]" align="start">
            <ProductSelector
              onSelect={(product) => {
                if (!products.some((p) => p.id === product.id)) {
                  setProducts([...products, product]);
                }
              }}
              excludeIds={products.map((p) => p.id)}
            />
          </PopoverContent>
        </Popover>

        <div className="flex flex-col gap-3">
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className={cn(
                  'flex items-center gap-4 border-2 rounded-lg p-2 transition-colors border-secondary'
                )}
              >
                <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 font-bold text-lg text-secondary">{product.name}</div>
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="p-2 text-secondary hover:text-destructive transition-colors"
                >
                  <FaTimes size={18} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic">No hay productos seleccionados.</p>
          )}
        </div>
      </div>

      {/* Promotion Image */}
      <div className={cn('flex flex-col gap-1', isEditMode && 'opacity-60')}>
        <h2 className="text-xl font-bold flex items-center gap-2">Imagen de la promoción</h2>
        {!isEditMode && (
          <p className="text-secondary text-xs font-semibold">
            Se usará como imagen de fondo en el banner y stories
          </p>
        )}
        <ImageUpload
          onChange={setPromotionImage}
          existingImageUrl={initialData?.existingImageUrl}
          className="mt-2"
        />
      </div>

      {/* Instagram Toggle */}
      <div className="flex items-center justify-between py-2">
        <span className="text-lg font-bold flex items-center gap-2 text-primary">Activa</span>
        <Switch
          checked={isActive}
          onCheckedChange={setIsActive}
          className="cursor-pointer data-[state=unchecked]:bg-gray-300"
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
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

        console.log(response);
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
