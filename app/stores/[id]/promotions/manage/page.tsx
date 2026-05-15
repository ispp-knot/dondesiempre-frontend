'use client';

import { usePassiveFetcher } from '@/lib/api/fetcher';
import { PromotionDTO } from '@/lib/types/promotions/promotionsDto';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Edit2, Image as ImageIcon, Calendar, Tag } from 'lucide-react';
import { ErrorView } from '@/components/dondeSiempre/ErrorView';
import { useAuth } from '@/lib/auth/AuthContext';
import { useEffect } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BackButton } from '@/components/dondeSiempre/BackButton';
import Loader from '@/components/dondeSiempre/Loader';

export default function ManagePromotionsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const storeId = params.id;

  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();

  const isOwner = !!user?.store?.id && user.store.id === storeId;

  const {
    data: promotions,
    isLoading,
    isError,
  } = usePassiveFetcher<PromotionDTO[]>({
    url: `stores/${storeId}/promotions`,
  });

  useEffect(() => {
    if (user !== undefined && !isOwner) {
      router.push(`/stores/${storeId}`);
    }
  }, [user, isOwner, router, storeId]);

  if (user === undefined || !isOwner) {
    return <Loader />;
  }

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <ErrorView
        title="Error de carga"
        description="No pudimos cargar tus promociones. Por favor, intenta de nuevo más tarde."
        buttonText="Volver a la tienda"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 font-quicksand pb-24">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <BackButton
              variant="ghost"
              text="Volver a mi tienda"
              onAction={() => router.push(`/stores/${params.id}`)}
            />
            <h1 className="text-3xl md:text-4xl font-black text-[var(--primary)]">
              Mis Promociones
            </h1>
            <p className="text-gray-500 mt-1">
              Gestiona tus ofertas activas y el historial de promociones.
            </p>
          </div>

          <button
            onClick={() => router.push(`/stores/${storeId}/promotions`)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--primary)] text-white rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg hover:shadow-xl shrink-0"
            data-testid="create-new-promotion-button"
          >
            <Plus className="w-5 h-5" /> Nueva Promoción
          </button>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="promotion-list"
        >
          {!promotions || promotions.length === 0 ? (
            <div
              className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm"
              data-testid="empty-promotion-list"
            >
              <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-4">
                <Tag className="w-10 h-10 text-[var(--primary)]" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Sin promociones</h3>
              <p className="text-gray-500 text-center max-w-sm mb-6">
                Aún no has creado ninguna promoción. Anímate a lanzar tu primera oferta para atraer
                más clientes.
              </p>
              <button
                onClick={() => router.push(`/stores/${storeId}/promotions`)}
                className="text-[var(--primary)] font-bold hover:underline"
              >
                Crear mi primera promoción &rarr;
              </button>
            </div>
          ) : (
            promotions.map((promo) => (
              <div
                key={promo.id}
                data-testid="promotion-card"
                className={`group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl border overflow-hidden transition-all duration-300 ${
                  promo.active
                    ? 'border-[var(--secondary)]/30'
                    : 'border-gray-200 opacity-85 hover:opacity-100'
                }`}
              >
                <div className="relative h-40 w-full bg-gray-100 shrink-0 overflow-hidden">
                  {promo.promotionImageUrl ? (
                    <Image
                      src={promo.promotionImageUrl}
                      alt={promo.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : promo.products &&
                    promo.products.length >= 1 &&
                    promo.products[0] &&
                    promo.products[0].image ? (
                    <Image
                      src={promo.products[0].image}
                      alt={promo.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1.5 text-xs font-black rounded-full shadow-sm backdrop-blur-md flex items-center gap-1.5 ${
                        promo.active ? 'bg-green-500/90 text-white' : 'bg-white/90 text-gray-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${promo.active ? 'bg-white animate-pulse' : 'bg-gray-400'}`}
                      ></span>
                      {promo.active ? 'ACTIVA' : 'INACTIVA'}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                    <div
                      className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm"
                      data-testid="promo-discount"
                    >
                      <span className="text-[var(--primary)] font-black text-lg">
                        -{promo.discountPercentage}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-800 line-clamp-1 mb-2 group-hover:text-[var(--primary)] transition-colors">
                    {promo.name}
                  </h3>

                  <p className="text-gray-500 text-sm line-clamp-4 wrap-break-word min-h-[2.5rem] mb-4">
                    {promo.description || 'Sin descripción detallada.'}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-6 bg-gray-50 p-2.5 rounded-lg">
                    <Calendar className="w-4 h-4 text-[var(--secondary)]" />
                    <span>
                      {promo.startDate && promo.endDate
                        ? `${format(new Date(promo.startDate), 'd MMM', { locale: es })} - ${format(new Date(promo.endDate), 'd MMM', { locale: es })}`
                        : '¡Por tiempo limitado!'}
                    </span>
                  </div>

                  <button
                    onClick={() => router.push(`/stores/${storeId}/promotions/${promo.id}`)}
                    className="mt-auto flex items-center justify-center w-full gap-2 px-4 py-3 bg-[var(--primary)]/5 hover:bg-[var(--primary)] text-[var(--primary)] hover:text-white rounded-xl font-bold transition-colors"
                    data-testid="edit-promotion-button"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar Promoción
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <style jsx global>{`
          .font-quicksand {
            font-family: var(--font-quicksand), sans-serif;
          }
        `}</style>
      </div>
    </div>
  );
}
