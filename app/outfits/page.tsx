'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getOutfitsOfStore } from '@/lib/api/getOutfitsOfStore';
import { useQuery } from '@tanstack/react-query';
import { RiDiscountPercentFill } from 'react-icons/ri';
import ErrorText from './ErrorText';
import LoadingText from './LoadingText';

export default function OutfitsPage() {
  const outfitsQuery = useQuery({
    queryKey: ['outfits', 1],
    queryFn: () => getOutfitsOfStore(1),
    retry: 0,
  });

  const convertPrice = (priceInCents: number): number => {
    return priceInCents / 100;
  };

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

  if (!outfitsQuery.data) {
    return <></>;
  } else {
    return (
      <>
        {outfitsQuery.data.map((o) => (
          <Card key={o.index} className="p-4 m-4">
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
            <Button className="self-center bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-xl h-12 w-11/12 md:w-1/4">
              Ver más
            </Button>
          </Card>
        ))}
      </>
    );
  }
}
