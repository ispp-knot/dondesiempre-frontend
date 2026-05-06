'use client';

import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import SortableProduct from '@/components/dondeSiempre/SortableProduct';
import { StoreOwnerGuard } from '@/components/guards/StoreOwnerGuard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { OutfitCreationProductDTO, OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { hasMinimumOutfitProducts, MIN_OUTFIT_PRODUCTS } from '@/lib/types/outfits/outfitsRules';
import { ProductDTO } from '@/lib/types/products/productsDto';
import { convertPrice, formatDisplayPrice } from '@/lib/utils';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ErrorView } from '@/components/dondeSiempre/ErrorView';
import { Loader2 } from 'lucide-react';
import { BackButton } from '@/components/dondeSiempre/BackButton';

export default function OutfitProductsPage() {
  const params = useParams<{ id: string; outfitId: string }>();
  const router = useRouter();

  const [movedProducts, setMovedProducts] = useState<string[]>([]);
  const [productError, setProductError] = useState<string | null>(null);

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
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-background">
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }

  if (products.isError || outfit.isError) {
    return (
      <ErrorView
        title="Outfit no encontrado"
        description="No pudimos encontrar este outfit. Puede que se haya eliminado o que el enlace ya no sea válido."
        buttonText="Volver atrás"
      />
    );
  }

  const outfitProducts = [...(outfit.data?.products ?? [])].sort((a, b) => a.index - b.index);
  const canRemoveProducts = outfitProducts.length > MIN_OUTFIT_PRODUCTS;
  const outfitIsInvalid = !hasMinimumOutfitProducts({ products: outfitProducts });

  return (
    <StoreOwnerGuard storeId={params.id}>
      {products.data && outfit.data && outfitProducts ? (
        <DragDropProvider
          onDragEnd={(event) => {
            if (event.canceled) {
              return;
            }

            const currentOrder =
              movedProducts.length > 0
                ? movedProducts
                : outfitProducts.map((product) => product.id);
            setMovedProducts(move(currentOrder, event));
          }}
        >
          <div className="flex flex-col items-center">
            <div className="w-full md:w-8/12">
              <BackButton
                variant="ghost"
                onAction={() => router.push(`/stores/${params.id}/outfits`)}
              />
              <Card className="p-4 pt-8 m-4 mb-8 shadow-xl">
                <div>
                  <h1 className="mb-3 break-words font-bold text-primary text-center text-3xl">
                    {outfit.data.name}
                  </h1>
                  {outfit.data.description ? (
                    <p className="text-secondary text-center text-xl break-words">
                      {outfit.data.description}
                    </p>
                  ) : (
                    <></>
                  )}
                </div>
                <div className="px-4 pt-4">
                  <p
                    className={
                      outfitIsInvalid
                        ? 'text-center text-sm font-medium text-destructive'
                        : 'text-center text-sm text-muted-foreground'
                    }
                  >
                    {outfitIsInvalid
                      ? `Este outfit tiene menos de ${MIN_OUTFIT_PRODUCTS} prendas. Añade más productos o elimínalo desde el listado de outfits inválidos.`
                      : `El outfit debe mantener al menos ${MIN_OUTFIT_PRODUCTS} prendas. Cuando solo queden ${MIN_OUTFIT_PRODUCTS}, la eliminación se bloqueará.`}
                  </p>
                </div>
                <div className="flex flex-row w-full max-w-11/12 self-center overflow-x-auto items-center gap-4 p-4">
                  {outfitProducts.map((p, i) => (
                    <SortableProduct
                      key={p.id}
                      index={i}
                      product={p}
                      removable={canRemoveProducts}
                      onClick={async () => {
                        if (!canRemoveProducts) {
                          setProductError(
                            `Un outfit debe conservar al menos ${MIN_OUTFIT_PRODUCTS} prendas.`
                          );
                          return;
                        }

                        await removeProduct.fetch({
                          url: `outfits/${params.outfitId}/products/${p.id}`,
                        });
                        setProductError(null);
                        setMovedProducts([]);
                        await outfit.refetch();
                      }}
                    />
                  ))}
                </div>
                {productError && (
                  <p className="px-4 text-center text-sm text-destructive">{productError}</p>
                )}
                <div>
                  <h1 className="mt-2 mb-4 text-primary text-center text-3xl">
                    <strong>Total: </strong>
                    {formatDisplayPrice(
                      convertPrice(
                        outfitProducts
                          .map((product) => product.priceInCents)
                          .reduce((accumulator, currentPrice) => accumulator + currentPrice, 0)
                      )
                    )}
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
                      router.push(`/stores/${params.id}/outfits`);
                    }}
                    className="mt-8 h-12 w-full self-center rounded-lg bg-secondary text-center text-md font-bold text-white hover:bg-dark-secondary sm:w-1/2"
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
                          <h1 className="md:mb-3 break-words font-bold text-primary text-center text-lg md:text-2xl">
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
                          {formatDisplayPrice(convertPrice(p.priceInCents))}
                        </h1>
                        <div className="flex flex-row justify-center">
                          <Button
                            onClick={async () => {
                              const dto: OutfitCreationProductDTO = {
                                productId: p.id,
                                index: outfitProducts.length,
                              };
                              await addProduct.fetch({ body: dto });
                              setProductError(null);
                              setMovedProducts([]);
                              await outfit.refetch();
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
      )}
    </StoreOwnerGuard>
  );
}
