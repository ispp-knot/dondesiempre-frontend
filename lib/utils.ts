import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertPrice(priceInCents: number): number {
  return priceInCents / 100;
}

export function calculatePriceWithPercentageDiscount(realPrice: number, discount: number) {
  return (realPrice / 100) * (1 - discount / 100);
}

export function outfitWithDiscount(outfit: OutfitDTO) {
  return outfit.discountedPriceInCents !== null && outfit.discountedPriceInCents > 0;
}
