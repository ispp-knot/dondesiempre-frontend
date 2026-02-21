'use client';

import { JSX, useState } from 'react';
import Collections from './collections';
import AboutUs from './about-us';

type Tab = 'catalogo' | 'sobre';

type Collection = {
  id: number;
  name: string;
  image: string;
};

type Props = {
  collections?: Collection[];
  description?: string;
};

export default function StoreTabs({ collections = [], description = '' }: Props): JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('catalogo');

  return (
    <>
      <div className="flex mx-4 mt-5 mb-5 self-center rounded-md overflow-hidden border border-gray-200 w-11/12 sm:w-1/2 sm:mx-auto">
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
      <div className={'flex flex-col gap-2'}>
        {/* TODO: Add outfits */}
        {activeTab === 'catalogo' ? (
          <Collections collections={collections} />
        ) : (
          <div>
            <AboutUs description={description} />
          </div>
        )}
      </div>
    </>
  );
}
