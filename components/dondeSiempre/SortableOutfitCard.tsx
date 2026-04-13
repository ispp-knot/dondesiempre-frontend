'use client';

import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { convertPrice, discountPrice, formatDisplayPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { RiDiscountPercentFill } from 'react-icons/ri';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useSortable } from '@dnd-kit/react/sortable';
import { MdDragIndicator } from 'react-icons/md';

export interface OutfitCardProps {
  index: number;
  outfit: OutfitDTO;
  onDelete: () => void;
}

export default function SortableOutfitCard(props: OutfitCardProps) {
  const { ref } = useSortable({ id: props.outfit.id, index: props.index });
  return (
    <Card
      key={props.outfit.id}
      ref={ref}
      className="relative p-4 m-4 pt-8 shadow-xl overflow-visible"
    >
      <MdDragIndicator className="absolute top-3 left-3 text-4xl" />
      {props.outfit.discountPercentage && (
        <RiDiscountPercentFill className="absolute top-3 right-3 text-4xl text-primary drop-shadow" />
      )}
      <h1 className="font-bold text-primary text-center text-3xl px-8 truncate">
        {props.outfit.name}
      </h1>
      <div className="flex flex-row w-fit max-w-11/12 self-center overflow-x-auto items-center gap-4 p-4">
        {props.outfit.products.map((p) => (
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
      {props.outfit.discountPercentage ? (
        <div className="flex flex-row self-center gap-3">
          <h1 className="text-primary text-center line-through text-3xl">
            {formatDisplayPrice(convertPrice(props.outfit.priceInCents))}
          </h1>
          <h1 className="font-bold text-primary text-center text-3xl">
            {formatDisplayPrice(
              discountPrice(props.outfit.priceInCents, props.outfit.discountPercentage)
            )}
          </h1>
        </div>
      ) : (
        <h1 className="font-bold text-primary text-center text-3xl">
          {formatDisplayPrice(convertPrice(props.outfit.priceInCents))}
        </h1>
      )}
      <div className="self-center grid grid-cols-3 w-11/12 gap-2">
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
    </Card>
  );
}
