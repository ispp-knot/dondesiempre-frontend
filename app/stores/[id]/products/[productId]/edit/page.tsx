'use client';

import ImageUpload from '@/components/dondeSiempre/ImageUpload';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import { ErrorView } from '@/components/dondeSiempre/ErrorView';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { ProductDTO } from '@/lib/types/products/productsDto';
import { ProductTypeDTO } from '@/lib/types/producttypes/productTypesDto';
import { createEditProductFormSchema, ProductFormInput } from '@/lib/types/products/productsRules';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StoreOwnerGuard } from '@/components/guards/StoreOwnerGuard';
import Image from 'next/image';
import { BackButton } from '@/components/dondeSiempre/BackButton';
import { getUploadErrorMessage } from '@/lib/utils/errorHandler';

interface ProductUpdateDTO {
  name?: string;
  description?: string | null;
  priceInCents?: number;
  productTypeId?: string;
  discountPercentage?: number | null;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export default function ProductEditPage() {
  const params = useParams<{ id: string; productId: string }>();
  const router = useRouter();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const product = usePassiveFetcher<ProductDTO>({ url: `products/${params.productId}` });
  const productTypes = usePassiveFetcher<ProductTypeDTO[]>({ url: `product-types` });
  const updateProduct = useActiveFetcher<ProductDTO>({
    url: `products/${params.productId}`,
    method: 'PUT',
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(createEditProductFormSchema()),
  });

  const nameValue = useWatch({ control, name: 'name' }) ?? '';
  const descriptionValue = useWatch({ control, name: 'description' }) ?? '';

  useEffect(() => {
    if (product.data) {
      reset({
        name: product.data.name,
        description: product.data.description || '',
        price: product.data.priceInCents / 100,
        productTypeId: product.data.typeId,
        discount: product.data.discountPercentage ?? undefined,
      });
    }
  }, [product.data, reset]);

  if (product.isLoading || productTypes.isLoading) {
    return <LoadingText />;
  }

  if (product.error || productTypes.isError) {
    return (
      <ErrorView
        title="Producto no encontrado"
        description="No pudimos encontrar este producto. Puede que se haya eliminado o que el enlace ya no sea válido."
        buttonText="Volver atrás"
      />
    );
  }

  if (!product.data) {
    return (
      <ErrorView
        title="Producto no encontrado"
        description="No pudimos encontrar este producto. Puede que se haya eliminado o que el enlace ya no sea válido."
        buttonText="Volver atrás"
      />
    );
  }

  const submitForm = async (data: ProductFormInput) => {
    setApiError(null);

    try {
      const dto: ProductUpdateDTO = {
        name: data.name || undefined,
        description: data.description || null,
        priceInCents: Math.round(data.price * 100) || undefined,
        productTypeId: data.productTypeId || undefined,
        discountPercentage: (data.discount as number | undefined) ?? null,
      };

      await updateProduct.fetch({
        formPayload: {
          product: new Blob([JSON.stringify(dto)], { type: 'application/json' }),
          image: imageFile ?? undefined,
        },
      });

      if (updateProduct.isError) {
        setApiError('Hubo un error al actualizar el producto. Por favor, intenta de nuevo.');
        return;
      }

      router.push(`/stores/${params.id}/products/${params.productId}`);
    } catch (err: unknown) {
      setApiError(
        getUploadErrorMessage(
          err,
          'Hubo un error al actualizar el producto. Por favor, intenta de nuevo.'
        )
      );
    }
  };

  return (
    <StoreOwnerGuard storeId={params.id}>
      <div className="flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-6xl space-y-4">
          <div className="flex justify-start">
            <BackButton
              variant="ghost"
              onAction={() => router.push(`/stores/${params.id}/products/${params.productId}`)}
            />
          </div>

          <Card className="p-4 shadow-xl sm:p-6 md:p-8">
            <h1 className="mb-6 text-center text-3xl font-bold text-primary">Editar producto</h1>

            <form onSubmit={(e) => handleSubmit(submitForm)(e)} className="space-y-6" noValidate>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2" data-testid="product-edit-name-input">
                  <Label htmlFor="form-name" className="text-base font-bold text-secondary">
                    Nombre
                  </Label>
                  <Input
                    id="form-name"
                    type="text"
                    minLength={1}
                    maxLength={255}
                    aria-invalid={!!errors.name}
                    {...register('name')}
                  />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <FieldError message={errors.name?.message} />
                    <p className="shrink-0 text-xs text-muted-foreground">{nameValue.length}/255</p>
                  </div>
                </div>

                <div
                  className="space-y-2 md:col-span-2"
                  data-testid="product-edit-description-input"
                >
                  <Label htmlFor="form-description" className="text-base font-bold text-secondary">
                    Descripción
                  </Label>
                  <Textarea
                    id="form-description"
                    minLength={0}
                    maxLength={5000}
                    rows={5}
                    aria-invalid={!!errors.description}
                    className="resize-y"
                    {...register('description')}
                  />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <FieldError message={errors.description?.message} />
                    <p className="shrink-0 text-xs text-muted-foreground">
                      {descriptionValue.length}/5000
                    </p>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2" data-testid="product-edit-image-input">
                  <Label htmlFor="form-image" className="text-base font-bold text-secondary">
                    Imagen
                  </Label>
                  {product.data.image && (
                    <div className="flex justify-center mb-2">
                      <Image
                        src={product.data.image}
                        alt={product.data.name}
                        width={192}
                        height={192}
                        className="max-h-48 max-w-xs object-cover rounded-lg shadow-lg"
                      />
                    </div>
                  )}
                  <div id="form-image">
                    <ImageUpload onChange={setImageFile} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form-price" className="text-base font-bold text-secondary">
                    Precio
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="form-price"
                      data-testid="product-edit-price-input"
                      type="number"
                      min="0.01"
                      max="9999"
                      step="0.01"
                      placeholder="0.00"
                      aria-invalid={!!errors.price}
                      className="w-32"
                      {...register('price', { valueAsNumber: true })}
                    />
                    <span className="text-base font-semibold text-secondary">€</span>
                  </div>
                  <FieldError message={errors.price?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form-type" className="text-base font-bold text-secondary">
                    Categoría
                  </Label>
                  <select
                    data-testid="product-edit-cat-input"
                    id="form-type"
                    aria-invalid={!!errors.productTypeId}
                    {...register('productTypeId')}
                    className="appearance-none h-9 w-full rounded-md border border-input px-3 py-1 text-base shadow-sm focus:outline-none"
                  >
                    <option value="">Seleccionar categoría...</option>
                    {productTypes.data?.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.productTypeId?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="form-discount" className="text-base font-bold text-secondary">
                    Descuento (Opcional)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      data-testid="product-edit-discount-input"
                      id="form-discount"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      placeholder="0"
                      aria-invalid={!!errors.discount}
                      className="w-32"
                      onKeyDown={(e) => {
                        if (e.key === '.' || e.key === ',') {
                          e.preventDefault();
                        }
                      }}
                      {...register('discount', { valueAsNumber: true })}
                    />
                    <span className="text-base font-semibold text-secondary">%</span>
                  </div>
                  <FieldError message={errors.discount?.message} />
                </div>
              </div>

              {apiError && <p className="text-sm font-bold text-destructive">{apiError}</p>}

              <div className="flex justify-center gap-4">
                <Button
                  type="submit"
                  className="mt-2 h-12 w-full bg-secondary text-base font-bold text-white hover:bg-dark-secondary md:w-1/3"
                  disabled={isSubmitting}
                  data-testid="product-edit-submit-button"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button
                  type="button"
                  data-testid="product-edit-cancel-button"
                  onClick={() => router.push(`/stores/${params.id}/products/${params.productId}`)}
                  className="mt-2 h-12 w-full bg-gray-400 text-base font-bold text-white hover:bg-gray-500 md:w-1/3"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </StoreOwnerGuard>
  );
}
