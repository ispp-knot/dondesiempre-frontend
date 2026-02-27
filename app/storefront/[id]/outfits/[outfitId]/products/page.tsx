'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { addProduct, getOutfit, removeProduct } from '@/lib/api/outfitEndpoints';
import { getProductsOfStorefront } from '@/lib/api/productEndpoints';
import { OutfitCreationProduct } from '@/lib/types/outfits';
import { convertPrice } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { FaExchangeAlt } from 'react-icons/fa';
import { GrSearch } from 'react-icons/gr';
import { IoIosCloseCircle } from 'react-icons/io';
import ErrorText from '../../../../../../components/dondeSiempre/ErrorText';
import LoadingText from '../../../../../../components/dondeSiempre/LoadingText';

export default function OutfitProductsPage() {
  const params = useParams<{ id: string; outfitId: string }>();
  const outfitId = Number.parseInt(params.outfitId);
  const storefrontId = Number.parseInt(params.id);

  const productsQuery = useQuery({
    queryKey: ['products', storefrontId],
    queryFn: () => getProductsOfStorefront(storefrontId),
  });

  const outfitQuery = useQuery({
    queryKey: ['outfit', outfitId],
    queryFn: () => getOutfit(outfitId),
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
        {productsQuery.isError && <ErrorText error={productsQuery.error} />}
        {outfitQuery.isError && <ErrorText error={outfitQuery.error} />}
      </>
    );
  }
  const outfitProducts = outfitQuery.data?.products.sort((b, a) => a.index - b.index);
  return productsQuery.data && outfitQuery.data && outfitProducts ? (
    <>
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
              <div>
                <Card key={outfitProducts[0].id} className="p-2 gap-2 shrink-0">
                  {outfitProducts.length > 1 ? (
                    <IoIosCloseCircle
                      onClick={async () => {
                        await removeProduct(outfitId, outfitProducts[0].id);
                        outfitQuery.refetch();
                      }}
                      className="text-2xl text-secondary hover:text-dark-secondary"
                    />
                  ) : (
                    <></>
                  )}
                  <img
                    src={outfitProducts[0].image || undefined}
                    alt={'Imagen de producto'}
                    className="w-30 md:w-50 aspect-square object-cover shrink-0 rounded-lg shadow-lg"
                  ></img>
                  <h1 className="mb-1 font-bold text-center text-md">
                    {`${convertPrice(outfitProducts[0].priceInCents).toFixed(2).toString().replace('.', ',')}€`}
                  </h1>
                </Card>
              </div>
              {outfitProducts.slice(1).map((p) => (
                <div key={p.id} className="inline-block relative">
                  <Button
                    onClick={() => {}}
                    className="text-white font-bold bg-secondary hover:bg-dark-secondary absolute right-11/12 top-1/2 aspect-square w-1/4"
                  >
                    <FaExchangeAlt></FaExchangeAlt>
                  </Button>
                  <Card className="p-2 gap-2 shrink-0">
                    {outfitProducts.length > 1 ? (
                      <IoIosCloseCircle
                        onClick={async () => {
                          await removeProduct(outfitId, p.id);
                          outfitQuery.refetch();
                        }}
                        className="text-2xl text-secondary hover:text-dark-secondary"
                      />
                    ) : (
                      <></>
                    )}
                    <img
                      src={p.image || undefined}
                      alt={'Imagen de producto'}
                      className="w-30 md:w-50 aspect-square object-cover shrink-0 rounded-lg shadow-lg"
                    ></img>
                    <h1 className="mb-1 font-bold text-center text-md">
                      {`${convertPrice(p.priceInCents).toFixed(2).toString().replace('.', ',')}€`}
                    </h1>
                  </Card>
                </div>
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
                      <img
                        src={p.image || undefined}
                        alt={'Imagen de producto'}
                        className="w-30 h-30 md:w-50 md:h-50 object-cover shrink-0 rounded-lg shadow-lg"
                      ></img>
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
    </>
  ) : (
    <div className="mt-16 flex flex-col items-center gap-4">
      <p className="text-secondary font-bold text-center text-4xl">¡Vaya!</p>
      <GrSearch className="mt-4 ml-4 text-8xl text-secondary"></GrSearch>
      <p className="mt-4 text-secondary text-center text-lg w-8/12">
        El outfit que buscas no existe...
      </p>
    </div>
  );
}
