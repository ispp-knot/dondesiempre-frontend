'use client';

import PromotionForm, { Product, PromotionFormData } from '@/components/dondeSiempre/PromotionForm';
import { useActiveFetcher } from '@/lib/api/fetcher';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreatePromotionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const storeId = params.id;

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Asumo que useActiveFetcher maneja el FormData internamente si recibe formPayload
  const createPromotion = useActiveFetcher<void>({ url: 'promotions', method: 'POST' });

  const handleSubmit = async (formData: PromotionFormData) => {
    if (isLoading) return;
    // Nota: Usamos 'any' o un tipo extendido aquí porque el Form ya formateó
    // las fechas a string (startDate/endDate) y eliminó el dateRange.
    setIsLoading(true);
    setStatus(null);

    // Mapeamos al DTO que espera tu Backend
    const dto = {
      name: formData.name,
      discountPercentage: formData.discountPercentage,
      active: formData.isActive,
      productIds: formData.products.map((p: Product) => p.id),
      storeId: storeId,
      description: formData.description,
      startDate: formData.dateRange.from,
      endDate: formData.dateRange.to,
    };

    try {
      await createPromotion.fetch({
        formPayload: {
          // Enviamos el JSON como un Blob para Multipart/Form-Data
          dto: new Blob([JSON.stringify(dto)], { type: 'application/json' }),
          // La imagen del formulario
          image: formData.promotionImage ?? undefined,
        },
      });

      setStatus({ type: 'success', message: '¡Promoción lanzada con éxito!' });

      // Pequeño delay para que el usuario vea el mensaje de éxito antes de redirigir
      router.push(`/stores/${storeId}`);
    } catch (error: unknown) {
      const fetchError = error as { status?: number; response?: { status?: number } };
      const statusCode = fetchError.status || fetchError.response?.status;

      if (statusCode === 413) {
        setStatus({
          type: 'error',
          message: 'La imagen es demasiado grande. Por favor, intenta con una que pese menos.',
        });
      } else {
        setStatus({
          type: 'error',
          message: 'Error al crear la promoción. Verifica los datos e intenta de nuevo.',
        });
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-quicksand text-primary pb-24 relative">
      {/* Pasamos los estados y la función de envío. 
          React Hook Form en el hijo se encargará de la validación 
          antes de que 'handleSubmit' sea siquiera ejecutado.
      */}
      <PromotionForm onSubmit={handleSubmit} isLoading={isLoading} status={status} />

      <style jsx global>{`
        .font-quicksand {
          font-family: var(--font-quicksand), sans-serif;
        }
      `}</style>
    </div>
  );
}
