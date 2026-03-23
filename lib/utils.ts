import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function convertPrice(priceInCents: number): number {
  return Math.round(priceInCents / 100);
}

export function discountPrice(priceInCents: number, discountPercentage: number | null): number {
  return discountPercentage
    ? Math.round(convertPrice(priceInCents * ((100 - discountPercentage) / 100)))
    : Math.round(convertPrice(priceInCents));
}
