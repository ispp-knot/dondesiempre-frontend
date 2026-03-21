'use client';

import PromotionForm, { PromotionFormData } from '@/components/dondeSiempre/PromotionForm';
import { usePassiveFetcher, useActiveFetcher } from '@/lib/api/fetcher';
import { PromotionDTO } from '@/lib/types/promotions/promotionsDto';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function EditPromotionPage() {
  const params = useParams<{ id: string; promoId: string }>();
  const router = useRouter();
  const storeId = params.id;
  const promoId = params.promoId;

  const [initialData, setInitialData] = useState<Partial<PromotionFormData> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch de la promoción existente
  const {
    data: promoData,
    isLoading,
    isError,
  } = usePassiveFetcher<PromotionDTO>({
    url: `promotions/${promoId}`,
  });

  const updatePromotion = useActiveFetcher<void>({ method: 'PUT' });

  useEffect(() => {
    if (promoData) {
      setInitialData({
        name: promoData.name,
        discountPercentage: promoData.discountPercentage,
        description: promoData.description || '',
        isActive: promoData.active, // <--- Mapeamos 'active' de la API a 'isActive' del Form
        dateRange: {
          from: new Date(promoData.startDate),
          to: new Date(promoData.endDate),
        },
        products:
          promoData.products?.map((p) => ({
            id: p.id,
            name: p.name,
            // Usamos la imagen del producto o el placeholder
            imageUrl: p.image ?? '/static/img/outfit_placeholder.jpg',
          })) || [],
        // Pasamos la URL de la imagen actual para que ImageUpload la muestre
        promotionImage: promoData.promotionImageUrl,
      });
    }
  }, [promoData]);

  const handleSubmit = async (formData: PromotionFormData) => {
    setIsSaving(true);
    setStatus(null);

    // 1. Formateamos las fechas a string 'yyyy-MM-dd' para el backend
    // Usamos format de date-fns que ya tienes importado
    const startDateStr = format(formData.dateRange.from, 'yyyy-MM-dd');
    const endDateStr = format(formData.dateRange.to, 'yyyy-MM-dd');

    // 2. Construimos el DTO exacto que espera la API
    // No lo tipamos como PromotionFormData, sino como el objeto de envío
    const dto = {
      name: formData.name,
      discountPercentage: formData.discountPercentage,
      isActive: formData.isActive,
      productIds: formData.products.map((p) => p.id),
      storeId: storeId,
      description: formData.description,
      startDate: startDateStr,
      endDate: endDateStr,
    };

    try {
      await updatePromotion.fetch({
        url: `promotions/${promoId}`,
        formPayload: {
          // El JSON con los datos planos
          dto: new Blob([JSON.stringify(dto)], { type: 'application/json' }),

          // La imagen: solo si es un archivo nuevo (File)
          // Si es un string (URL vieja), enviamos undefined para que el backend no cambie nada
          image: formData.promotionImage instanceof File ? formData.promotionImage : undefined,
        },
      });

      setStatus({ type: 'success', message: '¡Promoción actualizada con éxito!' });

      setTimeout(() => {
        router.push(`/stores/${storeId}`);
      }, 2000);
    } catch (err) {
      console.error('Error updating promotion:', err);
      setStatus({ type: 'error', message: 'Error al actualizar la promoción.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !initialData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white font-quicksand text-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-lg">Cargando promoción...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <p className="text-destructive font-bold text-xl mb-4">No se pudo cargar la promoción</p>
        <button onClick={() => router.back()} className="text-secondary font-bold underline">
          Volver atrás
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-quicksand text-primary pb-24 relative">
      <PromotionForm
        key={promoId} // Forzamos remount si cambia la promo
        initialData={initialData}
        onSubmit={handleSubmit}
        isEditMode={true}
        isLoading={isSaving}
        status={status}
      />

      <style jsx global>{`
        .font-quicksand {
          font-family: var(--font-quicksand), sans-serif;
        }
      `}</style>
    </div>
  );
}
