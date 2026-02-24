'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getOutfit } from '@/lib/api/outfitEndpoints';
import { getProductsOfStore } from '@/lib/api/productEndpoints';
import { convertPrice } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { IoIosCloseCircle } from 'react-icons/io';
import ErrorText from '../../../../../../components/dondeSiempre/ErrorText';
import LoadingText from '../../../../../../components/dondeSiempre/LoadingText';
import * as testOutfits from '@/lib/sampleData/testOutfits.json';
import { FaExchangeAlt } from 'react-icons/fa';

export default function OutfitProductsPage() {
  const params = useParams<{ outfitId: string }>();
  const outfitId = Number.parseInt(params.outfitId);
  const [outfitProducts, setOutfitProducts] = useState(
    testOutfits[outfitId].products.sort((a, b) => a.index - b.index)
  );
  const [storeProducts, setStoreProducts] = useState(
    testOutfits
      .flatMap((outfit) => outfit.products)
      .filter((product) => !testOutfits[outfitId].products.map((p) => p.id).includes(product.id))
  );

  const productsQuery = useQuery({
    queryKey: ['products', 1],
    queryFn: () => getProductsOfStore(1),
    enabled: false,
  });

  const outfitQuery = useQuery({
    queryKey: ['outfit', outfitId],
    queryFn: () => getOutfit(outfitId),
    enabled: false,
  });

  if (productsQuery.isLoading || outfitQuery.isLoading) {
    return (
      <>
        <LoadingText />
      </>
    );
  }

  if (productsQuery.isError || outfitQuery.isError) {
    return (
      <>
        <ErrorText error={productsQuery.error} />
      </>
    );
  }

  if (!testOutfits) {
    return <></>;
  } else {
    const outfit = testOutfits[outfitId];
    return (
      <>
        <div className="flex flex-col items-center bg-beige">
          <div className="w-full md:w-8/12">
            <Card className="p-4 pt-8 m-4 mb-8 shadow-xl">
              <div>
                <h1 className="mb-3 font-bold text-primary text-center text-3xl">{outfit.name}</h1>
                {outfit.description ? (
                  <p className="text-secondary text-center text-xl">{outfit.description}</p>
                ) : (
                  <></>
                )}
              </div>
              <div className="flex flex-row w-full max-w-11/12 self-center overflow-x-scroll items-center gap-4 p-4">
                <div>
                  <Card key={outfitProducts[0].id} className="p-2 gap-2 shrink-0">
                    {outfitProducts.length > 1 ? (
                      <IoIosCloseCircle
                        onClick={() => {
                          setStoreProducts([...storeProducts, outfitProducts[0]]);
                          setOutfitProducts(
                            outfitProducts
                              .filter((product) => product.id !== outfitProducts[0].id)
                              .sort((a, b) => a.index - b.index)
                          );
                        }}
                        className="text-2xl text-secondary hover:text-dark-secondary"
                      />
                    ) : (
                      <></>
                    )}
                    <img
                      src={outfitProducts[0].image}
                      alt={'Imagen de producto'}
                      className="w-30 md:w-50 aspect-square object-cover shrink-0 rounded-lg shadow-lg"
                    ></img>
                    <h1 className="mb-1 font-bold text-center text-md">
                      {`${convertPrice(outfitProducts[0].discountedPriceInCents).toFixed(2).toString().replace('.', ',')}€`}
                    </h1>
                  </Card>
                </div>
                {outfitProducts.slice(1).map((p, i) => (
                  <div key={p.id} className="inline-block relative">
                    <Button
                      onClick={() => {
                        const a = outfitProducts[i].index;
                        const b = outfitProducts[i + 1].index;
                        const products = [...outfitProducts];

                        products[i].index = b;
                        products[i + 1].index = a;

                        setOutfitProducts(products.sort((a, b) => a.index - b.index));
                      }}
                      className="text-white font-bold bg-secondary hover:bg-dark-secondary absolute right-11/12 top-1/2 aspect-square w-1/4"
                    >
                      <FaExchangeAlt></FaExchangeAlt>
                    </Button>
                    <Card className="p-2 gap-2 shrink-0">
                      {outfitProducts.length > 1 ? (
                        <IoIosCloseCircle
                          onClick={() => {
                            setStoreProducts([...storeProducts, p]);
                            setOutfitProducts(
                              outfitProducts
                                .filter((product) => product.id !== p.id)
                                .sort((a, b) => a.index - b.index)
                            );
                          }}
                          className="text-2xl text-secondary hover:text-dark-secondary"
                        />
                      ) : (
                        <></>
                      )}
                      <img
                        src={p.image}
                        alt={'Imagen de producto'}
                        className="w-30 md:w-50 aspect-square object-cover shrink-0 rounded-lg shadow-lg"
                      ></img>
                      <h1 className="mb-1 font-bold text-center text-md">
                        {`${convertPrice(p.discountedPriceInCents).toFixed(2).toString().replace('.', ',')}€`}
                      </h1>
                    </Card>
                  </div>
                ))}
              </div>
              <div>
                <h1 className="mt-2 mb-4 text-primary text-center text-3xl">
                  <strong>Total: </strong>
                  {`${convertPrice(
                    outfitProducts
                      .map((product) => product.discountedPriceInCents)
                      .reduce((a, b) => a + b)
                  )
                    .toFixed(2)
                    .toString()
                    .replace('.', ',')}€`}
                </h1>
              </div>
            </Card>
            <Card className="p-4 m-4 pt-8">
              <h1 className="md:mb-3 font-bold text-primary text-center text-3xl">Productos</h1>
              <div className="grid grid-cols-2 md:gap-2">
                {storeProducts.map((p) => (
                  <Card key={p.id} className="p-2 md:p-4 md:pt-8 m-1 shadow-xl gap-2 md:gap-4">
                    <div>
                      <h1 className="md:mb-3 font-bold text-primary text-center text-lg md:text-2xl">
                        {p.name}
                      </h1>
                    </div>
                    <div className="flex flex-row justify-center">
                      <img
                        key={p.index}
                        src={p.image}
                        alt={'Imagen de producto'}
                        className="w-30 h-30 md:w-50 md:h-50 object-cover shrink-0 rounded-lg shadow-lg"
                      ></img>
                    </div>
                    <h1 className="font-bold text-primary text-center text-lg md:text-2xl">
                      {`${convertPrice(p.discountedPriceInCents).toFixed(2).toString().replace('.', ',')}€`}
                    </h1>
                    <div className="flex flex-row justify-center">
                      <Button
                        onClick={() => {
                          const product = p;
                          product.index = outfitProducts.length;

                          setOutfitProducts(
                            [...outfitProducts, product].sort((a, b) => a.index - b.index)
                          );
                          setStoreProducts(storeProducts.filter((sp) => sp.id !== p.id));
                        }}
                        className="self-center flex flex-wrap items-center justify-center gap-2 md:flex-row rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md md:text-xl h-12 w-11/12 md:w-1/2"
                      >
                        Añadir
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }
}
