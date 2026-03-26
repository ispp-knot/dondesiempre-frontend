import { z } from 'zod';

export const MAX_PRODUCT_NAME_LENGTH = 255;
export const MAX_PRODUCT_DESCRIPTION_LENGTH = 5000;
export const MIN_PRODUCT_PRICE = 0;

const baseProductFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(
      MAX_PRODUCT_NAME_LENGTH,
      `El nombre no puede superar los ${MAX_PRODUCT_NAME_LENGTH} caracteres.`
    ),
  description: z
    .string()
    .max(
      MAX_PRODUCT_DESCRIPTION_LENGTH,
      `La descripción no puede superar los ${MAX_PRODUCT_DESCRIPTION_LENGTH} caracteres.`
    )
    .transform((value) => {
      const trimmedValue = value.trim();
      return trimmedValue.length === 0 ? null : trimmedValue;
    })
    .nullable(),
  priceInCents: z
    .number({ error: 'El precio es obligatorio.' })
    .min(MIN_PRODUCT_PRICE, 'El precio no puede ser negativo.'),
  productTypeId: z.string().min(1, 'El tipo de producto es obligatorio.'),
});

export function createProductFormSchema() {
  return baseProductFormSchema;
}

export function createEditProductFormSchema() {
  return baseProductFormSchema;
}

export type ProductFormInput = z.input<typeof baseProductFormSchema>;
export type ProductFormValues = z.infer<typeof baseProductFormSchema>;
