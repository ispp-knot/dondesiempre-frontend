'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ShareTo } from '@/components/ui/shareTo';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { StoreDTO, StoreImageDTO } from '@/lib/types/stores/storesDto';

import { convertPrice, discountPrice } from '@/lib/utils';
import Image from 'next/image';
import { JSX, useState } from 'react';
import StoreOptions from './options';
import Outfits from './outfits';
import { PromotionDTO } from '@/lib/types/promotions/promotionsDto';
import StoreAboutSection from './about-us-section';
import { ProductDTO } from '@/lib/types/products/productsDto';
import { IoSearch } from 'react-icons/io5';
import Products from './products';
import { buttonLinkClass } from '@/lib/utils/buttonLinkClass';
import Link from 'next/link';

type Tab = 'catalogo' | 'sobre' | 'opciones';

type Props = {
  description?: string;
  outfits?: OutfitDTO[];
  products?: ProductDTO[];
  promotions?: PromotionDTO[];
  store: StoreDTO;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isOwner: boolean;
  images?: StoreImageDTO[];
  onImagesUpdated?: (images: StoreImageDTO[]) => void;
};

export default function StoreTabs({
  description = '',
  outfits = [],
  products = [],
  promotions = [],
  store,
  searchQuery = '',
  onSearchChange,
  isOwner,
  images = [],
  onImagesUpdated,
}: Props): JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('catalogo');

  const activePromotions = promotions.filter((p) => p.active);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const [selectedPromo, setSelectedPromo] = useState<PromotionDTO | null>(null);
  const [localImages, setLocalImages] = useState<StoreImageDTO[]>(images ?? []);

  const handleImagesUpdated = (updated: StoreImageDTO[]) => {
    setLocalImages(updated);
    onImagesUpdated?.(updated);
  };

  const totalSlides = isOwner ? activePromotions.length + 1 : activePromotions.length;

  const formatDateRange = (start?: string, end?: string) => {
    if (!start || !end) return '¡Por tiempo limitado!';

    const startDate = new Date(start);
    const endDate = new Date(end);

    return `Válido: ${format(startDate, 'dd MMM', { locale: es })} - ${format(endDate, 'dd MMM', { locale: es })}`;
  };

  // Funciones para navegar
  const nextPromo = () => {
    setCurrentPromoIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevPromo = () => {
    setCurrentPromoIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const renderBannerContent = () => {
    // Si el índice actual es igual a la longitud, mostramos la tarjeta de "Crear"
    if (currentPromoIndex == activePromotions.length && isOwner) {
      return (
        <div className="relative z-10 flex flex-col items-center w-full text-center p-4">
          <div
            className="bg-secondary/10 p-4 rounded-full mb-4"
            data-testid="create-promotion-banner"
          >
            <svg
              className="w-10 h-10 text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h2 className="text-secondary font-black text-2xl md:text-3xl leading-tight">
            ¿Quieres atraer más clientes?
          </h2>
          <p className="text-gray-600 font-medium mt-2 text-sm md:text-base">
            Crea una nueva oferta o descuento especial para tu tienda.
          </p>
          <Link
            data-testid="create-promotion-button"
            href={`/stores/${store.id}/promotions/manage`}
            className={`${buttonLinkClass} bg-primary text-white font-bold py-3 px-8 rounded-lg mt-6 w-full shadow-lg hover:scale-[1.02] active:scale-95 transition-all`}
          >
            Gestionar promociones
          </Link>
        </div>
      );
    }
    if (activePromotions.length > 0) {
      // Contenido normal de la promoción
      const currentPromo = activePromotions[currentPromoIndex];
      return (
        <div className="relative z-10 flex flex-col items-center w-full text-center">
          <h3 className="text-primary font-bold text-sm md:text-base uppercase tracking-widest">
            ¡Promoción Activa!
          </h3>
          <h2 className="text-secondary font-black text-3xl md:text-4xl mt-2 leading-tight">
            {currentPromo.name}
          </h2>
          {isOwner && (
            <button
              onClick={() => {
                window.location.href = `/stores/${store.id}/promotions/${currentPromo.id}/`;
              }}
              className="absolute top-0 right-0 bg-white/80 hover:bg-white text-secondary p-2 rounded-full shadow-md transition-all z-30 group"
              title="Editar promoción"
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          )}
          <p className="text-white-200 font-medium mt-2 text-sm md:text-base">
            {formatDateRange(currentPromo.startDate, currentPromo.endDate)}
          </p>
          <button
            onClick={() => setSelectedPromo(currentPromo)}
            className="bg-secondary text-white font-bold py-3 px-8 rounded-lg mt-6 w-full shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            Ver productos
          </button>
          {isOwner && (
            <div className="mt-4 w-full">
              <ShareTo
                item={{
                  ...currentPromo,
                  name: currentPromo.name,
                  id: currentPromo.id,
                  image: currentPromo.promotionImageUrl,
                }}
                className="bg-secondary text-white font-medium py-2 px-4 rounded mt-4 w-[95%] shadow-sm hover:bg-secondary/90 hover:cursor-pointer transition"
              />
            </div>
          )}
        </div>
      );
    }
  };

  const storefrontId = store?.storefront?.id;
  return (
    <>
      {totalSlides > 0 && (
        <div className="relative mx-4 mt-5 flex flex-col items-center justify-center border-2 border-secondary/30 rounded-xl p-6 overflow-hidden w-11/12 sm:w-1/2 sm:mx-auto sm:max-w-142.5 min-h-[300px] transition-all bg-gray-50">
          {/* Fondo Dinámico (Solo si hay promo, si no, un fondo neutro para 'Crear') */}
          <div className="absolute inset-0 z-0 w-full h-full">
            {currentPromoIndex != activePromotions.length ? (
              <>
                <Image
                  src={
                    activePromotions[currentPromoIndex].promotionImageUrl ||
                    '/static/img/outfit_placeholder.jpg'
                  }
                  alt="Promo background"
                  fill
                  className="object-cover transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px]"></div>
              </>
            ) : (
              <div
                className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-200"
                data-testid="create-promotion-banner"
              />
            )}
          </div>

          {renderBannerContent()}

          {/* Flechas de Navegación (Siempre que el total sea > 1) */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={prevPromo}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/40 hover:bg-white p-2 rounded-full shadow-md transition"
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
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/40 hover:bg-white p-2 rounded-full shadow-md transition"
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

              {/* Indicadores de posición */}
              <div className="absolute bottom-2 flex gap-1">
                {Array.from({ length: totalSlides }).map((_, i) => (
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

      <div className="p-4 mt-6 bg-white sticky top-0 z-50">
        <div className=" relative flex items-center w-full max-w-2xl mx-auto">
          <IoSearch className="absolute left-3 text-secondary text-xl" />
          <input
            type="text"
            placeholder="Buscar productos..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            maxLength={50}
            className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-gray-50 text-dark-blue font-medium"
            value={searchQuery || ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>

      <div className="flex mx-4 mt-5 mb-5 self-center rounded-md overflow-hidden border border-gray-200 w-11/12 sm:mx-auto sm:max-w-142.5">
        <button
          onClick={() => setActiveTab('catalogo')}
          className="flex-1 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
          style={
            activeTab === 'catalogo'
              ? { backgroundColor: 'var(--secondary)', color: 'white' }
              : { backgroundColor: 'white', color: 'var(--secondary)' }
          }
        >
          Catálogo
        </button>
        <button
          onClick={() => setActiveTab('sobre')}
          className="flex-1 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
          style={
            activeTab === 'sobre'
              ? { backgroundColor: 'var(--secondary)', color: 'white' }
              : { backgroundColor: 'white', color: 'var(--secondary)' }
          }
        >
          Sobre nosotros
        </button>
        {isOwner && (
          <button
            onClick={() => setActiveTab('opciones')}
            className="flex-1 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
            style={
              activeTab === 'opciones'
                ? { backgroundColor: 'var(--secondary)', color: 'white' }
                : { backgroundColor: 'white', color: 'var(--secondary)' }
            }
          >
            Opciones
          </button>
        )}
      </div>

      <div className="flex flex-col gap-10 sm:items-center min-h-96">
        {activeTab === 'catalogo' && (
          <>
            <Outfits storeId={store.id} outfits={outfits} />
            <Products storeId={store.id} products={products} />
          </>
        )}

        {activeTab === 'sobre' && (
          <StoreAboutSection
            description={description}
            images={localImages}
            isOwner={isOwner}
            storeId={store.id}
            onImagesUpdated={handleImagesUpdated}
          />
        )}

        {activeTab === 'opciones' && isOwner && (
          <StoreOptions storefrontId={storefrontId} initialStore={store} />
        )}
      </div>
      {selectedPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
            data-testid="promotion-products-modal"
          >
            {/* Cabecera dinámica */}
            <div className="relative h-40 w-full shrink-0">
              <Image
                src={
                  selectedPromo.promotionImageUrl ||
                  selectedPromo.products[0].image ||
                  '/static/img/outfit_placeholder.jpg'
                }
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
                            {discountPrice(product.priceInCents, selectedPromo.discountPercentage)}€
                          </span>
                          <span className="text-gray-400 text-xs line-through">
                            {convertPrice(product.priceInCents)}€
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
