'use client';

import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import ProductCard from '@/components/dondeSiempre/ProductCard';
import { ProductDTO } from '@/lib/types/products/productsDto';
import { ReactNode } from 'react';

export interface ClientProductsPageProps {
  storeId: string;
  products?: ProductDTO[];
}

export default function ClientProductsPage(props: ClientProductsPageProps): ReactNode {
  const products = props.products;

  return (
    <div className="flex flex-col items-center">
      <div className="w-full md:w-8/12">
        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
            {products.map((product) => {
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  isOwner={false}
                  onDelete={() => {}}
                />
              );
            })}
          </div>
        ) : (
          <NotFoundText message="Esta tienda aún no tiene productos disponibles..." />
        )}
      </div>
    </div>
  );
}
