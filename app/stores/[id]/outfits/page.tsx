'use client';

import LabelledSwitch from '@/components/dondeSiempre/LabelledSwitch';
import OutfitCard from '@/components/dondeSiempre/OutfitCard';
import SortableOutfitCard from '@/components/dondeSiempre/SortableOutfitCard';
import { StoreGuard } from '@/components/guards/StoreGuard';
import { Card } from '@/components/ui/card';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { OutfitDTO, OutfitSortDTO } from '@/lib/types/outfits/outfitsDto';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { IoMdAddCircleOutline } from 'react-icons/io';
import ErrorText from '../../../../components/dondeSiempre/ErrorText';
import LoadingText from '../../../../components/dondeSiempre/LoadingText';
import ClientOutfitsPage from './ClientOutfitsPage';

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

  const renderClientOutfits = (): ReactNode => {
    return <ClientOutfitsPage storeId={params.id} outfits={outfits.data} />;
  };

  return (
    <StoreGuard
      fallbackWhenNotStore={renderClientOutfits()}
      fallbackWhenLoggedOut={renderClientOutfits()}
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
        <LabelledSwitch
          label="Editar orden"
          checked={isOrdering}
          onCheckedChange={async (checked) => {
            if (!checked) {
              const dtos: OutfitSortDTO[] =
                outfits.data?.map((out) => {
                  return { id: out.id, index: out.index } as OutfitSortDTO;
                }) || [];
              await sortOutfits.fetch({ body: dtos });
              outfits.refetch();
            }
            setIsOrdering(checked);
          }}
        />
        <div className="flex flex-col items-center">
          <div className="w-full md:w-8/12">
            <Link href={`/stores/${params.id}/create-outfit/`}>
              <Card className="p-4 m-4 shadow-xl hover:bg-muted active:bg-input hover:cursor-pointer">
                <div className="p-4 border-4 border-dashed border-secondary rounded-lg flex flex-row justify-center gap-4">
                  <IoMdAddCircleOutline className="mt-8 mb-8 text-secondary text-center text-4xl" />
                  <h1 className="mt-8 mb-8 font-bold text-secondary text-center text-3xl">
                    Crear outfit
                  </h1>
                </div>
              </Card>
            </Link>
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
    </StoreGuard>
  );
}
