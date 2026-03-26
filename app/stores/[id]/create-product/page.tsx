'use client';

import ErrorText from '@/components/dondeSiempre/ErrorText';
import ImageUpload from '@/components/dondeSiempre/ImageUpload';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { ProductCreationDTO, ProductDTO } from '@/lib/types/products/productsDto';
import { ProductTypeDTO } from '@/lib/types/producttypes/productTypesDto';
import { createProductFormSchema, ProductFormValues } from '@/lib/types/products/productsRules';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export default function ProductCreationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [imageFile, setImageFile] = useState<File | null>(null);

  const productTypes = usePassiveFetcher<ProductTypeDTO[]>({ url: `product-types` });
  const createProduct = useActiveFetcher<ProductDTO>({
    url: `products?storeId=${params.id}`,
    method: 'POST',
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(createProductFormSchema()),
    defaultValues: {
      name: '',
      description: '',
      priceInCents: 0,
      productTypeId: '',
    },
  });

  if (productTypes.isLoading) {
    return <LoadingText />;
  }

  if (productTypes.isError) {
    return <ErrorText error={productTypes.error} />;
  }

  const submitForm = async (data: ProductFormValues) => {
    const dto: ProductCreationDTO = {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      typeId: data.productTypeId,
    };

    await createProduct.fetch({
      formPayload: {
        dto: new Blob([JSON.stringify(dto)], { type: 'application/json' }),
        image: imageFile ?? undefined,
      },
    });

    if (!createProduct.isError) {
      router.push(`/stores/${params.id}/products`);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full md:w-8/12">
        <Card className="p-4 pt-8 m-4 mb-8 shadow-xl">
          <h1 className="mb-3 font-bold text-primary text-center text-3xl">Crear producto</h1>
          <div className="w-full flex flex-col items-center">
            <form onSubmit={handleSubmit(submitForm)} className="w-10/12" noValidate>
              <div className="flex flex-col gap-4">
                <div className="space-y-1">
                  <Label htmlFor="form-name" className="font-bold text-lg text-secondary">
                    Nombre:{' '}
                  </Label>
                  <Input
                    type="text"
                    id="form-name"
                    minLength={1}
                    maxLength={255}
                    aria-invalid={!!errors.name}
                    {...register('name')}
                    className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                  />
                  <FieldError message={errors.name?.message} />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="form-description" className="font-bold text-lg text-secondary">
                    Descripción:{' '}
                  </Label>
                  <textarea
                    minLength={0}
                    maxLength={5000}
                    id="form-description"
                    {...register('description')}
                    className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline resize-vertical"
                    rows={4}
                  />
                  <FieldError message={errors.description?.message} />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="form-price" className="font-bold text-lg text-secondary">
                    Precio (en céntimos):{' '}
                  </Label>
                  <Input
                    type="number"
                    id="form-price"
                    min="0"
                    step="1"
                    aria-invalid={!!errors.priceInCents}
                    {...register('priceInCents', { valueAsNumber: true })}
                    className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                  />
                  <FieldError message={errors.priceInCents?.message} />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="form-type" className="font-bold text-lg text-secondary">
                    Tipo:{' '}
                  </Label>
                  <select
                    id="form-type"
                    aria-invalid={!!errors.productTypeId}
                    {...register('productTypeId')}
                    className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Seleccionar tipo...</option>
                    {productTypes.data?.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.productTypeId?.message} />
                </div>

                <div className="space-y-1">
                  <Label className="font-bold text-lg text-secondary">Imagen:</Label>
                  <ImageUpload onChange={setImageFile} />
                </div>
              </div>

              <div className="flex flex-row justify-center mb-8">
                <Button
                  type="submit"
                  className="self-center bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md h-12 md:w-1/3 mt-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creando...' : 'Crear producto'}
                </Button>
              </div>

              {createProduct.isError && <ErrorText error={createProduct.error} />}
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
