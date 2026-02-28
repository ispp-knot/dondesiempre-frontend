'use client';

import ErrorText from '@/components/dondeSiempre/ErrorText';
import LabelledSwitch from '@/components/dondeSiempre/LabelledSwitch';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { Button } from '@/components/ui/button';
import { addTag, getOutfit, removeTag, updateOutfit } from '@/lib/api/outfitEndpoints';
import { OutfitUpdate } from '@/lib/types/outfits';
import { convertPrice } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { redirect, useParams } from 'next/navigation';
import { useState } from 'react';
import { FaTag } from 'react-icons/fa6';
import { GoDotFill } from 'react-icons/go';
import Image from 'next/image';

export default function OutfitDetailsPage() {
  const params = useParams<{ id: string; outfitId: string }>();
  const outfitId = params.outfitId;
  const storefrontId = params.id;

  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(0);

  const outfitQuery = useQuery({
    queryKey: ['outfit', outfitId],
    queryFn: () => getOutfit(outfitId),
  });

  if (outfitQuery.isLoading) {
    return <LoadingText />;
  }

  if (outfitQuery.isError) {
    return <ErrorText error={outfitQuery.error} />;
  }

  const submitForm = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!outfitQuery.data) {
      return;
    }

    const dto: OutfitUpdate = {
      name: (document.getElementById('form-name') as HTMLInputElement).value,
      description: (document.getElementById('form-description') as HTMLInputElement).value || null,
      image: (document.getElementById('form-image-preview') as HTMLInputElement).src || null,
      discountedPriceInCents:
        Number.parseFloat(
          (document.getElementById('form-discounted-price') as HTMLInputElement).value
        ) * 100,
      index: Number.parseInt((document.getElementById('form-index') as HTMLInputElement).value),
    };
    await updateOutfit(outfitQuery.data.id, dto);
    redirect(`/storefront/${storefrontId}/outfits`);
  };

  return (
    <>
      <LabelledSwitch
        label="Modo tienda"
        checked={isAdmin}
        onCheckedChange={(checked) => setIsAdmin(checked)}
      />
      <div className="flex flex-col items-center">
        {outfitQuery.data ? (
          isAdmin ? (
            <>
              <h1 className="mb-8 font-bold text-primary text-center text-3xl">Editar outfit</h1>
              <form
                action={`/storefront/${storefrontId}/outfits`}
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
                    defaultValue={outfitQuery.data.name}
                    required
                    className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                  />
                  <label htmlFor="form-description" className="font-bold text-lg text-secondary">
                    Descripción:{' '}
                  </label>
                  <input
                    type="text"
                    name="description"
                    minLength={0}
                    maxLength={5000}
                    defaultValue={outfitQuery.data.description || ''}
                    id="form-description"
                    className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                  />
                  <label htmlFor="form-image" className="font-bold text-lg text-secondary">
                    Imagen:{' '}
                  </label>
                  <div className="flex flex-col items-center">
                    <Image
                      id="form-image-preview"
                      src={outfitQuery.data.image || '/static/img/product_placeholder.png'}
                      alt={'Sin imagen'}
                      width={512}
                      height={512}
                      quality={100}
                      className="w-30 h-30 md:w-50 md:h-50 object-cover shrink-0 rounded-lg shadow-lg text-center text-secondary"
                    ></Image>
                    <input
                      type="file"
                      name="image"
                      id="form-image"
                      accept="image/*"
                      src={outfitQuery.data.image || undefined}
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
                  <label
                    htmlFor="form-discounted-price"
                    className="font-bold text-lg text-secondary"
                  >
                    Precio rebajado:{' '}
                  </label>
                  <input
                    type="number"
                    name="discounted-price"
                    id="form-discounted-price"
                    min="0.00"
                    step="0.01"
                    defaultValue={`${convertPrice(outfitQuery.data.discountedPriceInCents)}`}
                    required
                    className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                  />
                  <label htmlFor="form-index" className="font-bold text-lg text-secondary">
                    Índice:{' '}
                  </label>
                  <input
                    type="number"
                    name="index"
                    id="form-index"
                    min="0"
                    step="1"
                    defaultValue={outfitQuery.data.index}
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
                        await addTag(outfitQuery.data.id, element.value.trim());
                        element.value = '';
                        outfitQuery.refetch();
                      }
                    }}
                    className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="flex flex-row gap-4 flex-wrap">
                  {outfitQuery.data.tags.map((t, i) => (
                    <Button
                      key={i}
                      type="button"
                      onClick={async () => {
                        await removeTag(outfitQuery.data.id, t);
                        outfitQuery.refetch();
                      }}
                      className="p-2 rounded-lg bg-secondary hover:bg-dark-secondary flex flex-row gap-1 shrink-0"
                    >
                      <FaTag className="text-white"></FaTag>
                      <p className="font-bold text-white text-center text-xs">{t}</p>
                    </Button>
                  ))}
                </div>
                <div className="flex flex-row justify-center mb-8">
                  <Button
                    type="submit"
                    className="self-center bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-md h-12 md:w-1/3 mt-8"
                  >
                    Confirmar cambios
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
              <div className="pt-8 pl-8 pr-8 pb-4">
                <div>
                  <h1 className="mb-1 font-bold text-primary text-center text-3xl">
                    {outfitQuery.data.name}
                  </h1>
                  {outfitQuery.data.description ? (
                    <p className="text-secondary text-center text-md">
                      {outfitQuery.data.description}
                    </p>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-center relative">
                <Image
                  src={
                    outfitQuery.data.products[selectedProduct].image ||
                    '/static/img/product_placeholder.png'
                  }
                  alt={outfitQuery.data.products[selectedProduct].name}
                  width={1024}
                  height={1024}
                  quality={100}
                  loading={'eager'}
                  className="aspect-square w-full md:w-sm object-cover md:rounded-lg shrink-0 shadow-lg"
                ></Image>
                <div className="mb-1 flex flex-row justify-center absolute bottom-0">
                  {outfitQuery.data.products.map((p, i) => (
                    <GoDotFill
                      key={i}
                      className={i === selectedProduct ? 'text-secondary' : 'text-ring'}
                    ></GoDotFill>
                  ))}
                </div>
              </div>
              <div className="pt-4 pb-8 pl-8 pr-8 w-full md:w-8/12 flex flex-col items-center">
                <div>
                  <h1 className="text-primary text-2xl">
                    {outfitQuery.data.products[selectedProduct].name}
                  </h1>
                </div>
                <div className="pt-8 pb-6 flex flex-row w-fit max-w-11/12 self-center overflow-x-scroll items-center gap-4">
                  {outfitQuery.data.products.map(
                    (p, i) =>
                      p.image && (
                        <Button
                          key={p.id}
                          onClick={() => setSelectedProduct(i)}
                          className={
                            'w-20 h-20 md:w-40 md:h-40 object-cover shrink-0 bg-cover bg-center rounded-lg shadow-lg ' +
                            (i === selectedProduct ? 'border-4 border-ring' : '')
                          }
                          style={{ backgroundImage: `url(${p.image})` }}
                        ></Button>
                      )
                  )}
                </div>
                <div>
                  <h1 className="mt-4 mb-4 text-primary text-2xl">
                    <strong>Total: </strong>
                    {`${convertPrice(outfitQuery.data.discountedPriceInCents).toFixed(2).toString().replace('.', ',')}€ con IVA`}
                  </h1>
                </div>
                <Button className="self-center bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-xl h-12 w-11/12 md:w-1/3">
                  Añadir al carrito
                </Button>
              </div>
            </>
          )
        ) : (
          <NotFoundText message="El outfit que buscas no existe..." />
        )}
      </div>
    </>
  );
}
