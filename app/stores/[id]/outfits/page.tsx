'use client';

import LabelledSwitch from '@/components/dondeSiempre/LabelledSwitch';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import useFetcher from '@/lib/api/fetcher';
import { Outfit } from '@/lib/types/outfits';
import { convertPrice } from '@/lib/utils';
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

  const outfits = useFetcher<Outfit[]>({ url: `stores/${params.id}/outfits` });
  const deleteOutfit = useFetcher<void>({ method: 'DELETE', fetchOnStart: false });

  if (outfits.isLoading) {
    return <LoadingText />;
  } else if (outfits.isError) {
    return <ErrorText error={outfits.error} />;
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
          {outfits.data && outfits.data.length > 0 ? (
            <>
              {outfits.data.map((o) => (
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
                  <div className="flex flex-row w-fit max-w-11/12 self-center overflow-x-auto items-center gap-4 p-4">
                    {o.products.map((p) => (
                      <Image
                        key={p.id}
                        src={p.image || '/static/img/product_placeholder.png'}
                        alt={p.name}
                        width={512}
                        height={512}
                        className="w-30 h-30 md:w-50 md:h-50 object-cover shrink-0 rounded-lg shadow-lg"
                      ></Image>
                    ))}
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
                          deleteOutfit.fetch({ newUrl: `outfits/${o.id}` });
                          outfits.fetch();
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
