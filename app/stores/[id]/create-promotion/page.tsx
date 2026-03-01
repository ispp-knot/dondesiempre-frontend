'use client';

import React, { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FaCalendarAlt,
  FaPlus,
  FaTimes,
  FaImage,
  FaCheckCircle,
  FaExclamationCircle,
} from 'react-icons/fa';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { createPromotion, PromotionCreationDTO } from '@/lib/api/promotionEndpoints';

interface Product {
  id: string;
  name: string;
  imageUrl: string;
}

export default function CreatePromotionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const storeId = params.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(20);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2026, 3, 12),
    to: new Date(2026, 3, 26),
  });
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [publishToInstagram, setPublishToInstagram] = useState(true);
  const [promotionImage, setPromotionImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPromotionImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiscountChange = (value: number[]) => {
    setDiscountPercentage(value[0]);
  };

  const handleDiscountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setDiscountPercentage(Math.min(100, Math.max(1, value)));
    } else if (e.target.value === '') {
      setDiscountPercentage(0);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setStatus(null);

    const dto: PromotionCreationDTO = {
      name,
      discountPercentage,
      isActive: true, // Assuming default active
      productIds: products.map((p) => p.id),
      storeId: storeId,
      description,
    };

    try {
      await createPromotion(dto);
      setStatus({ type: 'success', message: '¡Promoción creada con éxito!' });
      setTimeout(() => {
        router.push(`/storefront/${storeId}`);
      }, 2000);
    } catch (error) {
      console.error('Error creating promotion:', error);
      setStatus({ type: 'error', message: 'Error al crear la promoción. Inténtalo de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-quicksand text-primary pb-24 relative">
      <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
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
        <div className="relative border-2 border-secondary rounded-lg p-3 group">
          <label className="absolute -top-3 left-3 bg-white px-2 text-sm font-semibold text-primary">
            Nombre de la promoción*
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full outline-none text-lg text-dark-blue font-bold bg-transparent"
          />
        </div>

        {/* Discount Percentage */}
        <div className="relative border-2 border-secondary rounded-lg p-3 group flex flex-col gap-4">
          <label className="absolute -top-3 left-3 bg-white px-2 text-sm font-semibold text-primary z-10">
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
        <div className="relative border-2 border-secondary rounded-lg p-3 group">
          <label className="absolute -top-3 left-3 bg-white px-2 text-sm font-semibold text-primary z-10">
            Duración de la promoción*
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex justify-between items-center cursor-pointer w-full">
                <div className="text-lg text-dark-blue font-bold">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'dd/MM/yyyy')} -{' '}
                        {format(dateRange.to, 'dd/MM/yyyy')}
                      </>
                    ) : (
                      format(dateRange.from, 'dd/MM/yyyy')
                    )
                  ) : (
                    <span className="text-gray-400">Seleccionar fechas</span>
                  )}
                </div>
                <FaCalendarAlt className="text-secondary text-xl" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Description */}
        <div className="relative border-2 border-secondary rounded-lg p-3 group">
          <label className="absolute -top-3 left-3 bg-white px-2 text-sm font-semibold text-primary">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full outline-none text-lg text-dark-blue font-bold resize-none h-20 bg-transparent"
          />
        </div>

        {/* Products Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Artículos en promoción</h2>
            <button className="text-primary border-2 border-primary rounded-full p-0.5 cursor-pointer hover:bg-primary/10 transition-colors">
              <FaPlus size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-4 border-2 border-secondary rounded-lg p-2"
              >
                <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 text-secondary font-bold text-lg">{product.name}</div>
                <button
                  onClick={() => removeProduct(product.id)}
                  className="text-secondary cursor-pointer p-1 hover:text-dark-secondary transition-colors"
                >
                  <FaTimes size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Promotion Image */}
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">Imagen de la promoción</h2>
          <p className="text-secondary text-xs font-semibold">
            Se usará como imagen de fondo en el banner y stories
          </p>
          <div
            onClick={handleImageClick}
            className="border-2 border-dashed border-secondary rounded-lg py-12 flex flex-col items-center justify-center gap-2 mt-2 cursor-pointer hover:bg-secondary/5 transition-all relative overflow-hidden"
          >
            {promotionImage ? (
              <Image src={promotionImage} alt="Preview" fill className="object-cover opacity-30" />
            ) : null}
            <div className="flex items-center gap-2 text-secondary font-bold z-10">
              <FaImage size={24} />
              <span>{promotionImage ? 'Cambiar imagen' : 'Añadir imagen'}</span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Instagram Toggle */}
        <div className="flex items-center justify-between py-2">
          <span className="text-lg font-bold text-primary">Publicar en Instagram</span>
          <Switch
            checked={publishToInstagram}
            onCheckedChange={setPublishToInstagram}
            className="cursor-pointer data-[state=checked]:bg-primary"
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-secondary text-white font-bold py-8 rounded-lg text-xl mt-4 cursor-pointer hover:bg-dark-secondary transform transition active:scale-[0.98] w-full disabled:opacity-50"
        >
          {isLoading ? 'Lanzando...' : 'Lanzar promoción'}
        </Button>
      </div>

      <style jsx global>{`
        .font-quicksand {
          font-family: var(--font-quicksand), sans-serif;
        }
      `}</style>
    </div>
  );
}
