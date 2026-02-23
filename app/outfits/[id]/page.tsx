'use client';

import ErrorText from '@/components/dondeSiempre/ErrorText';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import { Button } from '@/components/ui/button';
import { getOutfit } from '@/lib/api/outfitEndpoints';
import { Outfit } from '@/lib/types/outfits';
import { convertPrice } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { GoDotFill } from 'react-icons/go';

export default function OutfitDetailsPage() {
  const [selectedProduct, setSelectedProduct] = useState(0);

  const params = useParams<{ id: string }>();
  const outfitId = Number.parseInt(params.id);

  const outfitQuery = useQuery({
    queryKey: ['outfit', outfitId],
    queryFn: () => getOutfit(outfitId),
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
          image: '/static/img/shoes.png',
          priceInCents: 1000,
          storeId: 0,
          type: 'zapato',
        },
        {
          id: 1,
          index: 1,
          name: 'Pantalón',
          description: 'Pantalón de prueba',
          image: '/static/img/trousers.png',
          priceInCents: 1000,
          storeId: 0,
          type: 'pantalones',
        },
        {
          id: 2,
          index: 2,
          name: 'Camiseta',
          description: 'Camiseta de prueba',
          image: '/static/img/shirt.png',
          priceInCents: 1000,
          storeId: 0,
          type: 'camiseta',
        },
        {
          id: 3,
          index: 3,
          name: 'Blazer',
          description: 'Blazer de prueba',
          image: '/static/img/blazer.png',
          priceInCents: 500,
          storeId: 0,
          type: 'blazer',
        },
        {
          id: 4,
          index: 4,
          name: 'Bufanda',
          description: 'Bufanda de prueba',
          image: '/static/img/bufanda.png',
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
          image: '/static/img/shoes.png',
          priceInCents: 1000,
          storeId: 0,
          type: 'zapato',
        },
        {
          id: 6,
          index: 1,
          name: 'Pantalón',
          description: 'Pantalón de prueba',
          image: '/static/img/trousers.png',
          priceInCents: 1000,
          storeId: 0,
          type: 'pantalones',
        },
        {
          id: 7,
          index: 2,
          name: 'Camiseta',
          description: 'Camiseta de prueba',
          image: '/static/img/shirt.png',
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
          image: '/static/img/trousers.png',
          priceInCents: 1000,
          storeId: 0,
          type: 'pantalones',
        },
        {
          id: 8,
          index: 1,
          name: 'Camiseta',
          description: 'Camiseta de prueba',
          image: '/static/img/shirt.png',
          priceInCents: 1000,
          storeId: 0,
          type: 'camiseta',
        },
      ],
    },
  ];

  if (outfitQuery.isLoading) {
    return (
      <>
        <LoadingText />
      </>
    );
  }

  if (outfitQuery.isError) {
    return (
      <>
        <ErrorText error={outfitQuery.error} />
      </>
    );
  }

  if (!testOutfits) {
    return <></>;
  } else {
    const outfit = testOutfits[outfitId];
    const product = outfit.products[selectedProduct];
    return (
      <>
        <div className="flex flex-col items-center">
          <div className="pt-8 pl-8 pr-8 pb-4">
            <div>
              <h1 className="mb-1 font-bold text-primary text-center text-3xl">{outfit.name}</h1>
              {outfit.description ? (
                <p className="text-secondary text-center text-md">{outfit.description}</p>
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="flex flex-row justify-center relative">
            {product.image ? (
              <img
                src={product.image}
                alt={'Imagen de producto'}
                className="aspect-square w-full md:w-sm object-cover md:rounded-lg shrink-0 shadow-lg"
              ></img>
            ) : (
              <></>
            )}
            <div className="mb-1 flex flex-row justify-center absolute bottom-0">
              {outfit.products.map((p, i) => (
                <GoDotFill
                  key={i}
                  className={i === selectedProduct ? 'text-secondary' : 'text-ring'}
                ></GoDotFill>
              ))}
            </div>
          </div>
          <div className="pt-4 pb-8 pl-8 pr-8 md:w-8/12 flex flex-col items-center">
            <div>
              <h1 className="text-primary text-2xl">{product.name}</h1>
            </div>
            <div className="pt-4 pb-6 flex flex-row w-fit max-w-11/12 self-center overflow-x-scroll items-center gap-4">
              {outfit.products.map((p, i) =>
                p.image ? (
                  <img
                    key={p.index}
                    src={p.image}
                    onClick={() => setSelectedProduct(i)}
                    alt={'Imagen de producto'}
                    className={
                      'w-20 h-20 md:w-40 md:h-40 object-cover shrink-0 rounded-lg shadow-lg ' +
                      (i === selectedProduct ? 'border-4 border-ring' : '')
                    }
                  ></img>
                ) : (
                  <></>
                )
              )}
            </div>
            <div>
              <h1 className="mt-4 mb-4 text-primary text-2xl">
                <strong>Total: </strong>
                {`${convertPrice(outfit.discountedPriceInCents).toFixed(2).toString().replace('.', ',')}€ con IVA`}
              </h1>
            </div>
            <Button className="self-center bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-xl h-12 w-11/12 md:w-1/3">
              Añadir al carrito
            </Button>
          </div>
        </div>
      </>
    );
  }
}
