'use client';
import HorizontalScroll from '@/components/dondeSiempre/HorizontalScroll';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { hasMinimumOutfitProducts } from '@/lib/types/outfits/outfitsRules';
import { getOutfitDiscountPercentage, outfitWithDiscount } from '@/lib/utils';
import { Percent } from 'lucide-react';
import Link from 'next/link';

type Props = {
  storeId?: string;
  outfits?: OutfitDTO[];
};

export default function Outfits({ storeId = undefined, outfits = [] }: Readonly<Props>) {
  const validOutfits = outfits.filter(hasMinimumOutfitProducts);

  return (
    <HorizontalScroll title="Nuestros outfits" viewMoreHref={`/stores/${storeId}/outfits`}>
      {validOutfits.map((out) => (
        <Link
          href={`/stores/${storeId}/outfits/${out.id}`}
          key={out.id}
          className="relative flex h-60 w-[45%] shrink-0 flex-col justify-end rounded-lg border-2 border-gray-200 bg-cover bg-center shadow-sm sm:h-80 md:w-1/4"
          style={{
            backgroundImage: `url(${out.image || '/static/img/outfit_placeholder.jpg'})`,
          }}
        >
          {outfitWithDiscount(out) && (
            <div className="absolute top-2 left-2 bg-primary rounded-full p-0.5 md:p-1 flex items-center justify-center shadow-md">
              <Percent className="w-4 h-4 md:w-5 md:h-5 text-white stroke-3" />
            </div>
          )}
          <div className="flex flex-row items-center justify-center gap-1.5 w-full h-4/12 md:h-1/4 self-end bg-white text-sm md:text-lg px-2 text-center">
            <span className="truncate">{out.name}</span>
            {outfitWithDiscount(out) && (
              <span className="text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded-md text-xs md:text-sm">
                -{getOutfitDiscountPercentage(out).toFixed(0)}%
              </span>
            )}
          </div>
        </Link>
      ))}
    </HorizontalScroll>
  );
}
