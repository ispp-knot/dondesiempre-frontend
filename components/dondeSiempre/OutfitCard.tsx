'use client';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { convertPrice, discountPrice, formatPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { RiDiscountPercentFill } from 'react-icons/ri';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { buttonLinkClass } from '@/lib/utils/buttonLinkClass';

export interface OutfitCardProps {
  outfit: OutfitDTO;
  isOwner: boolean;
  onDelete: () => void;
}

export default function OutfitCard(props: OutfitCardProps) {
  const outfit = props.outfit;
  const hasDiscount = !!outfit.discountPercentage;

  return (
    <Card className="relative flex flex-col gap-6 p-4 pt-6 shadow-xl overflow-hidden m-4">
      {hasDiscount && (
        <RiDiscountPercentFill className="absolute top-3 left-3 text-4xl text-primary drop-shadow" />
      )}

      <h2 className="font-bold text-primary text-center text-2xl md:text-3xl px-8 truncate">
        {outfit.name}
      </h2>

      <div className="flex flex-row flex-nowrap justify-center gap-3 px-2">
        {outfit.products.map((p) => (
          <Image
            key={p.id}
            src={p.image || '/static/img/product_placeholder.png'}
            alt={p.name}
            width={512}
            height={512}
            className="w-24 h-24 md:w-55 md:h-55 object-contain shrink-0 rounded-lg drop-shadow-lg"
          />
        ))}
      </div>

      <div className="flex flex-row items-baseline justify-center gap-3">
        {hasDiscount ? (
          <>
            <span className="text-2xl md:text-3xl text-muted-foreground line-through">
              {formatPrice(convertPrice(outfit.priceInCents))}
            </span>
            <span className="text-2xl md:text-3xl font-bold text-primary">
              {formatPrice(discountPrice(outfit.priceInCents, outfit.discountPercentage!))}
            </span>
          </>
        ) : (
          <span className="text-2xl md:text-3xl font-bold text-primary">
            {formatPrice(convertPrice(outfit.priceInCents))}
          </span>
        )}
      </div>

      {props.isOwner ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Link
            href={`/stores/${outfit.storeId}/outfits/${outfit.id}`}
            className={`${buttonLinkClass} bg-secondary hover:bg-dark-secondary`}
          >
            Editar
          </Link>
          <Link
            href={`/stores/${outfit.storeId}/outfits/${outfit.id}/products`}
            className={`${buttonLinkClass} bg-secondary hover:bg-dark-secondary`}
          >
            Productos
          </Link>
          <Button
            onClick={props.onDelete}
            className={`${buttonLinkClass} bg-primary hover:bg-dark-primary`}
          >
            Eliminar
          </Button>
        </div>
      ) : (
        <Link
          href={`/stores/${outfit.storeId}/outfits/${outfit.id}`}
          className={`${buttonLinkClass} self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl w-11/12 md:w-1/4 h-12`}
        >
          Ver más
        </Link>
      )}
    </Card>
  );
}
