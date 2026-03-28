'use client';
import HorizontalScroll from '@/components/dondeSiempre/HorizontalScroll';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { hasMinimumOutfitProducts } from '@/lib/types/outfits/outfitsRules';
import {
  calculatePriceWithPercentageDiscount,
  convertPrice,
  getOutfitDiscountPercentage,
  outfitWithDiscount,
} from '@/lib/utils';
import { Percent } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  storeId?: string;
  outfits?: OutfitDTO[];
};

export default function Outfits({ storeId = undefined, outfits = [] }: Readonly<Props>) {
  const validOutfits = outfits.filter(hasMinimumOutfitProducts);

  return (
    <HorizontalScroll title="Nuestros outfits" viewMoreHref={`/stores/${storeId}/outfits`}>
      {validOutfits.map((out) => {
        const discountPct = getOutfitDiscountPercentage(out);
        const hasDiscount = outfitWithDiscount(out);
        const originalPrice = convertPrice(out.priceInCents);
        const finalPrice = hasDiscount
          ? calculatePriceWithPercentageDiscount(out.priceInCents, discountPct)
          : originalPrice;
        const formatPrice = (price: number) =>
          price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

        return (
          <Link
            href={`/stores/${storeId}/outfits/${out.id}`}
            key={out.id}
            className="relative flex flex-col shrink-0 border-2 border-gray-200 w-[42%] md:w-[22%] rounded-lg shadow-sm overflow-hidden"
          >
            <div className="w-full h-52 sm:h-60 md:h-72 relative">
              <Image
                src={out.image || '/static/img/outfit_placeholder.jpg'}
                alt={out.name}
                fill
                className="object-contain"
              />
            </div>

            {hasDiscount && (
              <div className="absolute top-2 left-2 bg-primary rounded-full p-0.5 md:p-1 flex items-center justify-center shadow-md">
                <Percent className="w-4 h-4 md:w-5 md:h-5 text-white stroke-3" />
              </div>
            )}

            <div className="flex flex-col w-full self-end bg-white px-3 py-2.5 gap-1">
              <span className="truncate text-sm md:text-base font-medium">{out.name}</span>
              <div className="flex flex-row items-center justify-between gap-2 mt-1">
                <div className="flex items-baseline gap-1.5">
                  {hasDiscount && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                  <span
                    className={`text-sm font-semibold ${hasDiscount ? 'text-primary' : 'text-gray-800'}`}
                  >
                    {formatPrice(finalPrice)}
                  </span>
                </div>
                {hasDiscount && (
                  <span className="text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded-md text-xs shrink-0">
                    -{discountPct.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </HorizontalScroll>
  );
}
