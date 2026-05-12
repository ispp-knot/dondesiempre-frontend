import type { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { z } from 'zod';
import { MAX_DISCOUNT, MIN_DISCOUNT } from '../products/productsRules';

export const MIN_OUTFIT_PRODUCTS = 2;
export const MAX_OUTFIT_NAME_LENGTH = 255;
export const MAX_OUTFIT_DESCRIPTION_LENGTH = 5000;
export const MAX_OUTFIT_TAG_LENGTH = 255;

export const outfitTagSchema = z
  .string()
  .trim()
  .min(1, 'La etiqueta no puede estar vacia.')
  .max(
    MAX_OUTFIT_TAG_LENGTH,
    `Cada etiqueta puede tener como maximo ${MAX_OUTFIT_TAG_LENGTH} caracteres.`
  );

const baseOutfitFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(
      MAX_OUTFIT_NAME_LENGTH,
      `El nombre no puede superar los ${MAX_OUTFIT_NAME_LENGTH} caracteres.`
    ),
  description: z
    .string()
    .max(
      MAX_OUTFIT_DESCRIPTION_LENGTH,
      `La descripcion no puede superar los ${MAX_OUTFIT_DESCRIPTION_LENGTH} caracteres.`
    )
    .transform((value) => {
      const trimmedValue = value.trim();
      return trimmedValue.length === 0 ? null : trimmedValue;
    }),
  discountPercentage: z
    .preprocess(
      (val: number | null | undefined) => (val ? val : 0),
      z
        .number({
          error: 'El descuento debe ser un número válido.',
        })
        .min(MIN_DISCOUNT, `El descuento no puede ser menor a ${MIN_DISCOUNT}%.`)
        .max(MAX_DISCOUNT, `El descuento no puede ser mayor a ${MAX_DISCOUNT}%.`)
        .multipleOf(1, 'El descuento debe ser un número entero.')
        .nullable()
    )
    .optional(),
});

export function createOutfitFormSchema() {
  return baseOutfitFormSchema.extend({
    tags: z.array(outfitTagSchema).default([]),
    productIds: z
      .array(z.string())
      .min(MIN_OUTFIT_PRODUCTS, `Un outfit debe incluir al menos ${MIN_OUTFIT_PRODUCTS} prendas.`),
  });
}

export function createEditOutfitFormSchema() {
  return baseOutfitFormSchema;
}

export function normalizeOutfitTag(tag: string): string {
  return tag.replace(/\s+/g, ' ').trim();
}

export function getMissingOutfitProductsCount(productCount: number): number {
  return Math.max(0, MIN_OUTFIT_PRODUCTS - productCount);
}

export function hasMinimumOutfitProducts(outfit: Pick<OutfitDTO, 'products'>): boolean {
  return outfit.products.length >= MIN_OUTFIT_PRODUCTS;
}
