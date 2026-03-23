'use client';

import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import SortableProduct from '@/components/dondeSiempre/SortableProduct';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePassiveFetcher, useActiveFetcher } from '@/lib/api/fetcher';
import { OutfitDTO, OutfitCreationProductDTO } from '@/lib/types/outfits/outfitsDto';
import { ProductDTO } from '@/lib/types/products/productsDto';
import { convertPrice } from '@/lib/utils';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import Image from 'next/image';
import { redirect, useParams } from 'next/navigation';
import { useState } from 'react';
import ErrorText from '../../../../../../components/dondeSiempre/ErrorText';
import LoadingText from '../../../../../../components/dondeSiempre/LoadingText';
import { StoreOwnerGuard } from '@/components/guards/StoreOwnerGuard';

export default function OutfitProductsPage() {
  const params = useParams<{ id: string; outfitId: string }>();

  const [movedProducts, setMovedProducts] = useState(new Array<string>());

  const products = usePassiveFetcher<ProductDTO[]>({ url: `stores/${params.id}/products` });
  const outfit = usePassiveFetcher<OutfitDTO>({ url: `outfits/${params.outfitId}` });

  const addProduct = useActiveFetcher<void>({
    url: `outfits/${params.outfitId}/products`,
    method: 'POST',
  });
  const removeProduct = useActiveFetcher<void>({ method: 'DELETE' });
  const sortProducts = useActiveFetcher<void>({
    url: `outfits/${params.outfitId}/products/sort`,
    method: 'PATCH',
  });

  if (products.isLoading || outfit.isLoading) {
    return <LoadingText />;
  }

  if (products.isError || outfit.isError) {
    return (
      <>
        {products.isError && <ErrorText error={products.error} />}
        {outfit.isError && <ErrorText error={outfit.error} />}
      </>
    );
  }
  const outfitProducts = outfit.data?.products.sort((a, b) => a.index - b.index);
  return products.data && outfit.data && outfitProducts ? (
    <StoreOwnerGuard storeId={params.id}>
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
                  {outfit.data.name}
                </h1>
                {outfit.data.description ? (
                  <p className="text-secondary text-center text-xl">{outfit.data.description}</p>
                ) : (
                  <></>
                )}
              </div>
              <div className="flex flex-row w-full max-w-11/12 self-center overflow-x-auto items-center gap-4 p-4">
                {outfitProducts.map((p, i) => (
                  <SortableProduct
                    key={p.id}
                    index={i}
                    product={p}
                    removable={outfitProducts.length > 1}
                    onClick={async () => {
                      await removeProduct.fetch({
                        url: `outfits/${params.outfitId}/products/${p.id}`,
                      });
                      outfit.refetch();
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
                    const list = movedProducts.map((id, index) => {
                      return { productId: id, index: index };
                    });

                    if (movedProducts.length > 0) {
                      await sortProducts.fetch({ body: list });
                    }
                    redirect(`/stores/${params.id}/outfits`);
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
                {products.data
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
                          className="w-30 h-30 md:w-50 md:h-50 object-cover shrink-0 rounded-lg shadow-lg"
                        ></Image>
                      </div>
                      <h1 className="font-bold text-primary text-center text-lg md:text-2xl">
                        {`${convertPrice(p.discountedPriceInCents).toFixed(2).toString().replace('.', ',')}€`}
                      </h1>
                      <div className="flex flex-row justify-center">
                        <Button
                          onClick={async () => {
                            const dto: OutfitCreationProductDTO = {
                              productId: p.id,
                              index: outfitProducts.length,
                            };
                            await addProduct.fetch({ body: dto });
                            outfit.refetch();
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
    </StoreOwnerGuard>
  ) : (
    <NotFoundText message="El outfit que buscas no existe..." />
  );
}
