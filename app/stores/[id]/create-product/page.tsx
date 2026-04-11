'use client';

import ErrorText from '@/components/dondeSiempre/ErrorText';
import ImageUpload from '@/components/dondeSiempre/ImageUpload';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { ProductCreationDTO, ProductDTO } from '@/lib/types/products/productsDto';
import { ProductTypeDTO } from '@/lib/types/producttypes/productTypesDto';
import { useParams, useRouter } from 'next/navigation';
import {
  createProductFormSchema,
  ProductFormValues,
  MAX_PRODUCT_NAME_LENGTH,
  MAX_PRODUCT_DESCRIPTION_LENGTH,
} from '@/lib/types/products/productsRules';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StoreOwnerGuard } from '@/components/guards/StoreOwnerGuard';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export default function ProductCreationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const productTypes = usePassiveFetcher<ProductTypeDTO[]>({ url: `product-types` });
  const createProduct = useActiveFetcher<ProductDTO>({
    url: `products?storeId=${params.id}`,
    method: 'POST',
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(createProductFormSchema()),
    defaultValues: {
      name: '',
      description: '',
      productTypeId: '',
    },
  });

  const nameValue = useWatch({ control, name: 'name' }) ?? '';
  const descriptionValue = useWatch({ control, name: 'description' }) ?? '';

  if (productTypes.isLoading) {
    return <LoadingText />;
  }

  if (productTypes.isError) {
    return <ErrorText error={productTypes.error} />;
  }

  const submitForm = async (data: ProductFormValues) => {
    setApiError(null);
    const dto: ProductCreationDTO = {
      name: data.name,
      description: data.description,
      priceInCents: Math.round(data.price * 100),
      typeId: data.productTypeId,
    };

    try {
      await createProduct.fetch({
        formPayload: {
          dto: new Blob([JSON.stringify(dto)], { type: 'application/json' }),
          image: imageFile ?? undefined,
        },
      });

      if (!createProduct.isError) {
        router.push(`/stores/${params.id}`);
      } else {
        setApiError('Hubo un error al crear el producto. Por favor, intenta de nuevo.');
      }
    } catch (_err: unknown) {
      setApiError('Hubo un error al crear el producto. Por favor, intenta de nuevo.');
    }
  };

  return (
    <StoreOwnerGuard storeId={params.id}>
      <div className="flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-6xl">
          <Card className="p-4 shadow-xl sm:p-6 md:p-8">
            <h1 className="mb-6 text-center text-3xl font-bold text-primary">Crear producto</h1>

            <form onSubmit={handleSubmit(submitForm)} className="space-y-6" noValidate>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="form-name" className="text-base font-bold text-secondary">
                    Nombre
                  </Label>
                  <Input
                    id="form-name"
                    type="text"
                    maxLength={255}
                    aria-invalid={!!errors.name}
                    {...register('name')}
                  />
                  <div className="flex justify-between">
                    <FieldError message={errors.name?.message} />
                    <p className="shrink-0 text-xs text-muted-foreground">
                      {nameValue.length}/{MAX_PRODUCT_NAME_LENGTH}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="form-description" className="text-base font-bold text-secondary">
                    Descripción
                  </Label>
                  <Textarea
                    id="form-description"
                    maxLength={5000}
                    rows={5}
                    aria-invalid={!!errors.description}
                    className="resize-y"
                    {...register('description')}
                  />
                  <div className="flex justify-between">
                    <FieldError message={errors.description?.message} />
                    <p className="shrink-0 text-xs text-muted-foreground">
                      {descriptionValue.length}/{MAX_PRODUCT_DESCRIPTION_LENGTH}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="form-image" className="text-base font-bold text-secondary">
                    Imagen
                  </Label>
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
                    id="form-type"
                    aria-invalid={!!errors.productTypeId}
                    {...register('productTypeId')}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              </div>

              {apiError && <p className="text-sm text-destructive">{apiError}</p>}

              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="mt-2 h-12 w-full bg-secondary text-base font-bold text-white hover:bg-dark-secondary md:w-1/3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creando...' : 'Crear producto'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </StoreOwnerGuard>
  );
}
