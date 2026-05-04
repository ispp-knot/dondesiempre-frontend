'use client';

import OutfitCard from '@/components/dondeSiempre/OutfitCard';
import SortableOutfitCard from '@/components/dondeSiempre/SortableOutfitCard';
import { StoreOwnerGuard } from '@/components/guards/StoreOwnerGuard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { OutfitDTO, OutfitSortDTO } from '@/lib/types/outfits/outfitsDto';
import { hasMinimumOutfitProducts } from '@/lib/types/outfits/outfitsRules';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { BiTransfer } from 'react-icons/bi';
import { FaRegSave } from 'react-icons/fa';
import { IoMdAddCircleOutline } from 'react-icons/io';
import LoadingText from '../../../../components/dondeSiempre/LoadingText';
import ClientOutfitsPage from './ClientOutfitsPage';
import { ErrorView } from '@/components/dondeSiempre/ErrorView';
import { BackButton } from '@/components/dondeSiempre/BackButton';
import GenericSuccessModal from '@/components/modals/GenericSuccessModal';

export default function OutfitsPage() {
  const params = useParams<{ id: string }>();
  const [cleanupStatus, setCleanupStatus] = useState<string | null>(null);
  const [cleanupError, setCleanupError] = useState<string | null>(null);
  const [isCleaningInvalidOutfits, setIsCleaningInvalidOutfits] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [success, setSuccess] = useState(false);

  const outfits = usePassiveFetcher<OutfitDTO[]>({ url: `stores/${params.id}/outfits` });
  const deleteOutfit = useActiveFetcher<void>({ method: 'DELETE' });
  const sortOutfits = useActiveFetcher<void>({
    url: `stores/${params.id}/outfits/sort`,
    method: 'PATCH',
  });

  if (outfits.isLoading) {
    return <LoadingText />;
  }

  if (outfits.isError) {
    return (
      <ErrorView
        title="Tienda no encontrada"
        description="No pudimos encontrar esta tienda. Puede que se haya eliminado o que el enlace ya no sea válido."
        buttonText="Volver atrás"
      />
    );
  }

  const validOutfits = (outfits.data ?? []).filter(hasMinimumOutfitProducts);
  const invalidOutfits = (outfits.data ?? []).filter((outfit) => !hasMinimumOutfitProducts(outfit));

  const deleteInvalidOutfits = async () => {
    setCleanupStatus(null);
    setCleanupError(null);
    setIsCleaningInvalidOutfits(true);

    try {
      for (const outfit of invalidOutfits) {
        await deleteOutfit.fetch({ url: `outfits/${outfit.id}` });
      }

      outfits.setData(validOutfits);
      setCleanupStatus(
        invalidOutfits.length === 1
          ? 'Se ha eliminado 1 outfit con una unica prenda.'
          : `Se han eliminado ${invalidOutfits.length} outfits con una unica prenda.`
      );
    } catch {
      setCleanupError('No se pudieron eliminar todos los outfits invalidos. Intentalo de nuevo.');
    } finally {
      setIsCleaningInvalidOutfits(false);
    }
  };

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
          <div className="w-full max-w-5xl px-4 md:px-10 pt-4">
            <BackButton />
          </div>
          <div className="w-full md:w-8/12">
            {invalidOutfits.length > 0 && (
              <Card className="m-4 space-y-4 border-destructive/30 bg-destructive/5 p-4 shadow-xl">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-primary">Outfits inválidos detectados</h2>
                  <p className="text-sm text-secondary">
                    Hay {invalidOutfits.length} outfit
                    {invalidOutfits.length === 1 ? '' : 's'} con única prenda. No deberían
                    mantenerse publicados.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {invalidOutfits.map((outfit) => outfit.name).join(', ')}
                  </p>
                </div>
                {cleanupStatus && <p className="text-sm text-secondary">{cleanupStatus}</p>}
                {cleanupError && <p className="text-sm text-destructive">{cleanupError}</p>}
                <Button
                  type="button"
                  onClick={() => void deleteInvalidOutfits()}
                  disabled={isCleaningInvalidOutfits || deleteOutfit.isPending}
                  className="bg-primary text-white hover:bg-dark-primary"
                >
                  {isCleaningInvalidOutfits
                    ? 'Eliminando outfits invalidos...'
                    : 'Eliminar outfits invalidos'}
                </Button>
              </Card>
            )}
            <div className="flex flex-col sm:flex-row justify-between w-full gap-2 p-4">
              <Link
                  href={`/stores/${params.id}/create-outfit/`}
                  className="self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl w-full h-12"
                  data-testid="create-outfit-button"
                >
                  <IoMdAddCircleOutline className="mt-0.5 text-white text-center text-2xl" />
                  <h1 className="font-bold text-white text-center text-xl">Crear outfit</h1>
                </Link>
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
                  <div className="flex flex-row gap-2" data-testid="outfit-sort-button">
                    <BiTransfer className="mt-0.5 text-white text-center text-2xl" />
                    <h1 className="font-bold text-white text-center text-xl">Ordenar</h1>
                  </div>
                </div>
              )}
            </div>
            {validOutfits.length > 0 && (
              <>
                {validOutfits.map((outfit, index) =>
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
                      onSuccess={() => setSuccess(true)}
                    />
                  )
                )}
              </>
            )}
          </div>
        </div>
      </DragDropProvider>
      {success && <GenericSuccessModal setOpenModal={setSuccess} />}
    </StoreOwnerGuard>
  );
}
