'use client';
import { ProductDTO } from '@/lib/types/products/productsDto';
import { Card } from '../ui/card';
import { convertPrice, formatDisplayPrice } from '@/lib/utils';
import { RiDiscountPercentFill } from 'react-icons/ri';
import { Button } from '../ui/button';
import Image from 'next/image';
import Link from 'next/link';

export interface ProductCardProps {
  product: ProductDTO;
  isOwner: boolean;
  onDelete: () => void;
}

export default function ProductCard(props: ProductCardProps) {
  const product = props.product;
  const hasDiscount = product.discountedPriceInCents !== product.priceInCents;
  const formatPrice = (cents: number) => formatDisplayPrice(convertPrice(cents));

  return (
    <Card key={product.id} className="relative flex flex-col overflow-hidden shadow-xl pt-0">
      {hasDiscount && (
        <RiDiscountPercentFill className="absolute top-3 left-3 z-10 text-4xl text-primary drop-shadow" />
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
          {props.isOwner ? (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Link
                href={`/stores/${product.storeId}/products/${product.id}/edit`}
                className="flex items-center justify-center rounded-lg bg-secondary hover:bg-dark-secondary text-white font-bold text-sm h-10"
              >
                Editar
              </Link>
              <Button
                onClick={props.onDelete}
                className="flex items-center justify-center rounded-lg bg-primary hover:bg-dark-primary text-white font-bold text-sm h-10"
              >
                Eliminar
              </Button>
            </div>
          ) : (
            <Link
              href={`/stores/${product.storeId}/products/${product.id}`}
              className="mt-2 flex items-center justify-center rounded-lg bg-secondary hover:bg-dark-secondary text-white font-bold text-sm h-10"
            >
              Ver más
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
