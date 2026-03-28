'use client';
import HorizontalScroll from '@/components/dondeSiempre/HorizontalScroll';
import { usePassiveFetcher } from '@/lib/api/fetcher';
import { ProductDTO } from '@/lib/types/products/productsDto';
import { Percent } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  storeId?: string;
  products?: ProductDTO[];
};

export default function Products({ storeId = undefined }: Readonly<Props>) {
  const products = usePassiveFetcher<ProductDTO[]>({ url: `stores/${storeId}/products` });

  return (
    <HorizontalScroll title="Nuestros productos" viewMoreHref={`/stores/${storeId}/products`}>
      {products.data?.map((product) => {
        const hasDiscount = product.discountedPriceInCents !== product.priceInCents;
        const discountPct = hasDiscount
          ? (
              ((product.priceInCents - product.discountedPriceInCents) / product.priceInCents) *
              100
            ).toFixed(0)
          : null;
        const formatPrice = (cents: number) =>
          (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

        return (
          <Link
            href={`/stores/${storeId}/products/${product.id}`}
            key={product.id}
            className="relative flex flex-col shrink-0 border-2 border-gray-200 w-[42%] md:w-[22%] rounded-lg shadow-sm overflow-hidden"
          >
            <div className="w-full h-52 sm:h-60 md:h-72 relative">
              <Image
                src={product.image || '/static/img/product_placeholder.png'}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
            {hasDiscount && (
              <div className="absolute top-2 left-2 bg-primary rounded-full p-0.5 md:p-1 flex items-center justify-center shadow-md">
                <Percent className="w-4 h-4 md:w-5 md:h-5 text-white stroke-3" />
              </div>
            )}

            <div className="flex flex-col w-full self-end bg-white px-3 py-2.5 gap-1">
              <span className="truncate text-sm md:text-base font-medium">{product.name}</span>

              {product.description && (
                <span className="text-xs text-gray-500 line-clamp-2 leading-snug">
                  {product.description}
                </span>
              )}

              <div className="flex flex-row items-center justify-between gap-2 mt-1">
                <div className="flex items-baseline gap-1.5">
                  {hasDiscount && (
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(product.priceInCents)}
                    </span>
                  )}
                  <span
                    className={`text-sm font-semibold ${hasDiscount ? 'text-primary' : 'text-gray-800'}`}
                  >
                    {formatPrice(product.discountedPriceInCents)}
                  </span>
                </div>

                {hasDiscount && (
                  <span className="text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded-md text-xs shrink-0">
                    -{discountPct}%
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </HorizontalScroll>
  );
}
