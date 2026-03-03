'use client';

import { JSX, useState } from 'react';
import Collections from './collections';
import AboutUs from './about-us';
import Outfits from './outfits';
import { ShareTo } from '@/components/ui/shareTo';
import { Promotion } from '@/lib/api/types';

interface Collection {
  id: number;
  name: string;
  image: string;
}

interface Outfit {
  id: number;
  name: string;
  image: string;
  discount?: number;
}

interface Props {
  collections?: Collection[];
  description?: string;
  outfits?: Outfit[];
}

export default function StoreTabs({
  collections = [],
  description = '',
  outfits = [],
}: Props): JSX.Element {
  const [activeTab, setActiveTab] = useState<'catalogo' | 'sobre'>('catalogo');

  const mockPromotion: Promotion = {
    id: '1a383fda-5ac8-4f1f-bfba-2dcd4f09dca3',
    name: 'Rebajas de Invierno',
    discountPercentage: 25,
    isActive: true,
    description: 'Descuento especial en productos seleccionados por tiempo limitado.',
    image: null,
    storeId: '1a383fda-5ac8-4f1f-bfba-2dcd4f09dca3',
    productIds: ['0xF00000', '0xFF00000', '0xFF00FF000', '0xFF000'],
  };
  return (
    <>
      {
        <div className="relative mx-4 mt-5 flex flex-col items-center justify-center border-2 border-secondary/50 rounded-md p-4 overflow-hidden w-11/12 sm:w-1/2 sm:mx-auto sm:max-w-142.5">
          {/* Background Images Container */}
          <div className="absolute inset-0 z-0 w-full h-full">
            <div className="absolute inset-0 bg-white/85"></div>
          </div>

          <div className="relative z-10 flex flex-col items-center w-full">
            <h3 className="text-primary font-bold text-lg md:text-xl">¡En promoción!</h3>
            <h2 className="text-secondary font-bold text-4xl md:text-5xl mt-1">Feria</h2>
            <p className="text-primary font-semibold mt-1">12/04/2026 - 26/04/2026</p>
            <ShareTo
              item={mockPromotion}
              className="bg-secondary text-white font-medium py-2 px-4 rounded mt-4 w-[95%] shadow-sm hover:bg-secondary/90 hover:cursor-pointer transition"
            />
          </div>
        </div>
      }
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
            <Outfits outfits={outfits} />
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
