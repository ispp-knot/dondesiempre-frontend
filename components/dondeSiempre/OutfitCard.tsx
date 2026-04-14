'use client';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { convertPrice, discountPrice, formatDisplayPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { RiDiscountPercentFill } from 'react-icons/ri';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export interface OutfitCardProps {
  outfit: OutfitDTO;
  isOwner: boolean;
  onDelete: () => void;
}

export default function OutfitCard(props: OutfitCardProps) {
  const outfit = props.outfit;
  const hasDiscount = !!outfit.discountPercentage;

  return (
    <Card
      className="relative flex flex-col gap-6 p-4 pt-8 shadow-xl overflow-hidden m-4"
      data-testid="outfit-card"
    >
      {hasDiscount && (
        <RiDiscountPercentFill className="absolute top-3 right-3 text-4xl text-primary drop-shadow" />
      )}
      <h2 className="font-bold text-primary text-center text-3xl px-8 truncate">{outfit.name}</h2>
      <div className="flex flex-row w-fit max-w-full self-center overflow-x-auto items-center gap-4 p-4">
        {outfit.products.map((p) => (
          <div key={p.id} className="rounded-2xl overflow-hidden shadow-md shrink-0">
            <Image
              src={p.image || '/static/img/product_placeholder.png'}
              alt={p.name}
              width={512}
              height={512}
              className="object-contain h-30 md:h-50 w-auto"
            />
          </div>
        ))}
      </div>
      <div className="flex flex-row items-baseline justify-center gap-3">
        {hasDiscount ? (
          <>
            <span className="text-3xl text-muted-foreground line-through">
              {formatDisplayPrice(convertPrice(outfit.priceInCents))}
            </span>
            <span className="text-3xl font-bold text-primary">
              {formatDisplayPrice(discountPrice(outfit.priceInCents, outfit.discountPercentage!))}
            </span>
          </>
        ) : (
          <span className="text-3xl font-bold text-primary">
            {formatDisplayPrice(convertPrice(outfit.priceInCents))}
          </span>
        )}
      </div>
      {props.isOwner ? (
        <div className="grid grid-cols-3 w-11/12 gap-2 self-center">
          <Link
            href={`/stores/${outfit.storeId}/outfits/${outfit.id}`}
            className="p-2 self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl w-full h-12"
            data-testid="outfit-edit-link"
          >
            Editar
          </Link>
          <Link
            href={`/stores/${outfit.storeId}/outfits/${outfit.id}/products`}
            className="p-2 self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl w-full h-12"
            data-testid="outfit-products-link"
          >
            Productos
          </Link>
          <Button
            onClick={props.onDelete}
            className="p-2 self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-primary hover:bg-dark-primary hover:cursor-pointer text-white font-bold text-md md:text-xl w-full h-12"
            data-testid="outfit-delete-button"
          >
            Eliminar
          </Button>
        </div>
      ) : (
        <Link
          href={`/stores/${outfit.storeId}/outfits/${outfit.id}`}
          className="p-2 self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl w-11/12 md:w-1/4 h-12"
        >
          Ver más
        </Link>
      )}
    </Card>
  );
}
