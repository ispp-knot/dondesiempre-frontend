'use client';

import { Outfit } from '@/lib/types/outfits';
import { PromotionDTO } from '@/lib/api/promotionEndpoints';
import Image from 'next/image';
import { JSX, useState } from 'react';
import AboutUs from './about-us';
import Collections from './collections';
import Outfits from './outfits';

type Tab = 'catalogo' | 'sobre';

type Collection = {
  id: number;
  name: string;
  image: string;
};

type Props = {
  storefrontId?: string;
  collections?: Collection[];
  description?: string;
  outfits?: Outfit[];
  promotions?: PromotionDTO[];
};

export default function StoreTabs({
  storefrontId = undefined,
  collections = [],
  description = '',
  outfits = [],
  promotions = [],
}: Props): JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('catalogo');

  // If we have actual active promotions, use the first one for the banner
  const activePromo = promotions.find((p) => p.active);
  const promoOutfit = outfits.find((o) => o.discountedPriceInCents < o.priceInCents);

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

  return (
    <>
      {bannerPromo && (
        <div className="relative mx-4 mt-5 flex flex-col items-center justify-center border-2 border-secondary/50 rounded-md p-4 overflow-hidden w-11/12 sm:w-1/2 sm:mx-auto sm:max-w-142.5">
          {/* Background Images Container */}
          <div className="absolute inset-0 z-0 w-full h-full">
            {bannerPromo.image && (
              <Image src={bannerPromo.image} alt={bannerPromo.name} fill className="object-cover" />
            )}
            <div className="absolute inset-0 bg-white/85"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center w-full">
            <h3 className="text-primary font-bold text-lg md:text-xl">¡En promoción!</h3>
            <h2 className="text-secondary font-bold text-4xl md:text-5xl mt-1">
              {bannerPromo.name}
            </h2>
            <p className="text-primary font-semibold mt-1">{bannerPromo.dates}</p>
            <button className="bg-secondary text-white font-medium py-2 px-4 rounded mt-4 w-[95%] shadow-sm hover:bg-secondary/90 hover:cursor-pointer transition">
              Ver promoción
            </button>
          </div>
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
      </div>
      <div className={'flex flex-col gap-10 sm:items-center'}>
        {activeTab === 'catalogo' ? (
          <>
            <Collections collections={collections} />
            <Outfits storefrontId={storefrontId} outfits={outfits} />
          </>
        ) : (
          <div>
            <AboutUs description={description} />
          </div>
        )}
      </div>
    </>
  );
}
