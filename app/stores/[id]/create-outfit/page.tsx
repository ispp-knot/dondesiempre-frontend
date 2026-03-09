'use client';

import ErrorText from '@/components/dondeSiempre/ErrorText';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import SortableProduct from '@/components/dondeSiempre/SortableProduct';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import useFetcher from '@/lib/api/fetcher';
import { createOutfit } from '@/lib/api/outfitEndpoints';
import { StoreDTO } from '@/lib/api/types';
import { OutfitCreation, productToOufitCreationProduct } from '@/lib/types/outfits';
import { Product } from '@/lib/types/products';
import { convertPrice } from '@/lib/utils';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import Image from 'next/image';
import { redirect, useParams } from 'next/navigation';
import { useState } from 'react';
import { FaTag } from 'react-icons/fa';

export default function OutfitCreationPage() {
  const params = useParams<{ id: string }>();

  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [outfitProducts, setOutfitProducts] = useState(new Array<Product>());
  const [outfitTags, setOutfitTags] = useState(new Array<string>());

  const products = useFetcher<Product[]>({ url: `stores/${params.id}/products` });
  const store = useFetcher<StoreDTO>({ url: `stores/${params.id}` });

  if (products.isLoading || store.isLoading) {
    return <LoadingText />;
  }

  if (products.isError || store.isError) {
    return (
      <>
        <ErrorText error={products.error} />
        <ErrorText error={store.error} />
      </>
    );
  }

  const submitForm = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const dto: OutfitCreation = {
      name: (document.getElementById('form-name') as HTMLInputElement).value,
      description: (document.getElementById('form-description') as HTMLInputElement).value || null,
      index: Number.parseInt((document.getElementById('form-index') as HTMLInputElement).value),
      storefrontId: store.data.storefront.id,
      tags: outfitTags,
      products: outfitProducts.map((product, index) =>
        productToOufitCreationProduct(product, index)
      ),
    };
    await createOutfit(dto, imageFile);
    redirect(`/stores/${params.id}/outfits`);
  };

  return (
    <>
      {products.data ? (
        <DragDropProvider
          onDragEnd={(event) => {
            if (event.canceled) {
              return;
            }
            setOutfitProducts(move(outfitProducts, event));
          }}
        >
          <div className="flex flex-col items-center">
            <div className="w-full md:w-8/12">
              <Card className="p-4 pt-8 m-4 mb-8 shadow-xl">
                <h1 className="mb-3 font-bold text-primary text-center text-3xl">Crear outfit</h1>
                <div className="w-full flex flex-col items-center">
                  <form
                    action={`/stores/${params.id}/outfits`}
                    method="GET"
                    onSubmit={submitForm}
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
                        minLength={1}
                        maxLength={255}
                        required
                        className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                      />
                      <label
                        htmlFor="form-description"
                        className="font-bold text-lg text-secondary"
                      >
                        Descripción:{' '}
                      </label>
                      <input
                        type="text"
                        name="description"
                        minLength={0}
                        maxLength={5000}
                        id="form-description"
                        className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                      />
                      <label htmlFor="form-image" className="font-bold text-lg text-secondary">
                        Imagen:{' '}
                      </label>
                      <div className="flex flex-col items-center">
                        <Image
                          id="form-image-preview"
                          src={imageSrc || '/static/img/product_placeholder.png'}
                          alt={'Sin imagen'}
                          width={512}
                          height={512}
                          loading="eager"
                          className="w-30 h-30 md:w-50 md:h-50 object-cover shrink-0 rounded-lg shadow-lg text-center text-secondary"
                        ></Image>
                        <input
                          type="file"
                          name="image"
                          id="form-image"
                          accept="image/*"
                          src={undefined}
                          onChange={() => {
                            const input = document.getElementById('form-image') as HTMLInputElement;
                            const file = input.files?.item(0) ?? null;
                            setImageFile(file);
                            if (file) {
                              setImageSrc(URL.createObjectURL(file));
                            }
                          }}
                          className="cursor-pointer border border-secondary rounded pt-2 pb-2 pl-3 pr-3 mt-4 mb-2 text-heading text-sm text-secondary rounded-base focus:ring-brand focus:border-brand block w-full shadow-xs placeholder:text-body"
                        />
                      </div>
                      <label htmlFor="form-index" className="font-bold text-lg text-secondary">
                        Índice:{' '}
                      </label>
                      <input
                        type="number"
                        name="index"
                        id="form-index"
                        min="0"
                        step="1"
                        defaultValue={0}
                        required
                        className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                      />
                      <label htmlFor="form-tags" className="font-bold text-lg text-secondary">
                        Etiquetas:{' '}
                      </label>
                      <input
                        type="text"
                        name="tags"
                        id="form-tags"
                        onChange={async () => {
                          const element = document.getElementById('form-tags') as HTMLInputElement;

                          if (element.value.includes(' ')) {
                            setOutfitTags([...outfitTags, element.value.trim()]);
                            element.value = '';
                          }
                        }}
                        className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div className="flex flex-row gap-4 flex-wrap">
                      {outfitTags.map((t, i) => (
                        <Button
                          key={i}
                          onClick={async () => {
                            setOutfitTags(outfitTags.filter((tag, index) => index != i));
                          }}
                          className="p-2 rounded-lg bg-secondary hover:bg-dark-secondary flex flex-row gap-1 shrink-0"
                        >
                          <FaTag className="text-white"></FaTag>
                          <p className="font-bold text-white text-center text-xs">{t}</p>
                        </Button>
                      ))}
                    </div>
                    <div className="flex flex-row w-full self-center overflow-x-auto items-center gap-4 p-4">
                      {outfitProducts.map((p, i) => (
                        <SortableProduct
                          key={p.id}
                          index={i}
                          product={p}
                          removable={true}
                          onClick={async () => {
                            setOutfitProducts(
                              outfitProducts.filter((product) => product.id !== p.id)
                            );
                          }}
                        />
                      ))}
                    </div>
                    <div>
                      <h1 className="mt-2 mb-4 text-primary text-center text-3xl">
                        <strong>Total: </strong>
                        {`${convertPrice(
                          outfitProducts.length > 0
                            ? outfitProducts
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
                        disabled={outfitProducts.length <= 0}
                      >
                        Crear outfit
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>
              <Card className="p-4 m-4 pt-8">
                <h1 className="md:mb-3 font-bold text-primary text-center text-3xl">Productos</h1>
                <div className="grid grid-cols-2 md:gap-2">
                  {products.data
                    .filter((p) => !outfitProducts.map((product) => product.id).includes(p.id))
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
                            onClick={() => {
                              setOutfitProducts([...outfitProducts, p]);
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
        <NotFoundText message="No hay productos para crear un outfit..." />
      )}
    </>
  );
}
