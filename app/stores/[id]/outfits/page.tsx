'use client';

import LabelledSwitch from '@/components/dondeSiempre/LabelledSwitch';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { hasMinimumOutfitProducts } from '@/lib/types/outfits/outfitsRules';
import { convertPrice, getOutfitDisplayPrice, outfitWithDiscount } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { RiDiscountPercentFill } from 'react-icons/ri';
import ErrorText from '../../../../components/dondeSiempre/ErrorText';
import LoadingText from '../../../../components/dondeSiempre/LoadingText';

export default function OutfitsPage() {
  const params = useParams<{ id: string }>();
  const [isAdmin, setIsAdmin] = useState(false);
  const [cleanupStatus, setCleanupStatus] = useState<string | null>(null);
  const [cleanupError, setCleanupError] = useState<string | null>(null);
  const [isCleaningInvalidOutfits, setIsCleaningInvalidOutfits] = useState(false);

  const outfits = usePassiveFetcher<OutfitDTO[]>({ url: `stores/${params.id}/outfits` });
  const deleteOutfit = useActiveFetcher<void>({ method: 'DELETE' });

  if (outfits.isLoading) {
    return <LoadingText />;
  }

  if (outfits.isError) {
    return <ErrorText error={outfits.error} />;
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

  return (
    <>
      <LabelledSwitch
        label="Modo tienda"
        checked={isAdmin}
        onCheckedChange={(checked) => setIsAdmin(checked)}
      />
      <div className="flex flex-col items-center">
        <div className="w-full md:w-8/12">
          {isAdmin && invalidOutfits.length > 0 && (
            <Card className="m-4 space-y-4 border-destructive/30 bg-destructive/5 p-4 shadow-xl">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-primary">Outfits invalidos detectados</h2>
                <p className="text-sm text-secondary">
                  Hay {invalidOutfits.length} outfit
                  {invalidOutfits.length === 1 ? '' : 's'} con una unica prenda. No deberian
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

          {isAdmin ? (
            <Link href={`/stores/${params.id}/create-outfit/`}>
              <Card className="m-4 p-4 shadow-xl hover:cursor-pointer hover:bg-muted active:bg-input">
                <div className="flex flex-row justify-center gap-4 rounded-lg border-4 border-dashed border-secondary p-4">
                  <IoMdAddCircleOutline className="mb-8 mt-8 text-center text-4xl text-secondary" />
                  <h1 className="mb-8 mt-8 text-center text-3xl font-bold text-secondary">
                    Crear outfit
                  </h1>
                </div>
              </Card>
            </Link>
          ) : null}

          {validOutfits.length > 0 ? (
            <>
              {validOutfits.map((outfit) => (
                <Card key={outfit.id} className="m-4 p-4 pt-8 shadow-xl">
                  <div>
                    {outfitWithDiscount(outfit) ? (
                      <RiDiscountPercentFill className="text-4xl" />
                    ) : null}
                    <h1 className="mb-3 text-center text-3xl font-bold text-primary">
                      {outfit.name}
                    </h1>
                  </div>

                  <div className="flex w-fit max-w-11/12 flex-row items-center gap-4 self-center overflow-x-auto p-4">
                    {outfit.products.map((product) => (
                      <Image
                        key={product.id}
                        src={product.image || '/static/img/product_placeholder.png'}
                        alt={product.name}
                        width={512}
                        height={512}
                        className="h-30 w-30 shrink-0 rounded-lg object-cover shadow-lg md:h-50 md:w-50"
                      />
                    ))}
                  </div>

                  {!outfitWithDiscount(outfit) ? (
                    <h1 className="text-center text-3xl font-bold text-primary">
                      {`${convertPrice(outfit.priceInCents).toFixed(2).replace('.', ',')}EUR`}
                    </h1>
                  ) : (
                    <div className="flex flex-row gap-3 self-center">
                      <h1 className="text-center text-3xl text-primary line-through">
                        {`${convertPrice(outfit.priceInCents).toFixed(2).replace('.', ',')}EUR`}
                      </h1>
                      <h1 className="text-center text-3xl font-bold text-primary">
                        {`${getOutfitDisplayPrice(outfit).toFixed(2).replace('.', ',')}EUR`}
                      </h1>
                    </div>
                  )}

                  {isAdmin ? (
                    <div className="grid w-11/12 grid-cols-3 gap-2 self-center">
                      <Link
                        href={`/stores/${params.id}/outfits/${outfit.id}`}
                        className="flex h-12 w-full flex-wrap items-center justify-center gap-2 self-center rounded-lg bg-secondary p-2 text-md font-bold text-white hover:cursor-pointer hover:bg-dark-secondary md:flex-row md:text-xl"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`/stores/${params.id}/outfits/${outfit.id}/products`}
                        className="flex h-12 w-full flex-wrap items-center justify-center gap-2 self-center rounded-lg bg-secondary p-2 text-md font-bold text-white hover:cursor-pointer hover:bg-dark-secondary md:flex-row md:text-xl"
                      >
                        Productos
                      </Link>
                      <Button
                        onClick={async () => {
                          await deleteOutfit.fetch({ url: `outfits/${outfit.id}` });
                          outfits.setData(
                            validOutfits.filter((currentOutfit) => currentOutfit.id !== outfit.id)
                          );
                        }}
                        className="flex h-12 w-full flex-wrap items-center justify-center gap-2 self-center rounded-lg bg-primary p-2 text-md font-bold text-white hover:cursor-pointer hover:bg-dark-primary md:flex-row md:text-xl"
                      >
                        Eliminar
                      </Button>
                    </div>
                  ) : (
                    <Link
                      href={`/stores/${params.id}/outfits/${outfit.id}`}
                      className="flex h-12 w-11/12 flex-wrap items-center justify-center gap-2 self-center rounded-lg bg-secondary text-md font-bold text-white hover:cursor-pointer hover:bg-dark-secondary md:w-1/4 md:flex-row md:text-xl"
                    >
                      Ver mas
                    </Link>
                  )}
                </Card>
              ))}
            </>
          ) : (
            !isAdmin && (
              <NotFoundText message="Esta tienda todavia no tiene outfits disponibles..." />
            )
          )}
        </div>
      </div>
    </>
  );
}
