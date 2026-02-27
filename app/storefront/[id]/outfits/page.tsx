'use client';

import LabelledSwitch from '@/components/dondeSiempre/LabelledSwitch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { deleteOutfit, getOutfitsOfStorefront } from '@/lib/api/outfitEndpoints';
import { convertPrice } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { GrSearch } from 'react-icons/gr';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { RiDiscountPercentFill } from 'react-icons/ri';
import ErrorText from '../../../../components/dondeSiempre/ErrorText';
import LoadingText from '../../../../components/dondeSiempre/LoadingText';

export default function OutfitsPage() {
  const params = useParams<{ id: string }>();
  const storefrontId = Number.parseInt(params.id);

  const [isAdmin, setIsAdmin] = useState(false);

  const outfitsQuery = useQuery({
    queryKey: ['outfits', storefrontId],
    queryFn: () => getOutfitsOfStorefront(storefrontId),
  });

  if (outfitsQuery.isLoading) {
    return (
      <>
        <LoadingText />
      </>
    );
  } else if (outfitsQuery.isError) {
    return (
      <>
        <ErrorText error={outfitsQuery.error} />
      </>
    );
  }

  return (
    <>
      <LabelledSwitch
        label="Modo tienda"
        checked={isAdmin}
        onCheckedChange={(checked) => setIsAdmin(checked)}
      />
      <div className="flex flex-col items-center">
        <div className="w-full md:w-8/12">
          {isAdmin ? (
            <Link href={`/storefront/${storefrontId}/create-outfit/`}>
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
          {outfitsQuery.data && outfitsQuery.data.length > 0 ? (
            <>
              {outfitsQuery.data.map((o) => (
                <Card key={o.id} className="p-4 m-4 pt-8 shadow-xl">
                  <div>
                    {o.discountedPriceInCents === o.priceInCents ? (
                      <></>
                    ) : (
                      <RiDiscountPercentFill className="text-4xl" />
                    )}
                    <h1 className="mb-3 font-bold text-primary text-center text-3xl">{o.name}</h1>
                    {o.description ? (
                      <p className="text-secondary text-center text-xl">{o.description}</p>
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className="flex flex-row w-fit max-w-11/12 self-center overflow-x-scroll items-center gap-4 p-4">
                    {o.products.map(
                      (p) =>
                        p.image && (
                          <img
                            key={p.id}
                            src={p.image}
                            alt={'Imagen de producto'}
                            className="w-30 h-30 md:w-50 md:h-50 object-cover shrink-0 rounded-lg shadow-lg"
                          ></img>
                        )
                    )}
                  </div>
                  {o.discountedPriceInCents === o.priceInCents ? (
                    <h1 className="font-bold text-primary text-center text-3xl">
                      {`${convertPrice(o.priceInCents).toFixed(2).toString().replace('.', ',')}€`}
                    </h1>
                  ) : (
                    <div className="flex flex-row self-center gap-3">
                      <h1 className="text-primary text-center line-through text-3xl">
                        {`${convertPrice(o.priceInCents).toFixed(2).toString().replace('.', ',')}€`}
                      </h1>
                      <h1 className="font-bold text-primary text-center text-3xl">
                        {`${convertPrice(o.discountedPriceInCents).toFixed(2).toString().replace('.', ',')}€`}
                      </h1>
                    </div>
                  )}
                  {isAdmin ? (
                    <div className="self-center grid grid-cols-3 w-11/12 gap-2">
                      <Link
                        href={`/storefront/${storefrontId}/outfits/${o.id}`}
                        className="p-2 self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl w-full h-12"
                      >
                        Editar
                      </Link>
                      <Link
                        href={`/storefront/${storefrontId}/outfits/${o.id}/products`}
                        className="p-2 self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl w-full h-12"
                      >
                        Productos
                      </Link>
                      <Button
                        onClick={async () => {
                          await deleteOutfit(o.id);
                          outfitsQuery.refetch();
                        }}
                        className="p-2 self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-primary hover:bg-dark-primary hover:cursor-pointer text-white font-bold text-md md:text-xl w-full h-12"
                      >
                        Eliminar
                      </Button>
                    </div>
                  ) : (
                    <Link
                      href={`/storefront/${storefrontId}/outfits/${o.id}`}
                      className="self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl w-11/12 md:w-1/4 h-12"
                    >
                      Ver más
                    </Link>
                  )}
                </Card>
              ))}
            </>
          ) : isAdmin ? (
            <></>
          ) : (
            <div className="mt-16 flex flex-col items-center gap-4">
              <p className="text-secondary font-bold text-center text-4xl">¡Vaya!</p>
              <GrSearch className="mt-4 ml-4 text-8xl text-secondary"></GrSearch>
              <p className="mt-4 text-secondary text-center text-lg w-8/12">
                Esta tienda todavía no tiene outfits disponibles...
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
