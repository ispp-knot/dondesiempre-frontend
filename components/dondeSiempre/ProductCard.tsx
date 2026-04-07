'use client';
import { ProductDTO } from '@/lib/types/products/productsDto';
import { Card } from '../ui/card';
import { convertPrice, formatDisplayPrice } from '@/lib/utils';
import { RiDiscountPercentFill } from 'react-icons/ri';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export interface ProductCardProps {
  product: ProductDTO;
}

export default function ProductCard(props: ProductCardProps) {
  const product = props.product;
  const hasDiscount = product.discountedPriceInCents !== product.priceInCents;
  const formatPrice = (cents: number) => formatDisplayPrice(convertPrice(cents));
  const router = useRouter();

  return (
    <Card
      className="relative flex flex-col overflow-hidden shadow-sm pt-0 w-full py-0 cursor-pointer"
      onClick={() => router.push(`/stores/${product.storeId}/products/${product.id}`)}
    >
      {hasDiscount && (
        <div className="absolute top-2 left-2 z-10 bg-primary rounded-full p-0.5 md:p-1 flex items-center justify-center shadow-md">
          <RiDiscountPercentFill className="text-3xl text-white" />
        </div>
      )}

      <div className="relative w-full h-52 sm:h-64 md:h-72 shrink-0">
        <Image
          src={product.image || '/static/img/product_placeholder.png'}
          alt={product.name}
          fill
          className="object-contain"
        />
      </div>

      <div className="flex flex-col flex-1 p-3 gap-1.5">
        <h2 className="font-bold text-primary text-lg md:text-xl truncate">{product.name}</h2>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-snug min-h-[2.5rem]">
          {product.description ?? ''}
        </p>
        <div className="mt-auto pt-1">
          {hasDiscount ? (
            <div className="flex flex-row items-baseline gap-2">
              <span className="text-base line-through text-muted-foreground">
                {formatPrice(product.priceInCents)}
              </span>
              <span className="text-xl font-bold text-primary">
                {formatPrice(product.discountedPriceInCents)}
              </span>
            </div>
          ) : (
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.priceInCents)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
