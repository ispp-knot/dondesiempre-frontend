'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPromotionById, updatePromotion } from '@/lib/api/promotionEndpoints';
import { authorizedOfetch } from '@/lib/api/authorizedOfetch';
import PromotionForm, { PromotionFormData } from '@/components/dondeSiempre/PromotionForm';
import { getBackendUrl } from '@/lib/config';

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
    const fetchPromotionAndProducts = async () => {
      try {
        // Fetch promotion and store details (to get storefront products) simultaneously
        const [promoData, storeData] = await Promise.all([
          getPromotionById(promoId),
          authorizedOfetch(`${getBackendUrl()}/api/v1/stores/${storeId}`),
        ]);

        const storefrontId = storeData.storefront?.id;
        let storeProducts: { id: string; name: string; imageUrl?: string }[] = [];

        if (storefrontId) {
          storeProducts = await authorizedOfetch(
            `${getBackendUrl()}/api/v1/storefronts/${storefrontId}/products`
          );
        }

        setInitialData({
          name: promoData.name,
          description: promoData.description || '',
          active: promoData.active,
          products:
            promoData.productIds && promoData.productIds.length > 0
              ? promoData.productIds.map((id) => {
                  const realProduct = storeProducts.find((p) => p.id === id);
                  return {
                    id,
                    name: realProduct?.name || `Producto ${id.substring(0, 4)}`,
                    imageUrl: realProduct?.imageUrl || '/static/img/outfit_placeholder.jpg',
                  };
                })
              : [],
        });
      } catch (error) {
        console.error('Error fetching promotion:', error);
        setStatus({ type: 'error', message: 'No se pudo cargar la promoción.' });
      } finally {
        setIsLoadingFetch(false);
      }
    };

    fetchPromotionAndProducts();
  }, [promoId, storeId]);

  const handleSubmit = async (formData: PromotionFormData) => {
    setIsSaving(true);
    setStatus(null);

    const dto = {
      name: formData.name,
      description: formData.description,
      discountPercentage: formData.discountPercentage,
      isActive: true,
      productIds: formData.products.map((p) => p.id),
    };

    try {
      await updatePromotion(promoId, dto);
      setStatus({ type: 'success', message: '¡Promoción actualizada con éxito!' });
      setTimeout(() => {
        router.push(`/stores/${storeId}`);
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
        key={promoId}
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
