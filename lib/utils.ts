import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertPrice(priceInCents: number): number {
  return Number((priceInCents / 100).toFixed(2));
}

export function getOutfitDiscountPercentage(
  outfit: Pick<OutfitDTO, 'priceInCents' | 'discountPercentage'>
): number {
  if (typeof outfit.discountPercentage === 'number') {
    return Math.max(0, Math.min(100, outfit.discountPercentage));
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
  outfit: Pick<OutfitDTO, 'priceInCents' | 'discountPercentage'>
): number {
  const discountPercentage = getOutfitDiscountPercentage(outfit);
  return discountPercentage > 0
    ? calculatePriceWithPercentageDiscount(outfit.priceInCents, discountPercentage)
    : convertPrice(outfit.priceInCents);
}

export function outfitWithDiscount(
  outfit: Pick<OutfitDTO, 'priceInCents' | 'discountPercentage'>
): boolean {
  return getOutfitDiscountPercentage(outfit) > 0;
}

export function discountPrice(priceInCents: number, discountPercentage: number | null): number {
  return discountPercentage
    ? convertPrice(priceInCents * ((100 - discountPercentage) / 100))
    : convertPrice(priceInCents);
}
