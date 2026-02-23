'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getOutfitsOfStore } from '@/lib/api/getOutfitsOfStore';
import { Outfit } from '@/lib/types/outfits';
import { useQuery } from '@tanstack/react-query';
import { RiDiscountPercentFill } from 'react-icons/ri';
import ErrorText from '../../components/dondeSiempre/ErrorText';
import LoadingText from '../../components/dondeSiempre/LoadingText';

export default function OutfitsPage() {
  const outfitsQuery = useQuery({
    queryKey: ['outfits', 1],
    queryFn: () => getOutfitsOfStore(1),
    enabled: false,
  });

  const testOutfits: Outfit[] = [
    {
      id: 0,
      index: 0,
      name: 'Outfit de otoño',
      description: 'Outfit de otoño de prueba',
      image: null,
      priceInCents: 4000,
      discountedPriceInCents: 2500,
      storefrontId: 0,
      tags: ['otoño'],
      products: [
        {
          id: 0,
          index: 0,
          name: 'Zapatos',
          description: 'Zapatos de prueba',
          image: 'static/img/shoes.png',
          priceInCents: 1000,
          storeId: 0,
          type: 'zapato',
        },
        {
          id: 1,
          index: 1,
          name: 'Pantalón',
          description: 'Pantalón de prueba',
          image: 'static/img/trousers.png',
          priceInCents: 1000,
          storeId: 0,
          type: 'pantalones',
        },
        {
          id: 2,
          index: 2,
          name: 'Camiseta',
          description: 'Camiseta de prueba',
          image: 'static/img/shirt.png',
          priceInCents: 1000,
          storeId: 0,
          type: 'camiseta',
        },
        {
          id: 3,
          index: 3,
          name: 'Blazer',
          description: 'Blazer de prueba',
          image: 'static/img/blazer.png',
          priceInCents: 500,
          storeId: 0,
          type: 'blazer',
        },
        {
          id: 4,
          index: 4,
          name: 'Bufanda',
          description: 'Bufanda de prueba',
          image: 'static/img/bufanda.png',
          priceInCents: 500,
          storeId: 0,
          type: 'bufanda',
        },
      ],
    },
    {
      id: 1,
      index: 1,
      name: 'Outfit de primavera',
      description: 'Outfit de primavera de prueba',
      image: null,
      priceInCents: 3000,
      discountedPriceInCents: 3000,
      storefrontId: 0,
      tags: ['primavera'],
      products: [
        {
          id: 5,
          index: 0,
          name: 'Zapatos',
          description: 'Zapatos de prueba',
          image: 'static/img/shoes.png',
          priceInCents: 1000,
          storeId: 0,
          type: 'zapato',
        },
        {
          id: 6,
          index: 1,
          name: 'Pantalón',
          description: 'Pantalón de prueba',
          image: 'static/img/trousers.png',
          priceInCents: 1000,
          storeId: 0,
          type: 'pantalones',
        },
        {
          id: 7,
          index: 2,
          name: 'Camiseta',
          description: 'Camiseta de prueba',
          image: 'static/img/shirt.png',
          priceInCents: 1000,
          storeId: 0,
          type: 'camiseta',
        },
      ],
    },
    {
      id: 2,
      index: 2,
      name: 'Outfit de verano',
      description: 'Outfit de verano de prueba',
      image: null,
      priceInCents: 2000,
      discountedPriceInCents: 1500,
      storefrontId: 0,
      tags: ['primavera'],
      products: [
        {
          id: 8,
          index: 0,
          name: 'Pantalón',
          description: 'Pantalón de prueba',
          image: 'static/img/trousers.png',
          priceInCents: 1000,
          storeId: 0,
          type: 'pantalones',
        },
        {
          id: 8,
          index: 1,
          name: 'Camiseta',
          description: 'Camiseta de prueba',
          image: 'static/img/shirt.png',
          priceInCents: 1000,
          storeId: 0,
          type: 'camiseta',
        },
      ],
    },
  ];

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

  if (!testOutfits) {
    return <></>;
  } else {
    return (
      <>
        {testOutfits.map((o) => (
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
