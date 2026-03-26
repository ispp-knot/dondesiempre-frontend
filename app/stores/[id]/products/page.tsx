'use client';

import { Card } from '@/components/ui/card';
import { usePassiveFetcher, useActiveFetcher } from '@/lib/api/fetcher';
import { ProductDTO } from '@/lib/types/products/productsDto';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ReactNode } from 'react';
import { IoMdAddCircleOutline } from 'react-icons/io';
import ErrorText from '../../../../components/dondeSiempre/ErrorText';
import LoadingText from '../../../../components/dondeSiempre/LoadingText';
import ProductCard from '@/components/dondeSiempre/ProductCard';
import { StoreOwnerGuard } from '@/components/guards/StoreOwnerGuard';
import ClientProductsPage from './ClientProductsPage';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';

export default function ProductsPage() {
  const params = useParams<{ id: string }>();

  const products = usePassiveFetcher<ProductDTO[]>({ url: `stores/${params.id}/products` });
  const deleteProduct = useActiveFetcher<void>({ method: 'DELETE' });

  if (products.isLoading) {
    return <LoadingText />;
  } else if (products.isError) {
    return <ErrorText error={products.error} />;
  }

  const renderClientPage = (): ReactNode => {
    return <ClientProductsPage storeId={params.id} products={products.data} />;
  };

  return (
    <StoreOwnerGuard
      storeId={params.id}
      fallbackWhenLoggedOut={renderClientPage()}
      fallbackWhenNotStore={renderClientPage()}
      fallbackWhenNotStoreOwner={renderClientPage()}
    >
      <div className="flex flex-col items-center">
        <div className="w-full md:w-8/12">
          <Link href={`/stores/${params.id}/create-product/`}>
            <Card className="p-4 m-4 shadow-xl hover:bg-muted active:bg-input hover:cursor-pointer">
              <div className="p-4 border-4 border-dashed border-secondary rounded-lg flex flex-row justify-center gap-4">
                <IoMdAddCircleOutline className="mt-8 mb-8 text-secondary text-center text-4xl" />
                <h1 className="mt-8 mb-8 font-bold text-secondary text-center text-3xl">
                  Crear producto
                </h1>
              </div>
            </Card>
          </Link>
          {products.data && products.data.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
              {products.data.map((product) => {
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isOwner={true}
                    onDelete={async () => {
                      await deleteProduct.fetch({ url: `products/${product.id}` });
                      products.refetch();
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <NotFoundText message="Aún no tienes productos disponibles..." />
          )}
        </div>
      </div>
    </StoreOwnerGuard>
  );
}
