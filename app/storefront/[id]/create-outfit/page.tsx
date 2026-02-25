'use client';

import ErrorText from '@/components/dondeSiempre/ErrorText';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getProductsOfStore } from '@/lib/api/productEndpoints';
import * as testOutfits from '@/lib/sampleData/testOutfits.json';
import { createEmptyOutfit, OutfitProduct } from '@/lib/types/outfits';
import { convertPrice } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import { IoIosCloseCircle } from 'react-icons/io';
import { FaTag } from 'react-icons/fa';

export default function OutfitProductsPage() {
  const params = useParams<{ storefrontId: string }>();
  const storefrontId = Number.parseInt(params.storefrontId);

  const [outfit, setOutfit] = useState(createEmptyOutfit());
  const [storeProducts, setStoreProducts] = useState(
    testOutfits.flatMap((outfit) => outfit.products as OutfitProduct[])
  );

  const productsQuery = useQuery({
    queryKey: ['products', 1],
    queryFn: () => getProductsOfStore(1),
    enabled: false,
  });

  if (productsQuery.isLoading) {
    return (
      <>
        <LoadingText />
      </>
    );
  }

  if (productsQuery.isError) {
    return (
      <>
        <ErrorText error={productsQuery.error} />
      </>
    );
  }

  if (!testOutfits) {
    return <></>;
  } else {
    return (
      <>
        <div className="flex flex-col items-center bg-beige">
          <div className="w-full md:w-8/12">
            <Card className="p-4 pt-8 m-4 mb-8 shadow-xl">
              <h1 className="mb-3 font-bold text-primary text-center text-3xl">Crear outfit</h1>
              <div className="w-full flex flex-col items-center">
                <form
                  action={`/storefront/${storefrontId}/outfits/`}
                  method="GET"
                  className="w-10/12"
                >
                  <div className="flex flex-col gap-4">
                    <label htmlFor="form-name" className="font-bold text-lg text-secondary">
                      Nombre:{' '}
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="form-name"
                      defaultValue={outfit.name}
                      required
                      className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                    />
                    <label htmlFor="form-description" className="font-bold text-lg text-secondary">
                      Descripción:{' '}
                    </label>
                    <input
                      type="text"
                      name="description"
                      defaultValue={outfit.description || ''}
                      id="form-description"
                      className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                    />
                    <label htmlFor="form-image" className="font-bold text-lg text-secondary">
                      Imagen:{' '}
                    </label>
                    <div className="flex flex-col items-center">
                      <img
                        id="form-image-preview"
                        src={outfit.image || undefined}
                        alt={'Sin imagen'}
                        className="w-30 h-30 md:w-50 md:h-50 object-cover shrink-0 rounded-lg shadow-lg text-center text-secondary"
                      ></img>
                      <input
                        type="file"
                        name="image"
                        id="form-image"
                        accept="image/*"
                        src={outfit.image || undefined}
                        onChange={() => {
                          const image = document.getElementById(
                            'form-image-preview'
                          ) as HTMLImageElement;
                          const input = document.getElementById('form-image') as HTMLInputElement;
                          image.src = '/static/img/' + input.files?.item(0)?.name || '';
                        }}
                        className="cursor-pointer border border-secondary rounded pt-2 pb-2 pl-3 pr-3 mt-4 mb-2 text-heading text-sm text-secondary rounded-base focus:ring-brand focus:border-brand block w-full shadow-xs placeholder:text-body"
                      />
                    </div>
                    <label htmlFor="form-tags" className="font-bold text-lg text-secondary">
                      Etiquetas:{' '}
                    </label>
                    <input
                      type="text"
                      name="tags"
                      id="form-tags"
                      onChange={() => {
                        const element = document.getElementById('form-tags') as HTMLInputElement;

                        if (element.value.includes(' ')) {
                          setOutfit({
                            ...outfit,
                            tags: [...new Set([...outfit.tags, element.value.trim()])],
                          });
                          element.value = '';
                        }
                      }}
                      className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="flex flex-row gap-4 overflow-x-scroll">
                    {outfit.tags.map((t, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setOutfit({ ...outfit, tags: outfit.tags.filter((tag) => tag !== t) });
                        }}
                        className="p-2 rounded-lg bg-secondary hover:bg-dark-secondary flex flex-row gap-1 shrink-0"
                      >
                        <FaTag className="text-white"></FaTag>
                        <p className="font-bold text-white text-center text-xs">{t}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-row w-full max-w-11/12 self-center overflow-x-scroll items-center gap-4 p-4">
                    <div>
                      {outfit.products.length > 0 && (
                        <Card key={outfit.products[0].id} className="p-2 gap-2 shrink-0">
                          <IoIosCloseCircle
                            onClick={() => {
                              setStoreProducts([...storeProducts, outfit.products[0]]);
                              setOutfit({
                                ...outfit,
                                products: outfit.products
                                  .filter((product) => product.id !== outfit.products[0].id)
                                  .sort((a, b) => a.index - b.index),
                              });
                            }}
                            className="text-2xl text-secondary hover:text-dark-secondary"
                          />
                          <img
                            src={outfit.products[0].image || ''}
                            alt={'Imagen de producto'}
                            className="w-30 md:w-50 aspect-square object-cover shrink-0 rounded-lg shadow-lg"
                          ></img>
                          <h1 className="mb-1 font-bold text-center text-md">
                            {`${convertPrice(outfit.products[0].discountedPriceInCents).toFixed(2).toString().replace('.', ',')}€`}
                          </h1>
                        </Card>
                      )}
                    </div>
                    {outfit.products.slice(1).map((p, i) => (
                      <div key={p.id} className="inline-block relative">
                        <Button
                          onClick={() => {
                            const a = outfit.products[i].index;
                            const b = outfit.products[i + 1].index;
                            const products = [...outfit.products];

                            products[i].index = b;
                            products[i + 1].index = a;

                            setOutfit({
                              ...outfit,
                              products: products.sort((a, b) => a.index - b.index),
                            });
                          }}
                          className="text-white font-bold bg-secondary hover:bg-dark-secondary absolute right-11/12 top-1/2 aspect-square w-1/4"
                        >
                          <FaExchangeAlt></FaExchangeAlt>
                        </Button>
                        <Card className="p-2 gap-2 shrink-0">
                          <IoIosCloseCircle
                            onClick={() => {
                              setStoreProducts([...storeProducts, p]);
                              setOutfit({
                                ...outfit,
                                products: outfit.products
                                  .filter((product) => product.id !== p.id)
                                  .sort((a, b) => a.index - b.index),
                              });
                            }}
                            className="text-2xl text-secondary hover:text-dark-secondary"
                          />
                          <img
                            src={p.image || ''}
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
                        outfit.products.length > 0
                          ? outfit.products
                              .map((product) => product.discountedPriceInCents)
                              .reduce((a, b) => a + b)
                          : 0
                      )
                        .toFixed(2)
                        .toString()
                        .replace('.', ',')}€`}
                    </h1>
                  </div>
                  <div className="flex flex-row justify-center mb-8">
                    <Button
                      type="submit"
                      className="self-center bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md h-12 md:w-1/3 mt-8"
                      disabled={outfit.products.length <= 0}
                    >
                      Confirmar cambios
                    </Button>
                  </div>
                </form>
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
                        src={p.image || ''}
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
                          product.index = outfit.products.length;

                          setOutfit({
                            ...outfit,
                            products: [...outfit.products, product].sort(
                              (a, b) => a.index - b.index
                            ),
                          });
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
