'use client';

import LabelledSwitch from '@/components/dondeSiempre/LabelledSwitch';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePassiveFetcher, useActiveFetcher } from '@/lib/api/fetcher';
import { ProductDTO } from '@/lib/types/products/productsDto';
import { convertPrice } from '@/lib/utils';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { IoMdAddCircleOutline } from 'react-icons/io';
import { RiDiscountPercentFill } from 'react-icons/ri';
import ErrorText from '../../../../components/dondeSiempre/ErrorText';
import LoadingText from '../../../../components/dondeSiempre/LoadingText';

export default function ProductsPage() {
  const params = useParams<{ id: string }>();
  const [isAdmin, setIsAdmin] = useState(false);

  const products = usePassiveFetcher<ProductDTO[]>({ url: `stores/${params.id}/products` });
  const deleteProduct = useActiveFetcher<void>({ method: 'DELETE' });

  if (products.isLoading) {
    return <LoadingText />;
  } else if (products.isError) {
    return <ErrorText error={products.error} />;
  }

  return (
    <>
      <LabelledSwitch
        label="Modo tienda"
        checked={isAdmin}
        onCheckedChange={(checked) => setIsAdmin(checked)}
      />
      <div className="flex flex-col items-center">
        <div className="w-full md:w-8/12">
          {isAdmin && (
            <Link href={`/stores/${params.id}/create-product/`}>
              <Card className="p-4 m-4 shadow-xl hover:bg-muted active:bg-input hover:cursor-pointer">
                <div className="p-4 border-4 border-dashed border-secondary rounded-lg flex flex-row justify-center gap-4">
                  <IoMdAddCircleOutline className="mt-8 mb-8 text-secondary text-center text-4xl" />
                  <h1 className="mt-8 mb-8 font-bold text-secondary text-center text-3xl">
                    Crear producto
                  </h1>
                </div>
              </Card>
            </Link>
          )}
          {products.data && products.data.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
              {products.data.map((p) => {
                const hasDiscount = p.discountedPriceInCents !== p.priceInCents;
                const formatPrice = (cents: number) =>
                  `${convertPrice(cents).toFixed(2).toString().replace('.', ',')}€`;

                return (
                  <Card
                    key={p.id}
                    className="relative flex flex-col overflow-hidden shadow-xl pt-0"
                  >
                    {hasDiscount && (
                      <RiDiscountPercentFill className="absolute top-3 left-3 z-10 text-4xl text-primary drop-shadow" />
                    )}
                    <div
                      className="w-full h-52 sm:h-64 md:h-72 bg-cover bg-center shrink-0"
                      style={{
                        backgroundImage: `url(${p.image || '/static/img/product_placeholder.png'})`,
                      }}
                    />
                    <div className="flex flex-col flex-1 p-3 gap-1.5">
                      <h2 className="font-bold text-primary text-lg md:text-xl truncate">
                        {p.name}
                      </h2>
                      {p.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
                          {p.description}
                        </p>
                      )}
                      {hasDiscount ? (
                        <div className="flex flex-row items-baseline gap-2 mt-1">
                          <span className="text-base line-through text-muted-foreground">
                            {formatPrice(p.priceInCents)}
                          </span>
                          <span className="text-xl font-bold text-primary">
                            {formatPrice(p.discountedPriceInCents)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-bold text-primary mt-1">
                          {formatPrice(p.priceInCents)}
                        </span>
                      )}
                      {isAdmin ? (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <Link
                            href={`/stores/${params.id}/products/${p.id}/edit`}
                            className="flex items-center justify-center rounded-lg bg-secondary hover:bg-dark-secondary text-white font-bold text-sm h-10"
                          >
                            Editar
                          </Link>
                          <Button
                            onClick={async () => {
                              await deleteProduct.fetch({ url: `products/${p.id}` });
                              products.refetch();
                            }}
                            className="flex items-center justify-center rounded-lg bg-primary hover:bg-dark-primary text-white font-bold text-sm h-10"
                          >
                            Eliminar
                          </Button>
                        </div>
                      ) : (
                        <Link
                          href={`/stores/${params.id}/products/${p.id}`}
                          className="mt-2 flex items-center justify-center rounded-lg bg-secondary hover:bg-dark-secondary text-white font-bold text-sm h-10"
                        >
                          Ver más
                        </Link>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            !isAdmin && (
              <NotFoundText message="Esta tienda todavía no tiene productos disponibles..." />
            )
          )}
        </div>
      </div>
    </>
  );
}
