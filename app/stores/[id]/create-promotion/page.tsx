'use client';

import PromotionForm, { PromotionFormData } from '@/components/dondeSiempre/PromotionForm';
import { useActiveFetcher } from '@/lib/api/fetcher';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreatePromotionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const storeId = params.id;

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const createPromotion = useActiveFetcher<void>({ url: 'promotions', method: 'POST' });

  const handleSubmit = async (formData: PromotionFormData) => {
    console.log('Form data received in CreatePromotionPage:', formData);
    setIsLoading(true);
    setStatus(null);

    const dto = {
      name: formData.name,
      discountPercentage: formData.discountPercentage,
      active: true,
      productIds: formData.products.map((p) => p.id),
      storeId: storeId,
      description: formData.description,
    };

    
    try {
      await createPromotion.fetch({
        formPayload: {
          dto: new Blob([JSON.stringify(dto)], { type: 'application/json' }),
          image: formData.promotionImage ?? undefined,
        },
      });
      setStatus({ type: 'success', message: '¡Promoción lanzada con éxito!' });
      router.push(`/stores/${storeId}`);
    } catch (error) {
      console.error('Error creating promotion:', error);
      setStatus({ type: 'error', message: `Error al crear la promoción. Verifica los datos.${dto}` });
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
