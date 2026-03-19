import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertPrice(priceInCents: number): number {
  return priceInCents / 100;
}

export function calculatePriceWithPercentageDiscount(realPrice: number, discount: number) {
  return realPrice * (1 - discount / 100);
}
