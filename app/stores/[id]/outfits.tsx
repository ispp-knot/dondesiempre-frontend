'use client';
import HorizontalScroll from '@/components/dondeSiempre/HorizontalScroll';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { hasMinimumOutfitProducts } from '@/lib/types/outfits/outfitsRules';
import {
  calculatePriceWithPercentageDiscount,
  convertPrice,
  formatDisplayPrice,
  getOutfitDiscountPercentage,
  outfitWithDiscount,
} from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { RiDiscountPercentFill } from 'react-icons/ri';

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
        const formatPrice = (price: number) => formatDisplayPrice(price);

        return (
          <Link
            href={`/stores/${storeId}/outfits/${out.id}`}
            key={out.id}
            className="relative flex flex-col overflow-hidden shadow-sm w-[49%] md:w-[24%] rounded-lg border border-gray-200 cursor-pointer"
          >
            {hasDiscount && (
              <div className="absolute top-2 left-2 z-10 bg-primary rounded-full p-0.5 md:p-1 shadow-md">
                <RiDiscountPercentFill className="text-3xl text-white" />
              </div>
            )}

            <div className="relative w-full h-52 sm:h-64 md:h-72 shrink-0">
              <Image
                src={out.image || '/static/img/outfit_placeholder.jpg'}
                alt={out.name}
                fill
                className="object-contain"
              />
            </div>

            <div className="flex flex-col flex-1 p-3 gap-1.5 bg-white">
              <h2 className="font-bold text-primary text-lg md:text-xl truncate">{out.name}</h2>

              <div className="mt-auto pt-1">
                {hasDiscount ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-base line-through text-muted-foreground">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(finalPrice)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-primary">{formatPrice(finalPrice)}</span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </HorizontalScroll>
  );
}
