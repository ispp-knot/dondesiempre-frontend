'use client';

import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import SortableProduct from '@/components/dondeSiempre/SortableProduct';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { addProduct, getOutfit, removeProduct, sortProducts } from '@/lib/api/outfitEndpoints';
import { getProductsOfStorefront } from '@/lib/api/productEndpoints';
import { OutfitCreationProduct } from '@/lib/types/outfits';
import { convertPrice } from '@/lib/utils';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { useQuery } from '@tanstack/react-query';
import { redirect, useParams } from 'next/navigation';
import { useState } from 'react';
import ErrorText from '../../../../../../components/dondeSiempre/ErrorText';
import LoadingText from '../../../../../../components/dondeSiempre/LoadingText';
import Image from 'next/image';

export default function OutfitProductsPage() {
  const params = useParams<{ id: string; outfitId: string }>();
  const outfitId = params.outfitId;
  const storefrontId = params.id;

  const [movedProducts, setMovedProducts] = useState(new Array<string>());
  const productsQuery = useQuery({
    queryKey: ['products', storefrontId],
    queryFn: () => getProductsOfStorefront(storefrontId),
  });

  const outfitQuery = useQuery({
    queryKey: ['outfit', outfitId],
    queryFn: () => getOutfit(outfitId),
  });

  if (productsQuery.isLoading || outfitQuery.isLoading) {
    return <LoadingText />;
  }

  if (productsQuery.isError || outfitQuery.isError) {
    return (
      <>
        {productsQuery.isError && <ErrorText error={productsQuery.error} />}
        {outfitQuery.isError && <ErrorText error={outfitQuery.error} />}
      </>
    );
  }
  const outfitProducts = outfitQuery.data?.products.sort((a, b) => a.index - b.index);
  return productsQuery.data && outfitQuery.data && outfitProducts ? (
    <DragDropProvider
      onDragEnd={(event) => {
        let moved: string[] = [];

        if (event.canceled) {
          return;
        }

        if (movedProducts.length <= 0) {
          moved = outfitProducts.map((product) => product.id);
        }
        setMovedProducts(move(moved, event));
      }}
    >
      <div className="flex flex-col items-center">
        <div className="w-full md:w-8/12">
          <Card className="p-4 pt-8 m-4 mb-8 shadow-xl">
            <div>
              <h1 className="mb-3 font-bold text-primary text-center text-3xl">
                {outfitQuery.data.name}
              </h1>
              {outfitQuery.data.description ? (
                <p className="text-secondary text-center text-xl">{outfitQuery.data.description}</p>
              ) : (
                <></>
              )}
            </div>
            <div className="flex flex-row w-full max-w-11/12 self-center overflow-x-scroll items-center gap-4 p-4">
              {outfitProducts.map((p, i) => (
                <SortableProduct
                  key={p.id}
                  index={i}
                  product={p}
                  removable={outfitProducts.length > 1}
                  onClick={async () => {
                    await removeProduct(outfitId, p.id);
                    outfitQuery.refetch();
                  }}
                />
              ))}
            </div>
            <div>
              <h1 className="mt-2 mb-4 text-primary text-center text-3xl">
                <strong>Total: </strong>
                {`${convertPrice(
                  outfitProducts.map((product) => product.priceInCents).reduce((a, b) => a + b)
                )
                  .toFixed(2)
                  .toString()
                  .replace('.', ',')}€`}
              </h1>
            </div>
            <div className="flex flex-row justify-center mb-8">
              <Button
                onClick={async () => {
                  if (movedProducts.length > 0) {
                    await sortProducts(
                      outfitId,
                      movedProducts.map((id, index) => {
                        return { id: id, index: index };
                      })
                    );
                  }
                  redirect(`/storefront/${storefrontId}/outfits`);
                }}
                className="self-center text-center flex flex-row justify-center items-center rounded-lg bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md h-12 w-1/2 mt-8"
              >
                Confirmar cambios
              </Button>
            </div>
          </Card>
          <Card className="p-4 m-4 pt-8">
            <h1 className="md:mb-3 font-bold text-primary text-center text-3xl">Productos</h1>
            <div className="grid grid-cols-2 md:gap-2">
              {productsQuery.data
                .filter((product) => !outfitProducts.map((p) => p.id).includes(product.id))
                .map((p) => (
                  <Card key={p.id} className="p-2 md:p-4 md:pt-8 m-1 shadow-xl gap-2 md:gap-4">
                    <div>
                      <h1 className="md:mb-3 font-bold text-primary text-center text-lg md:text-2xl">
                        {p.name}
                      </h1>
                    </div>
                    <div className="flex flex-row justify-center">
                      <Image
                        src={p.image || '/static/img/product_placeholder.png'}
                        alt={p.name}
                        width={512}
                        height={512}
                        quality={100}
                        className="w-30 h-30 md:w-50 md:h-50 object-cover shrink-0 rounded-lg shadow-lg"
                      ></Image>
                    </div>
                    <h1 className="font-bold text-primary text-center text-lg md:text-2xl">
                      {`${convertPrice(p.discountedPriceInCents).toFixed(2).toString().replace('.', ',')}€`}
                    </h1>
                    <div className="flex flex-row justify-center">
                      <Button
                        onClick={async () => {
                          const dto: OutfitCreationProduct = {
                            id: p.id,
                            index: outfitProducts.length,
                          };
                          await addProduct(outfitId, dto);
                          outfitQuery.refetch();
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
    </DragDropProvider>
  ) : (
    <NotFoundText message="El outfit que buscas no existe..." />
  );
}
