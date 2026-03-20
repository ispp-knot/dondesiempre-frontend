'use client';

import ErrorText from '@/components/dondeSiempre/ErrorText';
import ImageUpload from '@/components/dondeSiempre/ImageUpload';
import LabelledSwitch from '@/components/dondeSiempre/LabelledSwitch';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { Button } from '@/components/ui/button';
import { usePassiveFetcher, useActiveFetcher } from '@/lib/api/fetcher';
import { OutfitDTO, OutfitUpdateDTO } from '@/lib/types/outfits/outfitsDto';
import { OrderDTO } from '@/lib/types/orders/orderDto';
import {
  calculatePriceWithPercentageDiscount,
  convertPrice,
  outfitWithDiscount,
} from '@/lib/utils';
import Image from 'next/image';
import { redirect, useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaTag } from 'react-icons/fa6';
import { GoDotFill } from 'react-icons/go';

interface FetchError {
  status?: number;
  message?: string;
}

export default function OutfitDetailsPage() {
  const params = useParams<{ id: string; outfitId: string }>();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const outfit = usePassiveFetcher<OutfitDTO>({ url: `outfits/${params.outfitId}` });
  const updateOutfit = useActiveFetcher<OutfitDTO>({
    url: `outfits/${params.outfitId}`,
    method: 'PUT',
  });
  const addTag = useActiveFetcher<void>({
    url: `outfits/${params.outfitId}/tags`,
    method: 'POST',
  });
  const removeTag = useActiveFetcher<void>({
    url: `outfits/${params.outfitId}/tags`,
    method: 'DELETE',
  });
  const createOrder = useActiveFetcher<OrderDTO>({
    url: 'orders',
    method: 'POST',
  });

  if (outfit.isLoading) {
    return <LoadingText />;
  }

  if (outfit.isError) {
    return <ErrorText error={outfit.error} />;
  }

  const confirmAndCreateOrder = async () => {
    if (!outfit.data) return;

    setIsCreatingOrder(true);

    const payload: Record<string, number> = {};
    outfit.data.products.forEach((product) => {
      payload[product.id] = 1;
    });

    try {
      await createOrder.fetch({ body: payload });
      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error: unknown) {
      const err = error as FetchError;
      console.error('Error al crear el pedido:', err);

      if (
        err?.status === 401 ||
        err?.status === 403 ||
        err?.message?.includes('401') ||
        err?.message?.includes('403')
      ) {
        setIsConfirmModalOpen(false);
        setIsAuthModalOpen(true);
      } else {
        alert('Hubo un problema al crear el pedido.');
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const submitForm = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!outfit.data) {
      return;
    }

    const dto: OutfitUpdateDTO = {
      name: (document.getElementById('form-name') as HTMLInputElement).value,
      description: (document.getElementById('form-description') as HTMLInputElement).value || null,
      discountedPriceInCents: Number.parseFloat(
        (document.getElementById('form-discounted-price') as HTMLInputElement).value
      ),
      index: Number.parseInt((document.getElementById('form-index') as HTMLInputElement).value),
    };

    await updateOutfit.fetch({
      formPayload: {
        dto: new Blob([JSON.stringify(dto)], { type: 'application/json' }),
        image: imageFile ?? undefined,
      },
    });
    redirect(`/stores/${params.id}/outfits`);
  };

  return (
    <>
      <LabelledSwitch
        label="Modo tienda"
        checked={isAdmin}
        onCheckedChange={(checked) => setIsAdmin(checked)}
      />
      <div className="flex flex-col items-center relative">
        {outfit.data ? (
          isAdmin ? (
            <>
              <h1 className="mb-8 font-bold text-primary text-center text-3xl">Editar outfit</h1>
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
                    defaultValue={outfit.data.name}
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
                    defaultValue={outfit.data.description || ''}
                    id="form-description"
                    className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                  />
                  <label className="font-bold text-lg text-secondary">Imagen:</label>
                  <ImageUpload
                    onChange={setImageFile}
                    existingImageUrl={outfit.data.image || undefined}
                  />
                  <label
                    htmlFor="form-discounted-price"
                    className="font-bold text-lg text-secondary"
                  >
                    Descuento:{' '}
                  </label>
                  <input
                    type="number"
                    name="discounted-price"
                    id="form-discounted-price"
                    min="0.00"
                    max="100.00"
                    step="0.01"
                    defaultValue={outfit.data.discountedPriceInCents}
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
                    defaultValue={outfit.data.index}
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
                        await addTag.fetch({ body: element.value.trim() });
                        element.value = '';
                        outfit.refetch();
                      }
                    }}
                    className="shadow appearance-none border border-secondary leading-tight w-full rounded pt-2 pb-2 pl-3 pr-3 mb-2 text-secondary focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div className="flex flex-row gap-4 flex-wrap">
                  {outfit.data.tags.map((t, i) => (
                    <Button
                      key={i}
                      type="button"
                      onClick={async () => {
                        await removeTag.fetch({ body: t });
                        outfit.refetch();
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
                    {outfit.data.name}
                  </h1>
                  {outfit.data.description ? (
                    <p className="text-secondary text-center text-md">{outfit.data.description}</p>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-center relative">
                <Image
                  src={
                    outfit.data.products[selectedProduct].image ||
                    '/static/img/product_placeholder.png'
                  }
                  alt={outfit.data.products[selectedProduct].name}
                  width={1024}
                  height={1024}
                  loading={'eager'}
                  className="aspect-square w-full md:w-sm object-cover md:rounded-lg shrink-0 shadow-lg"
                ></Image>
                <div className="mb-1 flex flex-row justify-center absolute bottom-0">
                  {outfit.data.products.map((_, i) => (
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
                    {outfit.data.products[selectedProduct].name}
                  </h1>
                </div>
                <div className="pt-8 pb-6 flex flex-row w-fit max-w-11/12 self-center overflow-x-scroll items-center gap-4">
                  {outfit.data.products.map((p, i) => (
                    <Button
                      key={p.id}
                      onClick={() => setSelectedProduct(i)}
                      className={
                        'w-20 h-20 md:w-40 md:h-40 object-cover shrink-0 bg-cover bg-center rounded-lg shadow-lg ' +
                        (i === selectedProduct ? 'border-4 border-ring' : '')
                      }
                      style={{
                        backgroundImage: `url(${p.image || '/static/img/product_placeholder.png'})`,
                      }}
                    ></Button>
                  ))}
                </div>
                <div>
                  {outfitWithDiscount(outfit.data) ? (
                    <h1 className="mt-4 mb-4 text-primary text-2xl">
                      <strong>Total: </strong>
                      {`${calculatePriceWithPercentageDiscount(
                        outfit.data.priceInCents,
                        outfit.data.discountedPriceInCents
                      )
                        .toFixed(2)
                        .toString()
                        .replace('.', ',')}€ con IVA`}
                    </h1>
                  ) : (
                    <h1 className="mt-4 mb-4 text-primary text-2xl">
                      <strong>Total: </strong>
                      {`${convertPrice(outfit.data.priceInCents)
                        .toFixed(2)
                        .toString()
                        .replace('.', ',')}€ con IVA`}
                    </h1>
                  )}
                </div>
                <Button
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="self-center bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-xl h-12 w-11/12 md:w-1/3"
                >
                  Hacer pedido
                </Button>
              </div>
            </>
          )
        ) : (
          <NotFoundText message="El outfit que buscas no existe..." />
        )}
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background p-8 rounded-lg shadow-xl flex flex-col items-center gap-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-primary text-center">¿Confirmar pedido?</h2>
            {outfit.data && (
              <p className="text-secondary text-center">
                Vas a realizar un pedido por un total de{' '}
                {outfitWithDiscount(outfit.data) ? (
                  <strong>{`${calculatePriceWithPercentageDiscount(
                    outfit.data.priceInCents,
                    outfit.data.discountedPriceInCents
                  )
                    .toFixed(2)
                    .toString()
                    .replace('.', ',')}€`}</strong>
                ) : (
                  <strong>{`${convertPrice(outfit.data.priceInCents)
                    .toFixed(2)
                    .toString()
                    .replace('.', ',')}€`}</strong>
                )}
                .
              </p>
            )}
            <div className="flex flex-col w-full gap-3">
              <Button
                onClick={confirmAndCreateOrder}
                disabled={isCreatingOrder}
                className="w-full bg-secondary hover:bg-dark-secondary disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold"
              >
                {isCreatingOrder ? 'Procesando...' : 'Confirmar pedido'}
              </Button>
              <Button
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isCreatingOrder}
                variant="outline"
                className="w-full font-bold"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background p-8 rounded-lg shadow-xl flex flex-col items-center gap-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-primary text-center">
              ¡Ups! No estás registrado
            </h2>
            <p className="text-secondary text-center">
              Para poder hacer un pedido necesitas iniciar sesión o crear una cuenta en la
              plataforma.
            </p>
            <div className="flex flex-col w-full gap-3">
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-secondary hover:bg-dark-secondary text-white font-bold"
              >
                Iniciar sesión
              </Button>
              <Button
                onClick={() => router.push('/register')}
                className="w-full bg-primary hover:bg-dark-primary text-white font-bold"
              >
                Registrarme
              </Button>
              <Button
                onClick={() => setIsAuthModalOpen(false)}
                variant="outline"
                className="w-full font-bold"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background p-8 rounded-lg shadow-xl flex flex-col items-center gap-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-primary text-center">
              ¡Pedido creado con éxito!
            </h2>
            <p className="text-secondary text-center">¿Qué te gustaría hacer ahora?</p>
            <div className="flex flex-col w-full gap-3">
              <Button
                onClick={() => {
                  console.log('Abrir chat con la tienda');
                }}
                className="w-full bg-primary hover:bg-dark-primary text-white font-bold"
              >
                Chatea con la tienda
              </Button>
              <Button
                onClick={() => router.push('/orders')}
                className="w-full bg-secondary hover:bg-dark-secondary text-white font-bold"
              >
                Ver mis pedidos
              </Button>
              <Button
                onClick={() => setIsSuccessModalOpen(false)}
                variant="outline"
                className="w-full font-bold"
              >
                Seguir explorando
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
