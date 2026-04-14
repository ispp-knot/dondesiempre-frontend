'use client';

import * as React from 'react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { Edit2, ImagePlus, Trash2, X, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import AboutUs from './about-us';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { StoreImageDTO } from '@/lib/types/stores/storesDto';
import ImageUpload from '@/components/dondeSiempre/ImageUpload';

type Props = {
  description: string;
  images: StoreImageDTO[];
  isOwner: boolean;
  storeId: string;
  onImagesUpdated: (images: StoreImageDTO[]) => void;
};

function SortableImage({
  img,
  index,
  onRemove,
}: {
  img: StoreImageDTO;
  index: number;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: img.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 border rounded-lg p-2 bg-white"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground">
        <GripVertical size={18} />
      </div>

      <div className="relative w-20 h-20 overflow-hidden rounded-md">
        <Image src={img.image} alt="" fill className="object-cover" unoptimized />
      </div>

      <div className="flex flex-col items-center justify-center min-w-[40px]">
        <span className="text-xs text-muted-foreground">#{index + 1}</span>
      </div>

      <button
        className="ml-auto text-red-500 hover:text-red-600 transition"
        onClick={() => onRemove(img.id)}
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

export default function StoreAboutSection({
  description,
  images,
  isOwner,
  onImagesUpdated,
}: Props) {
  const plugin = React.useRef(Autoplay({ delay: 2500, stopOnInteraction: true }));
  const [open, setOpen] = React.useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const sortedImages = [...images]
    .filter((img) => !!img.image)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const hasImages = sortedImages.length > 0;

  const syncImages = (list: StoreImageDTO[]) => {
    const normalized = list.map((img, index) => ({
      ...img,
      displayOrder: index,
    }));
    onImagesUpdated(normalized);
  };

  const addImage = (file: File | null) => {
    if (!file) return;
    if (images.length >= 5) return;

    const newImage: StoreImageDTO = {
      id: crypto.randomUUID(),
      image: URL.createObjectURL(file),
      displayOrder: images.length,
    };

    syncImages([...images, newImage]);
  };

  const removeImage = (id: string) => {
    syncImages(images.filter((img) => img.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((i) => i.id === active.id);
    const newIndex = images.findIndex((i) => i.id === over.id);

    syncImages(arrayMove(images, oldIndex, newIndex));
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-5">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-8 items-start">
        <div className="flex flex-col gap-4">
          {hasImages ? (
            <Carousel
              plugins={[plugin.current]}
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
            >
              <CarouselContent>
                {sortedImages.map((img) => (
                  <CarouselItem key={img.id}>
                    <div className="relative h-[280px] w-full overflow-hidden rounded-xl">
                      <Image
                        src={img.image}
                        alt="Store image"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          ) : (
            isOwner && (
              <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
                Esta tienda todavía no tiene imágenes.
              </div>
            )
          )}

          {isOwner && (
            <Button onClick={() => setOpen(true)}>
              {hasImages ? <Edit2 className="w-5 h-5" /> : <ImagePlus className="w-5 h-5" />}
              {hasImages ? 'Editar imágenes' : 'Añadir imágenes'}
            </Button>
          )}
        </div>

        <AboutUs description={description} />

        <div />
      </div>

      {isOwner && open && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl bg-white p-6 relative">
            <button className="absolute right-4 top-4" onClick={() => setOpen(false)}>
              <X />
            </button>

            <h2 className="text-lg font-semibold mb-1">Gestionar imágenes</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Puedes tener un máximo de 5 imágenes
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={images.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {images.map((img, index) => (
                      <SortableImage key={img.id} img={img} index={index} onRemove={removeImage} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {images.length < 5 && (
              <div className="mt-4">
                <ImageUpload
                  key={open ? 'upload-open' : 'upload-closed'}
                  mode="gallery"
                  onChange={addImage}
                />
              </div>
            )}

            {images.length >= 5 && (
              <p className="mt-3 text-sm text-amber-600">Has alcanzado el máximo de 5 imágenes</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
