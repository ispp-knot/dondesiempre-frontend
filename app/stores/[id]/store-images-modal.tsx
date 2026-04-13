'use client';

import * as React from 'react';
import Image from 'next/image';
import { z } from 'zod';
import { Trash2, ChevronUp, ChevronDown, ImagePlus, Loader2 } from 'lucide-react';

import { useActiveFetcher } from '@/lib/api/fetcher';
import { StoreImageDTO } from '@/lib/types/stores/storesDto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const MAX_IMAGES = 5;

const imageSchema = z.object({
  image: z.string().trim().url('Introduce una URL válida para la imagen.'),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  images: StoreImageDTO[];
  onUpdated: (images: StoreImageDTO[]) => void;
};

export default function StoreImagesModal({
  open,
  onOpenChange,
  storeId,
  images,
  onUpdated,
}: Props) {
  const [localImages, setLocalImages] = React.useState<StoreImageDTO[]>([]);
  const [newUrl, setNewUrl] = React.useState('');
  const [addError, setAddError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  React.useEffect(() => {
    if (open) {
      const sorted = [...images]
        .filter((img) => !!img.image)
        .sort((a, b) => a.displayOrder - b.displayOrder);

      setLocalImages(sorted);
      setNewUrl('');
      setAddError(null);
      setStatus(null);
    }
  }, [open, images]);

  const addImage = useActiveFetcher<StoreImageDTO>({
    url: `stores/${storeId}/images`,
    method: 'POST',
  });

  const updateImage = useActiveFetcher<StoreImageDTO>({
    method: 'PUT',
  });

  const deleteImage = useActiveFetcher<void>({
    method: 'DELETE',
  });

  const canAdd = localImages.length < MAX_IMAGES;

  const handleAdd = async () => {
    const result = imageSchema.safeParse({ image: newUrl });

    if (!result.success) {
      setAddError(result.error.issues[0].message);
      return;
    }

    if (!canAdd) {
      setStatus({
        type: 'error',
        message: `Has alcanzado el límite de ${MAX_IMAGES} imágenes.`,
      });
      return;
    }

    setAddError(null);

    try {
      const response = await addImage.fetch({
        body: {
          image: newUrl,
          displayOrder: localImages.length,
        },
      });

      const normalizedCreated = {
        ...response,
        id: response?.id ?? crypto.randomUUID(),
        image: response?.image ?? newUrl,
        displayOrder:
          typeof response?.displayOrder === 'number' ? response.displayOrder : localImages.length,
      } as StoreImageDTO;

      const next = [...localImages, normalizedCreated].sort(
        (a, b) => a.displayOrder - b.displayOrder
      );

      setLocalImages(next);
      onUpdated(next);

      setNewUrl('');
      setStatus({ type: 'success', message: 'Imagen añadida correctamente.' });
    } catch {
      setStatus({
        type: 'error',
        message: 'Error añadiendo imagen.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteImage.fetch({
        url: `stores/${storeId}/images/${id}`,
      });

      const next = localImages
        .filter((img) => img.id !== id)
        .map((img, index) => ({
          ...img,
          displayOrder: index,
        }));

      setLocalImages(next);
      onUpdated(next);
      setStatus({ type: 'success', message: 'Imagen eliminada correctamente.' });
    } catch {
      setStatus({
        type: 'error',
        message: 'Error eliminando imagen.',
      });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= localImages.length) return;

    const reordered = [...localImages];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];

    const next = reordered.map((img, i) => ({
      ...img,
      displayOrder: i,
    }));

    const movedImage = next[index];
    const swappedImage = next[targetIndex];

    setLocalImages(next);
    onUpdated(next);

    try {
      await Promise.all([
        updateImage.fetch({
          url: `stores/${storeId}/images/${movedImage.id}`,
          body: {
            image: movedImage.image,
            displayOrder: movedImage.displayOrder,
          },
        }),
        updateImage.fetch({
          url: `stores/${storeId}/images/${swappedImage.id}`,
          body: {
            image: swappedImage.image,
            displayOrder: swappedImage.displayOrder,
          },
        }),
      ]);

      setStatus({ type: 'success', message: 'Orden actualizado correctamente.' });
    } catch {
      setStatus({
        type: 'error',
        message: 'Error actualizando el orden de las imágenes.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[700px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-primary">
            {' '}
            Gestiona las imágenes del &apos;Sobre nosotros&apos;{' '}
          </DialogTitle>
        </DialogHeader>

        {status && (
          <div
            className={`rounded-md p-3 text-sm ${
              status.type === 'error'
                ? 'border border-red-300 bg-red-50 text-red-700'
                : 'border border-green-300 bg-green-50 text-green-700'
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="flex w-full min-w-0 flex-col gap-4">
          {localImages.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Todavía no hay imágenes. Añade la primera a continuación.
            </div>
          ) : (
            localImages.map((img, index) => (
              <div
                key={img.id}
                className="flex w-full min-w-0 items-stretch gap-3 overflow-hidden rounded-lg border bg-muted/20 px-3"
              >
                <div className="relative w-24 self-stretch overflow-hidden bg-muted shrink-0">
                  <Image
                    src={img.image || '/static/img/banner.jpg'}
                    alt={`Imagen ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="flex min-w-0 flex-1 items-center overflow-hidden">
                  <p className="truncate text-sm text-muted-foreground">{img.image}</p>
                </div>

                <span className="flex w-8 shrink-0 text-center text-s items-center font-semibold text-muted-foreground">
                  #{index + 1}
                </span>

                <div className="flex flex-col shrink-0">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0 || updateImage.isPending}
                    title="Mover arriba"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === localImages.length - 1 || updateImage.isPending}
                    title="Mover abajo"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  type="button"
                  size="icon"
                  className="bg-primary hover:opacity-90 text-white shrink-0 self-center"
                  onClick={() => handleDelete(img.id)}
                  disabled={deleteImage.isPending}
                  title="Eliminar imagen"
                >
                  {deleteImage.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))
          )}

          {canAdd ? (
            <div className="rounded-lg border bg-muted/10 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <ImagePlus className="h-4 w-4" />
                Añadir imagen ({localImages.length}/{MAX_IMAGES})
              </div>

              <div className="flex w-full min-w-0 gap-2">
                <Input
                  className="min-w-0 flex-1"
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => {
                    setNewUrl(e.target.value);
                    setAddError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      void handleAdd();
                    }
                  }}
                  aria-invalid={!!addError}
                />

                <Button
                  type="button"
                  onClick={handleAdd}
                  disabled={addImage.isPending || !newUrl.trim()}
                  className="shrink-0"
                >
                  {addImage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Añadir'}
                </Button>
              </div>

              {addError && <p className="mt-2 text-xs text-destructive">{addError}</p>}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Has alcanzado el límite de {MAX_IMAGES} imágenes.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
