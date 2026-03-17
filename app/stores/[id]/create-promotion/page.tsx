'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPromotion } from '@/lib/api/promotionEndpoints';
import PromotionForm, { PromotionFormData } from '@/components/dondeSiempre/PromotionForm';

export default function CreatePromotionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const storeId = params.id;

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (formData: PromotionFormData) => {
    setIsLoading(true);
    setStatus(null);

    const dto = {
      name: formData.name,
      discountPercentage: formData.discountPercentage,
      active: true,
      startDate: formData.startDate || new Date().toISOString(),
      endDate: formData.endDate || new Date().toISOString(),
      productIds: formData.products.map((p) => p.id),
      storeId: storeId,
      description: formData.description,
    };

    try {
      await createPromotion(dto);
      setStatus({ type: 'success', message: '¡Promoción lanzada con éxito!' });
      setTimeout(() => {
        router.push(`/stores/${storeId}`);
      }, 2000);
    } catch (error) {
      console.error('Error creating promotion:', error);
      setStatus({ type: 'error', message: 'Error al crear la promoción. Verifica los datos.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 font-quicksand text-primary pb-24 relative">
      <PromotionForm onSubmit={handleSubmit} isLoading={isLoading} status={status} />

      <style jsx global>{`
        .font-quicksand {
          font-family: var(--font-quicksand), sans-serif;
        }
      `}</style>
    </div>
  );
}
