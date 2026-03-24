'use client';

import { ShareTo } from '@/components/ui/shareTo';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import { outfitWithDiscount } from '@/lib/utils';
import Image from 'next/image';
import { JSX, useState } from 'react';
import AboutUs from './about-us';
import StoreOptions from './options';
import Outfits from './outfits';

type Tab = 'catalogo' | 'sobre' | 'opciones';

type Props = {
  description?: string;
  outfits?: OutfitDTO[];
  store: StoreDTO;
  isOwner: boolean;
};

export default function StoreTabs({
  description = '',
  outfits = [],
  store,
  isOwner,
}: Props): JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('catalogo');

  const promoOutfit = outfits.find((outfit) => outfitWithDiscount(outfit));

  const storefrontId = store?.storefront?.id;
  return (
    <>
      {promoOutfit && (
        <div className="relative mx-4 mt-5 flex flex-col items-center justify-center border-2 border-secondary/50 rounded-md p-4 overflow-hidden w-11/12 sm:w-3/4 lg:max-w-3xl sm:mx-auto">
          <div className="absolute inset-0 z-0 w-full h-full">
            {promoOutfit.image && (
              <Image src={promoOutfit.image} alt={promoOutfit.name} fill className="object-cover" />
            )}
            <div className="absolute inset-0 bg-white/85"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center w-full">
            <h3 className="text-primary font-bold text-lg md:text-xl">¡En promoción!</h3>
            <h2 className="text-secondary font-bold text-4xl md:text-5xl mt-1 text-center">
              {promoOutfit.name}
            </h2>
            <p className="text-primary font-semibold mt-1">12/04/2026 - 26/04/2026</p>
            <ShareTo
              item={promoOutfit}
              className="bg-secondary text-white font-medium py-2 px-4 rounded mt-4 w-fit shadow-sm hover:bg-secondary/90 hover:cursor-pointer transition"
            />
          </div>
        </div>
      )}

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
        {activeTab === 'catalogo' && <Outfits storeId={store.id} outfits={outfits} />}

        {activeTab === 'sobre' && <AboutUs description={description} />}

        {activeTab === 'opciones' && isOwner && (
          <StoreOptions storefrontId={storefrontId} initialStore={store} />
        )}
      </div>
    </>
  );
}
