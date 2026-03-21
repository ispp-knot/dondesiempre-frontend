'use client';

import ErrorText from '@/components/dondeSiempre/ErrorText';
import ImageUpload from '@/components/dondeSiempre/ImageUpload';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { StoreOwnerGuard } from '@/components/guards/StoreOwnerGuard';
import { Button } from '@/components/ui/button';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { OutfitDTO, OutfitUpdateDTO } from '@/lib/types/outfits/outfitsDto';
import { convertPrice } from '@/lib/utils';
import { redirect, useParams } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { FaTag } from 'react-icons/fa6';
import ClientOutfitDetailsPage from './ClientOutfitDetailsPage';

export default function OutfitDetailsPage() {
  const params = useParams<{ id: string; outfitId: string }>();

  const [imageFile, setImageFile] = useState<File | null>(null);

  const outfit = usePassiveFetcher<OutfitDTO>({ url: `outfits/${params.outfitId}` });
  const updateOutfit = useActiveFetcher<OutfitDTO>({
    url: `outfits/${params.outfitId}`,
    method: 'PUT',
  });
  const addTag = useActiveFetcher<void>({
    url: `outfits/${params.outfitId}/tags`,
    method: 'POST',
  });
  const removeTag = useActiveFetcher<void>({
    url: `outfits/${params.outfitId}/tags`,
    method: 'DELETE',
  });

  if (outfit.isLoading) {
    return <LoadingText />;
  }

  if (outfit.isError) {
    return <ErrorText error={outfit.error} />;
  }

  const submitForm = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!outfit.data) {
      return;
    }

    const dto: OutfitUpdateDTO = {
      name: (document.getElementById('form-name') as HTMLInputElement).value,
      description: (document.getElementById('form-description') as HTMLInputElement).value || null,
      discountedPriceInCents:
        Number.parseFloat(
          (document.getElementById('form-discounted-price') as HTMLInputElement).value
        ) * 100,
    };

    await updateOutfit.fetch({
      formPayload: {
        dto: new Blob([JSON.stringify(dto)], { type: 'application/json' }),
        image: imageFile ?? undefined,
      },
    });
    redirect(`/stores/${params.id}/outfits`);
  };

  const renderClientPage = (): ReactNode => {
    return <ClientOutfitDetailsPage outfit={outfit.data} />;
  };

  return (
    <StoreOwnerGuard
      storeId={params.id}
      fallbackWhenLoggedOut={renderClientPage()}
      fallbackWhenNotStore={renderClientPage()}
      fallbackWhenNotStoreOwner={renderClientPage()}
    >
      <div className="flex flex-col items-center relative">
        {outfit.data ? (
          <>
            <h1 className="mb-8 font-bold text-primary text-center text-3xl">Editar outfit</h1>
            <form
              action={`/stores/${params.id}/outfits`}
              method="GET"
              onSubmit={submitForm}
              className="w-10/12"
            >
              <div className="flex flex-col gap-4">
                <label htmlFor="form-name" className="font-bold text-lg text-secondary">
                  Nombre:{' '}
                </label>
                <input
                  type="text"
                  name="name"
                  id="form-name"
                  minLength={1}
                  maxLength={255}
                  defaultValue={outfit.data.name}
                  required
                  className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                />
                <label htmlFor="form-description" className="font-bold text-lg text-secondary">
                  Descripción:{' '}
                </label>
                <input
                  type="text"
                  name="description"
                  minLength={0}
                  maxLength={5000}
                  defaultValue={outfit.data.description || ''}
                  id="form-description"
                  className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                />
                <label className="font-bold text-lg text-secondary">Imagen:</label>
                <ImageUpload
                  onChange={setImageFile}
                  existingImageUrl={outfit.data.image || undefined}
                />
                <label htmlFor="form-discounted-price" className="font-bold text-lg text-secondary">
                  Precio rebajado:{' '}
                </label>
                <input
                  type="number"
                  name="discounted-price"
                  id="form-discounted-price"
                  min="0.00"
                  step="0.01"
                  defaultValue={`${convertPrice(outfit.data.discountedPriceInCents)}`}
                  required
                  className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                />
                <label htmlFor="form-tags" className="font-bold text-lg text-secondary">
                  Etiquetas:{' '}
                </label>
                <input
                  type="text"
                  name="tags"
                  id="form-tags"
                  onChange={async () => {
                    const element = document.getElementById('form-tags') as HTMLInputElement;

                    if (element.value.includes(' ')) {
                      await addTag.fetch({ body: element.value.trim() });
                      element.value = '';
                      outfit.refetch();
                    }
                  }}
                  className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex flex-row gap-4 flex-wrap">
                {outfit.data.tags.map((t, i) => (
                  <Button
                    key={i}
                    type="button"
                    onClick={async () => {
                      await removeTag.fetch({ body: t });
                      outfit.refetch();
                    }}
                    className="p-2 rounded-lg bg-secondary hover:bg-dark-secondary flex flex-row gap-1 shrink-0"
                  >
                    <FaTag className="text-white"></FaTag>
                    <p className="font-bold text-white text-center text-xs">{t}</p>
                  </Button>
                ))}
              </div>
              <div className="flex flex-row justify-center mb-8">
                <Button
                  type="submit"
                  className="self-center bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md h-12 md:w-1/3 mt-8"
                >
                  Confirmar cambios
                </Button>
              </div>
            </form>
          </>
        ) : (
          <NotFoundText message="El outfit que buscas no existe..." />
        )}
      </div>
    </StoreOwnerGuard>
  );
}
