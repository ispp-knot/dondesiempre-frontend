'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPromotionById, updatePromotionDiscount } from '@/lib/api/promotionEndpoints';
import PromotionForm, { PromotionFormData } from '@/components/dondeSiempre/PromotionForm';

export default function EditPromotionPage() {
  const params = useParams<{ id: string; promoId: string }>();
  const router = useRouter();
  const storeId = params.id;
  const promoId = params.promoId;

  const [initialData, setInitialData] = useState<Partial<PromotionFormData> | null>(null);
  const [isLoadingFetch, setIsLoadingFetch] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const data = await getPromotionById(promoId);
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
      } catch (error) {
        console.error('Error fetching promotion:', error);
        setStatus({ type: 'error', message: 'No se pudo cargar la promoción.' });
      } finally {
        setIsLoadingFetch(false);
      }
    };

    fetchPromotion();
  }, [promoId]);

  const handleSubmit = async (formData: PromotionFormData) => {
    setIsSaving(true);
    setStatus(null);

    try {
      await updatePromotionDiscount(promoId, formData.discountPercentage);
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

  if (isLoadingFetch) {
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
