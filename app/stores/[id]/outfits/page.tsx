'use client';

import LabelledSwitch from '@/components/dondeSiempre/LabelledSwitch';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePassiveFetcher, useActiveFetcher } from '@/lib/api/fetcher';
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
  } else if (outfits.isError) {
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
          ? 'Se ha eliminado 1 outfit con una única prenda.'
          : `Se han eliminado ${invalidOutfits.length} outfits con una única prenda.`
      );
    } catch {
      setCleanupError('No se pudieron eliminar todos los outfits inválidos. Inténtalo de nuevo.');
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
                <h2 className="text-xl font-bold text-primary">Outfits inválidos detectados</h2>
                <p className="text-sm text-secondary">
                  Hay {invalidOutfits.length} outfit
                  {invalidOutfits.length === 1 ? '' : 's'} con una única prenda. No deberían
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
                  ? 'Eliminando outfits inválidos...'
                  : 'Eliminar outfits inválidos'}
              </Button>
            </Card>
          )}
          {isAdmin ? (
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
          ) : (
            <></>
          )}
          {validOutfits.length > 0 ? (
            <>
              {validOutfits.map((o) => (
                <Card key={o.id} className="p-4 m-4 pt-8 shadow-xl">
                  <div>
                    {outfitWithDiscount(o) ? <RiDiscountPercentFill className="text-4xl" /> : <></>}
                    <h1 className="mb-3 font-bold text-primary text-center text-3xl">{o.name}</h1>
                  </div>
                  <div className="flex flex-row w-fit max-w-11/12 self-center overflow-x-auto items-center gap-4 p-4">
                    {o.products.map((p) => (
                      <Image
                        key={p.id}
                        src={p.image || '/static/img/product_placeholder.png'}
                        alt={p.name}
                        width={512}
                        height={512}
                        className="w-30 h-30 md:w-50 md:h-50 object-cover shrink-0 rounded-lg shadow-lg"
                      />
                    ))}
                  </div>
                  {!outfitWithDiscount(o) ? (
                    <h1 className="font-bold text-primary text-center text-3xl">
                      {`${convertPrice(o.priceInCents).toFixed(2).toString().replace('.', ',')}€`}
                    </h1>
                  ) : (
                    <div className="flex flex-row self-center gap-3">
                      <h1 className="text-primary text-center line-through text-3xl">
                        {`${convertPrice(o.priceInCents).toFixed(2).toString().replace('.', ',')}€`}
                      </h1>
                      <h1 className="font-bold text-primary text-center text-3xl">
                        {`${getOutfitDisplayPrice(o).toFixed(2).toString().replace('.', ',')}€`}
                      </h1>
                    </div>
                  )}
                  {isAdmin ? (
                    <div className="self-center grid grid-cols-3 w-11/12 gap-2">
                      <Link
                        href={`/stores/${params.id}/outfits/${o.id}`}
                        className="p-2 self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl w-full h-12"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`/stores/${params.id}/outfits/${o.id}/products`}
                        className="p-2 self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl w-full h-12"
                      >
                        Productos
                      </Link>
                      <Button
                        onClick={async () => {
                          await deleteOutfit.fetch({ url: `outfits/${o.id}` });
                          outfits.setData(validOutfits.filter((outfit) => outfit.id !== o.id));
                        }}
                        className="p-2 self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-primary hover:bg-dark-primary hover:cursor-pointer text-white font-bold text-md md:text-xl w-full h-12"
                      >
                        Eliminar
                      </Button>
                    </div>
                  ) : (
                    <Link
                      href={`/stores/${params.id}/outfits/${o.id}`}
                      className="self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl w-11/12 md:w-1/4 h-12"
                    >
                      Ver más
                    </Link>
                  )}
                </Card>
              ))}
            </>
          ) : (
            !isAdmin && (
              <NotFoundText message="Esta tienda todavía no tiene outfits disponibles..." />
            )
          )}
        </div>
      </div>
    </>
  );
}
