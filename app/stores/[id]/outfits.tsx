'use client';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import OutfitCard from '@/components/dondeSiempre/OutfitCard';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { hasMinimumOutfitProducts } from '@/lib/types/outfits/outfitsRules';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import React from 'react';

type Props = {
  storeId?: string;
  outfits?: OutfitDTO[];
};

export default function Outfits({ storeId = undefined, outfits = [] }: Readonly<Props>) {
  const validOutfits = outfits.filter(hasMinimumOutfitProducts);
  const plugin = React.useRef(Autoplay({ delay: 2500, stopOnInteraction: true }));

  return (
    <div className="flex flex-col px-5 sm:w-10/12">
      <div className="flex flex-row items-center justify-between w-full mb-4">
        <h1 className="text-primary text-xl md:text-2xl font-bold">Nuestros outfits</h1>
        <Link href={`/stores/${storeId}/outfits`} className="text-secondary underline">
          Ver más
        </Link>
      </div>
      {validOutfits.length > 0 ? (
        <Carousel
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselPrevious className="hidden md:flex" />
          <CarouselContent>
            {validOutfits.map((out) => (
              <CarouselItem key={out.id}>
                <OutfitCard outfit={out} isOwner={false} onDelete={() => {}} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      ) : (
        <div className="flex justify-center py-8 w-full">
          <NotFoundText message="No se encontraron outfits con tu búsqueda" />
        </div>
      )}
    </div>
  );
}
