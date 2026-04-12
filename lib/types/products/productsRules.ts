import { z } from 'zod';

export const MAX_PRODUCT_NAME_LENGTH = 255;
export const MAX_PRODUCT_DESCRIPTION_LENGTH = 5000;
export const MIN_PRODUCT_PRICE = 0.01;
export const MAX_PRODUCT_PRICE = 9999;
export const MIN_DISCOUNT = 0;
export const MAX_DISCOUNT = 99;

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
  price: z
    .number({ error: 'El precio debe aparecer y ser un número.' })
    .min(MIN_PRODUCT_PRICE, `El precio debe ser igual o superior a ${MIN_PRODUCT_PRICE}€.`)
    .max(MAX_PRODUCT_PRICE, `El precio no puede ser mayor a ${MAX_PRODUCT_PRICE}€.`)
    .multipleOf(0.01, 'El precio debe tener como máximo dos decimales.'),
  productTypeId: z.string().min(1, 'La categoría es obligatoria.'),
  discount: z.preprocess(
    (val) => {
      if (val === '' || val === null || Number.isNaN(val)) return 0;
      return val;
    },
    z
      .number()
      .min(MIN_DISCOUNT, `El descuento no puede ser menor a ${MIN_DISCOUNT}%.`)
      .max(MAX_DISCOUNT, `El descuento no puede ser mayor a ${MAX_DISCOUNT}%.`)
      .multipleOf(1, 'El descuento debe ser un número entero.')
  ),
});

export function createProductFormSchema() {
  return baseProductFormSchema;
}

export function createEditProductFormSchema() {
  return baseProductFormSchema;
}

export type ProductFormInput = z.input<typeof baseProductFormSchema>;
export type ProductFormValues = z.infer<typeof baseProductFormSchema>;
