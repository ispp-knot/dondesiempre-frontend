'use client';

import OutfitCard from '@/components/dondeSiempre/OutfitCard';
import SortableOutfitCard from '@/components/dondeSiempre/SortableOutfitCard';
import { StoreOwnerGuard } from '@/components/guards/StoreOwnerGuard';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { OutfitDTO, OutfitSortDTO } from '@/lib/types/outfits/outfitsDto';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { FaRegSave } from 'react-icons/fa';
import { IoMdAddCircleOutline } from 'react-icons/io';
import ErrorText from '../../../../components/dondeSiempre/ErrorText';
import LoadingText from '../../../../components/dondeSiempre/LoadingText';
import ClientOutfitsPage from './ClientOutfitsPage';
import { BiTransfer } from 'react-icons/bi';

export default function OutfitsPage() {
  const params = useParams<{ id: string }>();

  const [isOrdering, setIsOrdering] = useState(false);

  const outfits = usePassiveFetcher<OutfitDTO[]>({ url: `stores/${params.id}/outfits` });
  const deleteOutfit = useActiveFetcher<void>({ method: 'DELETE' });
  const sortOutfits = useActiveFetcher<void>({
    url: `stores/${params.id}/outfits/sort`,
    method: 'PATCH',
  });

  if (outfits.isLoading) {
    return <LoadingText />;
  } else if (outfits.isError) {
    return <ErrorText error={outfits.error} />;
  }

  const renderClientPage = (): ReactNode => {
    return <ClientOutfitsPage storeId={params.id} outfits={outfits.data} />;
  };

  return (
    <StoreOwnerGuard
      storeId={params.id}
      fallbackWhenLoggedOut={renderClientPage()}
      fallbackWhenNotStore={renderClientPage()}
      fallbackWhenNotStoreOwner={renderClientPage()}
    >
      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled) {
            return;
          }
          const ids = outfits.data?.map((out) => out.id) || [];
          const sorted = move(ids, event);

          outfits.setData(
            outfits.data
              ?.map((out) => {
                return {
                  ...out,
                  index: sorted.indexOf(out.id) >= 0 ? sorted.indexOf(out.id) : out.index,
                };
              })
              .sort((a, b) => a.index - b.index) || []
          );
        }}
      >
        <div className="flex flex-col items-center">
          <div className="w-full md:w-8/12">
            <div className="flex flex-row justify-between w-full gap-2 p-4">
              <div className="self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl w-full h-12">
                <Link href={`/stores/${params.id}/create-outfit/`} className="flex flex-row gap-2">
                  <IoMdAddCircleOutline className="mt-0.5 text-white text-center text-2xl" />
                  <h1 className="font-bold text-white text-center text-xl">Crear outfit</h1>
                </Link>
              </div>
              {isOrdering ? (
                <div
                  className="p-2 self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-primary hover:bg-dark-primary hover:cursor-pointer text-white font-bold text-md md:text-xl w-full h-12"
                  onClick={async () => {
                    setIsOrdering(false);

                    const dtos: OutfitSortDTO[] =
                      outfits.data?.map((out) => {
                        return { id: out.id, index: out.index } as OutfitSortDTO;
                      }) || [];
                    await sortOutfits.fetch({ body: dtos });
                    outfits.refetch();
                  }}
                >
                  <div className="flex flex-row gap-2">
                    <FaRegSave className="mt-0.5 text-white text-center text-2xl" />
                    <h1 className="font-bold text-white text-center text-xl">Guardar</h1>
                  </div>
                </div>
              ) : (
                <div
                  className="p-2 self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl w-full h-12"
                  onClick={async () => {
                    setIsOrdering(true);
                  }}
                >
                  <div className="flex flex-row gap-2">
                    <BiTransfer className="mt-0.5 text-white text-center text-2xl" />
                    <h1 className="font-bold text-white text-center text-xl">Ordenar</h1>
                  </div>
                </div>
              )}
            </div>
            {outfits.data && outfits.data.length > 0 && (
              <>
                {outfits.data.map((outfit, index) =>
                  isOrdering ? (
                    <SortableOutfitCard
                      key={outfit.id}
                      index={index}
                      outfit={outfit}
                      onDelete={async () => {
                        await deleteOutfit.fetch({ url: `outfits/${outfit.id}` });
                        outfits.refetch();
                      }}
                    />
                  ) : (
                    <OutfitCard
                      key={outfit.id}
                      outfit={outfit}
                      isOwner={true}
                      onDelete={async () => {
                        await deleteOutfit.fetch({ url: `outfits/${outfit.id}` });
                        outfits.refetch();
                      }}
                    />
                  )
                )}
              </>
            )}
          </div>
        </div>
      </DragDropProvider>
    </StoreOwnerGuard>
  );
}
