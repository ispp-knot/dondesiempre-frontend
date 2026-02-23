'use client';

import LabelledSwitch from '@/components/dondeSiempre/LabelledSwitch';
import { Card } from '@/components/ui/card';
import { getOutfitsOfStore } from '@/lib/api/outfitEndpoints';
import { convertPrice } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { RiDiscountPercentFill } from 'react-icons/ri';
import ErrorText from '../../components/dondeSiempre/ErrorText';
import LoadingText from '../../components/dondeSiempre/LoadingText';
import * as testOutfits from './testOutfits.json';
import { IoMdAddCircleOutline } from 'react-icons/io';

export default function OutfitsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const outfitsQuery = useQuery({
    queryKey: ['outfits', 1],
    queryFn: () => getOutfitsOfStore(1),
    enabled: false,
  });

  if (outfitsQuery.isLoading) {
    return (
      <>
        <LoadingText />
      </>
    );
  }

  if (outfitsQuery.isError) {
    return (
      <>
        <ErrorText error={outfitsQuery.error} />
      </>
    );
  }

  if (!testOutfits) {
    return <></>;
  } else {
    return (
      <>
        <LabelledSwitch
          label="Modo administrador"
          onCheckedChange={(checked) => setIsAdmin(checked)}
        />
        <div className="flex flex-col items-center bg-beige">
          <div className="w-full md:w-8/12">
            {isAdmin ? (
              <Link href="outfits">
                <Card className="p-4 m-4 shadow-xl hover:bg-muted active:bg-input hover:cursor-pointer">
                  <div className="p-4 border-4 border-dashed border-secondary rounded-lg flex flex-row justify-center gap-4">
                    <IoMdAddCircleOutline className="mt-8 mb-8 text-secondary text-center text-4xl" />
                    <h1 className="mt-8 mb-8 font-bold text-secondary text-center text-3xl">
                      Crear nuevo outfit
                    </h1>
                  </div>
                </Card>
              </Link>
            ) : (
              <></>
            )}
            {testOutfits.map((o) => (
              <Card key={o.index} className="p-4 m-4 shadow-xl">
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
                  {o.products.map((p) =>
                    p.image ? (
                      <img
                        key={p.index}
                        src={p.image}
                        alt={'Imagen de producto'}
                        className="w-30 h-30 md:w-50 md:h-50 object-cover shrink-0 rounded-lg shadow-lg"
                      ></img>
                    ) : (
                      <></>
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
                <Link
                  href={`/outfits/${o.id}`}
                  className="self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-xl h-12 w-11/12 md:w-1/4"
                >
                  {isAdmin ? 'Editar' : 'Ver más'}
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }
}
