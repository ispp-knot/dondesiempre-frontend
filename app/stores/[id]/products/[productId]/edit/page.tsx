'use client';

import ErrorText from '@/components/dondeSiempre/ErrorText';
import ImageUpload from '@/components/dondeSiempre/ImageUpload';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import { StoreGuard } from '@/components/guards/StoreGuard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { ProductDTO } from '@/lib/types/products/productsDto';
import { ProductTypeDTO } from '@/lib/types/producttypes/productTypesDto';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface ProductUpdateDTO {
  name?: string;
  description?: string | null;
  priceInCents?: number;
  productTypeId?: string;
}

export default function ProductEditPage() {
  const params = useParams<{ id: string; productId: string }>();
  const router = useRouter();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<ProductUpdateDTO>({});

  const product = usePassiveFetcher<ProductDTO>({ url: `products/${params.productId}` });
  const productTypes = usePassiveFetcher<ProductTypeDTO[]>({ url: `product-types` });
  const updateProduct = useActiveFetcher<ProductDTO>({
    url: `products/${params.productId}`,
    method: 'PUT',
  });

  useEffect(() => {
    if (product.data) {
      setFormData({
        name: product.data.name,
        description: product.data.description,
        priceInCents: product.data.priceInCents,
        productTypeId: product.data.typeId,
      });
    }
  }, [product.data]);

  if (product.isLoading || productTypes.isLoading) {
    return <LoadingText />;
  }

  if (product.isError || productTypes.isError) {
    return (
      <>
        <ErrorText error={product.error} />
        <ErrorText error={productTypes.error} />
      </>
    );
  }

  if (!product.data) {
    return <ErrorText error={new Error('Producto no encontrado')} />;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'priceInCents' ? (value ? Number.parseInt(value) : undefined) : value || undefined,
    }));
  };

  const submitForm = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const dto: ProductUpdateDTO = {
      name: formData.name || undefined,
      description: formData.description || null,
      priceInCents: formData.priceInCents || undefined,
      productTypeId: formData.productTypeId || undefined,
    };

    await updateProduct.fetch({
      formPayload: {
        product: new Blob([JSON.stringify(dto)], { type: 'application/json' }),
        image: imageFile ?? undefined,
      },
    });

    if (!updateProduct.isError) {
      router.push(`/stores/${params.id}/products`);
    }
  };

  return (
    <StoreGuard redirectWhenNotStore={`/stores/${params.id}`}>
      <div className="flex flex-col items-center">
        <div className="w-full md:w-8/12">
          <Card className="p-4 pt-8 m-4 mb-8 shadow-xl">
            <h1 className="mb-3 font-bold text-primary text-center text-3xl">Editar producto</h1>
            <div className="w-full flex flex-col items-center">
              <form onSubmit={submitForm} className="w-10/12">
                <div className="flex flex-col gap-4">
                  <label htmlFor="form-name" className="font-bold text-lg text-secondary">
                    Nombre:{' '}
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="form-name"
                    minLength={1}
                    maxLength={255}
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    required
                    className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                  />
                  <label htmlFor="form-description" className="font-bold text-lg text-secondary">
                    Descripción:{' '}
                  </label>
                  <textarea
                    name="description"
                    minLength={0}
                    maxLength={5000}
                    id="form-description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline resize-vertical"
                    rows={4}
                  />
                  <label htmlFor="form-price" className="font-bold text-lg text-secondary">
                    Precio (en céntimos):{' '}
                  </label>
                  <input
                    type="number"
                    name="priceInCents"
                    id="form-price"
                    min="0"
                    step="1"
                    value={formData.priceInCents || ''}
                    onChange={handleInputChange}
                    required
                    className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                  />
                  <label htmlFor="form-type" className="font-bold text-lg text-secondary">
                    Tipo:{' '}
                  </label>
                  <select
                    name="productTypeId"
                    id="form-type"
                    value={formData.productTypeId || ''}
                    onChange={handleInputChange}
                    required
                    className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                  >
                    <option value="">Seleccionar tipo...</option>
                    {productTypes.data?.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <label className="font-bold text-lg text-secondary">Imagen:</label>
                  {product.data?.image && (
                    <div className="flex justify-center mb-4">
                      <img
                        src={product.data.image}
                        alt={product.data.name}
                        className="max-h-48 max-w-xs object-cover rounded-lg shadow-lg"
                      />
                    </div>
                  )}
                  <ImageUpload onChange={setImageFile} />
                </div>
                <div className="flex flex-row justify-center gap-4 mb-8">
                  <Button
                    type="submit"
                    className="self-center bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md h-12 md:w-1/3 mt-8"
                    disabled={updateProduct.isPending}
                  >
                    {updateProduct.isPending ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => router.push(`/stores/${params.id}/products`)}
                    className="self-center bg-gray-400 hover:bg-gray-500 hover:cursor-pointer text-white font-bold text-md h-12 md:w-1/3 mt-8"
                  >
                    Cancelar
                  </Button>
                </div>
                {updateProduct.isError && <ErrorText error={updateProduct.error} />}
              </form>
            </div>
          </Card>
        </div>
      </div>
    </StoreGuard>
  );
}
