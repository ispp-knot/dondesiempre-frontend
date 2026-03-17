'use client';

import PromotionForm, { PromotionFormData } from '@/components/dondeSiempre/PromotionForm';
import { usePassiveFetcher, useActiveFetcher } from '@/lib/api/fetcher';
import { PromotionDTO } from '@/lib/types/promotions/promotionsDto';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditPromotionPage() {
  const params = useParams<{ id: string; promoId: string }>();
  const router = useRouter();
  const storeId = params.id;
  const promoId = params.promoId;

  const [initialData, setInitialData] = useState<Partial<PromotionFormData> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const promotion = usePassiveFetcher<PromotionDTO>({ url: `promotions/${promoId}` });
  const updatePromotion = useActiveFetcher<PromotionDTO>({ method: 'PUT' });

  useEffect(() => {
    if (promotion.data) {
      const data = promotion.data;
      setInitialData({
        name: data.name,
        discountPercentage: data.discountPercentage,
        description: data.description || '',
        products:
          data.productIds && data.productIds.length > 0
            ? data.productIds.map((id) => ({
                id,
                name: `Producto ${id.substring(0, 4)}`,
                imageUrl: '/static/img/outfit_placeholder.jpg',
              }))
            : [],
      });
    } else if (promotion.isError) {
      console.error('Error fetching promotion:', promotion.error);
      setStatus({ type: 'error', message: 'No se pudo cargar la promoción.' });
    }
  }, [promotion.data, promotion.isError, promotion.error]);

  const handleSubmit = async (formData: PromotionFormData) => {
    setIsSaving(true);
    setStatus(null);

    const dto = {
      name: formData.name,
      discountPercentage: formData.discountPercentage,
      isActive: true,
      productIds: formData.products.map((p) => p.id),
      description: formData.description,
    };

    try {
      await updatePromotion.fetch({
        url: `promotions/${promoId}`,
        formPayload: {
          dto: new Blob([JSON.stringify(dto)], { type: 'application/json' }),
          image: formData.promotionImage ?? undefined,
        },
      });
      setStatus({ type: 'success', message: '¡Promoción actualizada con éxito!' });
      setTimeout(() => {
        //TODO: no se que es esto y pq manda a storefront, storefront en teoria no existe
        router.push(`/storefront/${storeId}`);
      }, 2000);
    } catch (error) {
      console.error('Error updating promotion:', error);
      setStatus({ type: 'error', message: 'Error al actualizar la promoción.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (promotion.isLoading) {
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
      <PromotionForm
        initialData={initialData ?? undefined}
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
