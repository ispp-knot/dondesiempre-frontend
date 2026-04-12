'use client';

import * as React from 'react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { Edit2, ImagePlus } from 'lucide-react';

import AboutUs from './about-us';
import StoreImagesModal from './store-images-modal';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { StoreImageDTO } from '@/lib/types/stores/storesDto';

type Props = {
  description: string;
  images: StoreImageDTO[];
  isOwner: boolean;
  storeId: string;
  onImagesUpdated: (images: StoreImageDTO[]) => void;
};

export default function StoreAboutSection({
  description,
  images,
  isOwner,
  storeId,
  onImagesUpdated,
}: Props) {
  const [isImagesModalOpen, setIsImagesModalOpen] = React.useState(false);

  const plugin = React.useRef(Autoplay({ delay: 2500, stopOnInteraction: true }));

  const sortedImages = [...images]
    .filter((img) => !!img.image)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const hasImages = sortedImages.length > 0;

  return (
    <>
      <section className="w-full max-w-6xl mx-auto px-5 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-8 items-start">
          <div className="flex flex-col gap-4">
            {hasImages && (
              <Carousel
                plugins={[plugin.current]}
                className="w-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
              >
                <CarouselContent>
                  {sortedImages.map((img) => (
                    <CarouselItem key={img.id}>
                      <div className="relative h-[280px] w-full overflow-hidden rounded-xl">
                        <Image
                          src={img.image || '/static/img/banner.jpg'}
                          alt={`Imagen ${img.displayOrder + 1} de la tienda`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            )}

            {isOwner && (
              <Button type="button" onClick={() => setIsImagesModalOpen(true)}>
                {hasImages ? <Edit2 className="w-5 h-5" /> : <ImagePlus className="w-5 h-5" />}
                {hasImages ? 'Editar imágenes' : 'Añadir imágenes'}
              </Button>
            )}
          </div>

          <AboutUs description={description} />

          <div />
        </div>
      </section>

      {isOwner && (
        <StoreImagesModal
          open={isImagesModalOpen}
          onOpenChange={setIsImagesModalOpen}
          storeId={storeId}
          images={images}
          onUpdated={onImagesUpdated}
        />
      )}
    </>
  );
}
