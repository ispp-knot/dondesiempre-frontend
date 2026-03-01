'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaCalendarAlt, FaImage, FaCheckCircle, FaExclamationCircle, FaLock } from 'react-icons/fa';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { getPromotionById, updatePromotionDiscount } from '@/lib/api/promotionEndpoints';

interface Product {
  id: string;
  name: string;
  imageUrl: string;
}

export default function EditPromotionPage() {
  const params = useParams<{ id: string; promoId: string }>();
  const router = useRouter();
  const storeId = params.id;
  const promoId = params.promoId;

  const [name, setName] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [dateRange] = useState<DateRange | undefined>(undefined);
  const [description, setDescription] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [publishToInstagram] = useState(false);
  const [promotionImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const data = await getPromotionById(promoId);
        setName(data.name);
        setDiscountPercentage(data.discountPercentage);
        setDescription(data.description || '');
        // Note: Dates and Products would need additional fetching if full info isn't in DTO
        // For now using mock/placeholders for read-only display if IDs exist
        if (data.productIds && data.productIds.length > 0) {
          setProducts(
            data.productIds.map((id) => ({
              id,
              name: `Producto ${id.substring(0, 4)}`,
              imageUrl: '/static/img/outfit_placeholder.jpg',
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching promotion:', error);
        setStatus({ type: 'error', message: 'No se pudo cargar la promoción.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotion();
  }, [promoId]);

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
    setIsSaving(true);
    setStatus(null);

    try {
      await updatePromotionDiscount(promoId, discountPercentage);
      setStatus({ type: 'success', message: '¡Promoción actualizada con éxito!' });
      setTimeout(() => {
        router.push(`/storefront/${storeId}`);
      }, 2000);
    } catch (error) {
      console.error('Error updating promotion:', error);
      setStatus({ type: 'error', message: 'Error al actualizar la promoción.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white font-quicksand text-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-lg">Cargando promoción...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-quicksand text-primary pb-24 relative">
      <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold mb-2">Editar Promoción</h1>

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

        {/* Promotion Name - READ ONLY */}
        <div className="relative border-2 border-gray-200 rounded-lg p-3 bg-gray-50 opacity-80">
          <label className="absolute -top-3 left-3 bg-white px-2 text-sm font-semibold text-gray-400 flex items-center gap-1">
            <FaLock size={10} /> Nombre de la promoción
          </label>
          <input
            type="text"
            value={name}
            readOnly
            className="w-full outline-none text-lg text-gray-500 font-bold bg-transparent cursor-not-allowed"
          />
        </div>

        {/* Discount Percentage - EDITABLE */}
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

        {/* Duration - READ ONLY */}
        <div className="relative border-2 border-gray-200 rounded-lg p-3 bg-gray-50 opacity-80">
          <label className="absolute -top-3 left-3 bg-white px-2 text-sm font-semibold text-gray-400 flex items-center gap-1">
            <FaLock size={10} /> Duración de la promoción
          </label>
          <div className="flex justify-between items-center w-full cursor-not-allowed">
            <div className="text-lg text-gray-500 font-bold">
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                  </>
                ) : (
                  format(dateRange.from, 'dd/MM/yyyy')
                )
              ) : (
                <span>Fechas no disponibles</span>
              )}
            </div>
            <FaCalendarAlt className="text-gray-300 text-xl" />
          </div>
        </div>

        {/* Description - READ ONLY */}
        <div className="relative border-2 border-gray-200 rounded-lg p-3 bg-gray-50 opacity-80">
          <label className="absolute -top-3 left-3 bg-white px-2 text-sm font-semibold text-gray-400 flex items-center gap-1">
            <FaLock size={10} /> Descripción
          </label>
          <textarea
            value={description}
            readOnly
            className="w-full outline-none text-lg text-gray-500 font-bold resize-none h-20 bg-transparent cursor-not-allowed"
          />
        </div>

        {/* Products Section - READ ONLY */}
        <div className="flex flex-col gap-4 opacity-80">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Artículos en promoción <FaLock size={14} className="text-gray-400" />
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 border-2 border-gray-100 rounded-lg p-2 bg-gray-50"
                >
                  <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 grayscale">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 text-gray-400 font-bold text-lg">{product.name}</div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic">
                No hay productos seleccionados o no se pudieron cargar.
              </p>
            )}
          </div>
        </div>

        {/* Promotion Image - READ ONLY */}
        <div className="flex flex-col gap-1 opacity-60">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Imagen de la promoción <FaLock size={14} className="text-gray-400" />
          </h2>
          <div className="border-2 border-dashed border-gray-200 rounded-lg py-12 flex flex-col items-center justify-center gap-2 mt-2 bg-gray-50 cursor-not-allowed relative overflow-hidden">
            {promotionImage ? (
              <Image
                src={promotionImage}
                alt="Preview"
                fill
                className="object-cover opacity-30 grayscale"
              />
            ) : null}
            <div className="flex items-center gap-2 text-gray-300 font-bold z-10">
              <FaImage size={24} />
              <span>Carga de imagen bloqueada</span>
            </div>
          </div>
        </div>

        {/* Instagram Toggle - READ ONLY */}
        <div className="flex items-center justify-between py-2 opacity-60">
          <span className="text-lg font-bold text-gray-400 flex items-center gap-2">
            Publicar en Instagram <FaLock size={14} />
          </span>
          <Switch
            checked={publishToInstagram}
            disabled
            className="cursor-not-allowed data-[state=checked]:bg-gray-300"
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-secondary text-white font-bold py-8 rounded-lg text-xl mt-4 cursor-pointer hover:bg-dark-secondary transform transition active:scale-[0.98] w-full disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar cambios'}
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
