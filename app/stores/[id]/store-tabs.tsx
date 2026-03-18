'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { JSX, useState } from 'react';
import Image from 'next/image';
import Collections from './collections';
import AboutUs from './about-us';
import Outfits from './outfits';
import StoreOptions from './options';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { PromotionDTO } from '@/lib/types/promotions/promotionsDto';
import { ShareTo } from '@/components/ui/shareTo';

type Tab = 'catalogo' | 'sobre' | 'opciones';

type Collection = {
  id: number;
  name: string;
  image: string;
};

type Props = {
  collections?: Collection[];
  description?: string;
  outfits?: OutfitDTO[];
  promotions?: PromotionDTO[];
  store: StoreDTO;
};

export default function StoreTabs({
  collections = [],
  description = '',
  outfits = [],
  promotions = [],
  store,
}: Props): JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('catalogo');

  const activePromotions = promotions.filter((p) => p.isActive);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [selectedPromo, setSelectedPromo] = useState<PromotionDTO | null>(null);
  const formatDateRange = (start?: string, end?: string) => {
    if (!start || !end) return '¡Por tiempo limitado!';

    const startDate = new Date(start);
    const endDate = new Date(end);

    return `Válido: ${format(startDate, 'dd MMM', { locale: es })} - ${format(endDate, 'dd MMM', { locale: es })}`;
  };
  // La promoción que se muestra actualmente en el banner
  const currentPromo = activePromotions[currentPromoIndex];

  // Funciones para navegar
  const nextPromo = () => {
    setCurrentPromoIndex((prev) => (prev + 1) % activePromotions.length);
  };

  const prevPromo = () => {
    setCurrentPromoIndex((prev) => (prev - 1 + activePromotions.length) % activePromotions.length);
  };
  // If we have actual active promotions, use the first one for the banner
  const promoOutfit = outfits.find((o) => o.discountedPriceInCents < o.priceInCents);

  /*
  const bannerPromo = activePromo
    ? {
        name: activePromo.name,
        image: activePromo.promotionImageUrl || '/static/img/outfit_placeholder.jpg',
        dates: '¡Disponible ahora!',
      }
    : promoOutfit
      ? {
          name: promoOutfit.name,
          image: promoOutfit.image || '',
          dates: '12/04/2026 - 26/04/2026',
        }
      : null;
  */
  const storefrontId = store?.storefront?.id;
  return (
    <>
      {activePromotions.length > 0 && currentPromo && (
        <div className="relative mx-4 mt-5 flex flex-col items-center justify-center border-2 border-secondary/30 rounded-xl p-6 overflow-hidden w-11/12 sm:w-1/2 sm:mx-auto sm:max-w-142.5 min-h-[300px] transition-all">
          {/* Fondo del Banner */}
          <div className="absolute inset-0 z-0 w-full h-full">
            <Image
              src={currentPromo.promotionImageUrl || '/static/img/outfit_placeholder.jpg'}
              alt={currentPromo.name}
              fill
              className="object-cover transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]"></div>
          </div>

          {/* Contenido del Banner */}
          <div className="relative z-10 flex flex-col items-center w-full text-center">
            <h3 className="text-primary font-bold text-sm md:text-base uppercase tracking-widest">
              ¡Promoción Activa!
            </h3>
            <h2 className="text-secondary font-black text-3xl md:text-4xl mt-2 leading-tight">
              {currentPromo.name}
            </h2>

            <p className="text-white-200 font-medium mt-2 text-sm md:text-base">
              {formatDateRange(currentPromo.startDate, currentPromo.endDate)}
            </p>

            <button
              onClick={() => setSelectedPromo(currentPromo)}
              className="bg-secondary text-white font-bold py-3 px-8 rounded-lg mt-6 w-full shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              Ver productos
            </button>

            {/* Compartir (usando el mock o adaptándolo a la promo actual) */}
            <div className="mt-4 w-full">
              <ShareTo
                item={{ ...currentPromo, name: currentPromo.name, id: currentPromo.id }}
                className="bg-secondary text-white font-medium py-2 px-4 rounded mt-4 w-[95%] shadow-sm hover:bg-secondary/90 hover:cursor-pointer transition"
              />
            </div>
          </div>

          {/* Flechas de Navegación (Solo si hay más de una) */}
          {activePromotions.length > 1 && (
            <>
              <button
                onClick={prevPromo}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white p-2 rounded-full shadow-md transition"
              >
                <svg
                  className="w-5 h-5 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextPromo}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white p-2 rounded-full shadow-md transition"
              >
                <svg
                  className="w-5 h-5 text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Indicador de posición */}
              <div className="absolute bottom-2 flex gap-1">
                {activePromotions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === currentPromoIndex ? 'w-4 bg-secondary' : 'w-1.5 bg-secondary/30'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex mx-4 mt-5 mb-5 self-center rounded-md overflow-hidden border border-gray-200 w-11/12 sm:w-1/2 sm:mx-auto sm:max-w-142.5">
        <button
          onClick={() => setActiveTab('catalogo')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'catalogo' ? 'bg-secondary text-white' : 'bg-white text-secondary'
          }`}
        >
          Catálogo
        </button>

        <button
          onClick={() => setActiveTab('sobre')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'sobre' ? 'bg-secondary text-white' : 'bg-white text-secondary'
          }`}
        >
          Sobre nosotros
        </button>

        <button
          onClick={() => setActiveTab('opciones')}
          className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'opciones' ? 'bg-secondary text-white' : 'bg-white text-secondary'
          }`}
        >
          Opciones
        </button>
      </div>

      <div className="flex flex-col gap-10 sm:items-center">
        {activeTab === 'catalogo' && (
          <>
            {store.storefront.isFirstCollections ? (
              <>
                <Collections storeId={store.id} collections={collections} />
                <Outfits storeId={store.id} outfits={outfits} />
              </>
            ) : (
              <>
                <Outfits storeId={store.id} outfits={outfits} />
                <Collections storeId={store.id} collections={collections} />
              </>
            )}
          </>
        )}

        {activeTab === 'sobre' && <AboutUs description={description} />}

        {activeTab === 'opciones' && (
          <StoreOptions storefrontId={storefrontId} initialStore={store} />
        )}
      </div>
      {/* Modal de Promoción Dinámico */}
      {selectedPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Cabecera dinámica */}
            <div className="relative h-40 w-full shrink-0">
              <Image
                src={selectedPromo.promotionImageUrl || '/static/img/outfit_placeholder.jpg'}
                alt={selectedPromo.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <button
                onClick={() => setSelectedPromo(null)} // Cerramos reseteando a null
                className="absolute top-3 right-3 text-white bg-black/20 hover:bg-black/40 p-1.5 rounded-full backdrop-blur-md transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <h2 className="absolute bottom-4 left-5 text-white text-xl font-bold">
                {selectedPromo.name}
              </h2>
            </div>

            {/* Lista de productos de ESTA promoción específica */}
            <div className="p-5 overflow-y-auto">
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {selectedPromo.description}
              </p>

              <div className="space-y-3">
                {selectedPromo.products && selectedPromo.products.length > 0 ? (
                  selectedPromo.products.map((product, index) => (
                    <div
                      key={`${selectedPromo.id}-prod-${index}`}
                      className="flex items-center gap-3 p-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition"
                    >
                      <div className="relative h-14 w-14 rounded-lg overflow-hidden shrink-0 border">
                        <Image
                          src={product.image || '/static/img/outfit_placeholder.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-primary font-bold text-sm">
                            {product.discountedPriceInCents}€
                          </span>
                          <span className="text-gray-400 text-xs line-through">
                            {product.priceInCents/100}€
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-4 text-sm italic">
                    Esta promoción no tiene productos asociados.
                  </p>
                )}
              </div>
            </div>

            {/* Footer con el descuento de esta promo */}
            <div className="p-5 border-t bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Descuento
                </span>
                <span className="text-xl font-black text-primary">
                  -{selectedPromo.discountPercentage}%
                </span>
              </div>
              <button
                onClick={() => setSelectedPromo(null)}
                className="w-full bg-secondary text-white font-bold py-3 rounded-xl hover:brightness-110 transition shadow-md"
              >
                Volver a la tienda
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
