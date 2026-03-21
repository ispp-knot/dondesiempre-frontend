import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertPrice(priceInCents: number): number {
  return priceInCents / 100;
}

export function getOutfitDiscountPercentage(
  outfit: Pick<OutfitDTO, 'priceInCents' | 'discountPercentage' | 'discountedPriceInCents'>
): number {
  if (typeof outfit.discountPercentage === 'number') {
    return Math.max(0, Math.min(100, outfit.discountPercentage));
  }

  if (
    typeof outfit.discountedPriceInCents === 'number' &&
    outfit.priceInCents > 0 &&
    outfit.discountedPriceInCents < outfit.priceInCents
  ) {
    return Math.max(
      0,
      Math.min(100, 100 - Math.round((outfit.discountedPriceInCents / outfit.priceInCents) * 100))
    );
  }

  return 0;
}

export function calculatePriceWithPercentageDiscount(
  realPriceInCents: number,
  discountPercentage: number
): number {
  return convertPrice(Math.round(realPriceInCents * (1 - discountPercentage / 100)));
}

export function getOutfitDisplayPrice(
  outfit: Pick<OutfitDTO, 'priceInCents' | 'discountPercentage' | 'discountedPriceInCents'>
): number {
  const discountPercentage = getOutfitDiscountPercentage(outfit);
  return discountPercentage > 0
    ? calculatePriceWithPercentageDiscount(outfit.priceInCents, discountPercentage)
    : convertPrice(outfit.priceInCents);
}

export function outfitWithDiscount(
  outfit: Pick<OutfitDTO, 'priceInCents' | 'discountPercentage' | 'discountedPriceInCents'>
): boolean {
  return getOutfitDiscountPercentage(outfit) > 0;
}
