'use client';

import PromotionForm, { PromotionFormData } from '@/components/dondeSiempre/PromotionForm';
import { usePassiveFetcher, useActiveFetcher } from '@/lib/api/fetcher';
import { PromotionDTO } from '@/lib/types/promotions/promotionsDto';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/auth/AuthContext';
import { GenericConfirmModal } from '@/components/modals/GenericConfirmModal';
import { BackButton } from '@/components/dondeSiempre/BackButton';

export default function EditPromotionPage() {
  const params = useParams<{ id: string; promoId: string }>();
  const router = useRouter();
  const storeId = params.id;
  const promoId = params.promoId;
  const { getCurrentUser } = useAuth();

  const [isDeleting, setIsDeleting] = useState(false);
  const [initialData, setInitialData] = useState<Partial<PromotionFormData> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // Fetch de la promoción existente
  const {
    data: promoData,
    isLoading,
    isError,
  } = usePassiveFetcher<PromotionDTO>({
    url: `promotions/${promoId}`,
  });
  const updatePromotion = useActiveFetcher<void>({ method: 'PUT' });
  const deletePromotion = useActiveFetcher<void>({ method: 'DELETE' });

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const handleDelete = async () => {
    setIsConfirmDeleteOpen(false);

    setIsDeleting(true);
    try {
      await deletePromotion.fetch({
        url: `promotions/${promoId}`,
      });

      setStatus({ type: 'success', message: 'Promoción eliminada correctamente.' });

      setTimeout(() => {
        router.push(`/stores/${storeId}`);
      }, 1500);
    } catch (err) {
      console.error('Error deleting promotion:', err);
      setStatus({ type: 'error', message: 'No se pudo eliminar la promoción.' });
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (!promoData) return;

    // 👇 Verificar que la tienda de la promo coincide con el parámetro de la URL
    // y que el usuario autenticado es dueño de esa tienda
    const promoStoreId = promoData.storeId; // ajusta según tu DTO
    const user = getCurrentUser();
    if (!user?.roles?.includes('STORE')) {
      setIsUnauthorized(true);
      return;
    } else if (promoStoreId !== user.store?.id) {
      setIsUnauthorized(true);
      return;
    }

    setInitialData({
      name: promoData.name,
      discountPercentage: promoData.discountPercentage,
      description: promoData.description || '',
      isActive: promoData.active,
      dateRange: {
        from: new Date(promoData.startDate),
        to: new Date(promoData.endDate),
      },
      products:
        promoData.products?.map((p) => ({
          id: p.id,
          name: p.name,
          imageUrl: p.image ?? '/static/img/outfit_placeholder.jpg',
        })) || [],
      promotionImage: promoData.promotionImageUrl,
    });
  }, [promoData, storeId, getCurrentUser]);

  // 👇 Redirigir si no tiene permisos
  useEffect(() => {
    if (isUnauthorized) {
      router.replace(`/stores/${storeId}`); // o a /unauthorized, según prefieras
    }
  }, [isUnauthorized, router, storeId]);

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
        router.push(`/stores/${storeId}/promotions/manage`);
      }, 2000);
    } catch (err: unknown) {
      const fetchError = err as { status?: number; response?: { status?: number } };
      const statusCode = fetchError.status || fetchError.response?.status;

      if (statusCode === 413) {
        setStatus({
          type: 'error',
          message: 'La imagen es demasiado grande. Por favor, intenta con una que pese menos.',
        });
      } else {
        setStatus({
          type: 'error',
          message: 'Error al actualizar la promoción. Verifica los datos e intenta de nuevo.',
        });
      }
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
      {isConfirmDeleteOpen && (
        <GenericConfirmModal
          message="¿Estás seguro de que deseas eliminar esta promoción? Esta acción no se puede deshacer."
          onConfirm={handleDelete}
          onClose={() => setIsConfirmDeleteOpen(false)}
          isLoading={isDeleting}
          confirmLabel="Eliminar"
        />
      )}
      <div className="flex flex-col items-center">
        <BackButton variant="ghost" />
        <PromotionForm
          key={promoId} // Forzamos remount si cambia la promo
          initialData={initialData}
          onSubmit={handleSubmit}
          isEditMode={true}
          isLoading={isSaving}
          status={status}
        />
      </div>
      <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
        <button
          onClick={() => setIsConfirmDeleteOpen(true)}
          disabled={isSaving || isDeleting}
          className={`px-6 py-2 rounded-full font-bold transition-colors ${
            isDeleting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-50 text-destructive border border-destructive hover:bg-destructive hover:text-white'
          }`}
        >
          {isDeleting ? 'Eliminando...' : 'Eliminar Promoción'}
        </button>
      </div>
      <style jsx global>{`
        .font-quicksand {
          font-family: var(--font-quicksand), sans-serif;
        }
      `}</style>
    </div>
  );
}
