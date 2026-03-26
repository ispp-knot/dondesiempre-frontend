'use client';

import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { convertPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { RiDiscountPercentFill } from 'react-icons/ri';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { discountPrice } from '@/lib/utils';

export interface OutfitCardProps {
  outfit: OutfitDTO;
  isOwner: boolean;
  onDelete: () => void;
}

export default function OutfitCard(props: OutfitCardProps) {
  return (
    <Card key={props.outfit.id} className="p-4 m-4 pt-8 shadow-xl">
      <div className="flex flex-row justify-between ps-4 pe-4">
        <div></div>
        <h1 className="mb-3 font-bold text-primary text-center text-3xl">{props.outfit.name}</h1>
        {props.outfit.discountPercentage ? (
          <RiDiscountPercentFill className="text-4xl" />
        ) : (
          <div></div>
        )}
      </div>
      <div className="flex flex-row w-fit max-w-11/12 self-center overflow-x-auto items-center gap-4 p-4">
        {props.outfit.products.map((p) => (
          <Image
            key={p.id}
            src={p.image || '/static/img/product_placeholder.png'}
            alt={p.name}
            width={512}
            height={512}
            className="w-30 h-30 md:w-50 md:h-50 object-cover shrink-0 rounded-lg shadow-lg"
          />
        ))}
      </div>
      {props.outfit.discountPercentage ? (
        <div className="flex flex-row self-center gap-3">
          <h1 className="text-primary text-center line-through text-3xl">
            {`${convertPrice(props.outfit.priceInCents).toFixed(2).toString().replace('.', ',')}€`}
          </h1>
          <h1 className="font-bold text-primary text-center text-3xl">
            {`${discountPrice(props.outfit.priceInCents, props.outfit.discountPercentage).toFixed(2).toString().replace('.', ',')}€`}
          </h1>
        </div>
      ) : (
        <h1 className="font-bold text-primary text-center text-3xl">
          {`${convertPrice(props.outfit.priceInCents).toFixed(2).toString().replace('.', ',')}€`}
        </h1>
      )}
      {props.isOwner ? (
        <div className="self-center grid grid-cols-1 sm:grid-cols-3 w-11/12 gap-2">
          <Link
            href={`/stores/${props.outfit.storeId}/outfits/${props.outfit.id}`}
            className="p-2 self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl w-full h-12"
          >
            Editar
          </Link>
          <Link
            href={`/stores/${props.outfit.storeId}/outfits/${props.outfit.id}/products`}
            className="p-2 self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl w-full h-12"
          >
            Productos
          </Link>
          <Button
            onClick={props.onDelete}
            className="p-2 self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-primary hover:bg-dark-primary hover:cursor-pointer text-white font-bold text-md md:text-xl w-full h-12"
          >
            Eliminar
          </Button>
        </div>
      ) : (
        <Link
          href={`/stores/${props.outfit.storeId}/outfits/${props.outfit.id}`}
          className="self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl w-11/12 md:w-1/4 h-12"
        >
          Ver más
        </Link>
      )}
    </Card>
  );
}
