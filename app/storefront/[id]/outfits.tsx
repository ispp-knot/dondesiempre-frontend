'use client';

import { Outfit } from '@/lib/types/outfits';
import { Percent } from 'lucide-react';
import Link from 'next/link';

type Props = {
  storefrontId?: string;
  outfits?: Outfit[];
};

export default function Outfits({ storefrontId = undefined, outfits = [] }: Props) {
  return (
    <div className="flex flex-col px-5 sm:w-10/12">
      <div className="flex flex-row items-center justify-between w-full mb-4">
        <h1 className="text-primary text-xl md:text-2xl font-bold">Nuestros outfits</h1>
        <Link href={`/storefront/${storefrontId}/outfits`} className="text-secondary underline">
          Ver más
        </Link>
      </div>
      <div className="flex flex-row items-center gap-2 md:gap-4 overflow-x-auto pb-3 storefront-listing">
        {outfits.map((out) => (
          <Link
            href={`/storefront/${storefrontId}/outfits/${out.id}`}
            key={out.id}
            className="relative flex flex-col shrink-0 border-2 border-gray-200 w-[45%] md:w-1/4 h-60 sm:h-80 bg-cover bg-center justify-end rounded-lg shadow-sm"
            style={{
              backgroundImage: `url(${out.image || `/static/img/outfit_placeholder_${out.id}.jpg`})`,
            }}
          >
            {out.discountedPriceInCents !== out.priceInCents && (
              <div className="absolute top-2 left-2 bg-primary rounded-full p-0.5 md:p-1 flex items-center justify-center shadow-md">
                <Percent className="w-4 h-4 md:w-5 md:h-5 text-white stroke-[3]" />
              </div>
            )}
            <div className="flex flex-row items-center justify-center gap-1.5 w-full h-4/12 md:h-1/4 self-end bg-white text-sm md:text-lg px-2 text-center">
              <span className="truncate">{out.name}</span>
              {out.discountedPriceInCents !== out.priceInCents && (
                <span className="text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded-md text-xs md:text-sm">
                  -
                  {(
                    ((out.priceInCents - out.discountedPriceInCents) / out.priceInCents) *
                    100.0
                  ).toFixed(0)}
                  %
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
      {/* style={{ backgroundImage: `url(${col.image})` }} */}
      {/* TODO: Style collections with images */}
    </div>
  );
}
