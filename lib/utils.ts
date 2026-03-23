import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertPrice(priceInCents: number): number {
  return Number((priceInCents / 100).toFixed(2));
}

export function discountPrice(priceInCents: number, discountPercentage: number | null): number {
  return discountPercentage
    ? (convertPrice(priceInCents * ((100 - discountPercentage) / 100)))
    : (convertPrice(priceInCents));
}
