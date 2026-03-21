'use client';

import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { Button } from '@/components/ui/button';
import { useActiveFetcher } from '@/lib/api/fetcher';
import { OrderDTO } from '@/lib/types/orders/orderDto';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { convertPrice } from '@/lib/utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GoDotFill } from 'react-icons/go';

interface FetchError {
  status?: number;
  message?: string;
}

export interface ClientOutfitDetailsPageProps {
  outfit?: OutfitDTO;
}

export default function ClientOutfitDetailsPage(props: ClientOutfitDetailsPageProps) {
  const router = useRouter();

  const [selectedProduct, setSelectedProduct] = useState(0);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const createOrder = useActiveFetcher<OrderDTO>({
    url: 'orders',
    method: 'POST',
  });

  const confirmAndCreateOrder = async () => {
    if (!props.outfit) return;

    setIsCreatingOrder(true);

    const payload: Record<string, number> = {};
    props.outfit.products.forEach((product) => {
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

  return (
    <>
      <div className="flex flex-col items-center relative">
        {props.outfit ? (
          <>
            <div className="pt-8 pl-8 pr-8 pb-4">
              <div>
                <h1 className="mb-1 font-bold text-primary text-center text-3xl">
                  {props.outfit.name}
                </h1>
                {props.outfit.description ? (
                  <p className="text-secondary text-center text-md">{props.outfit.description}</p>
                ) : (
                  <></>
                )}
              </div>
            </div>
            <div className="flex flex-row justify-center relative">
              <Image
                src={
                  props.outfit.products[selectedProduct].image ||
                  '/static/img/product_placeholder.png'
                }
                alt={props.outfit.products[selectedProduct].name}
                width={1024}
                height={1024}
                loading={'eager'}
                className="aspect-square w-full md:w-sm object-cover md:rounded-lg shrink-0 shadow-lg"
              ></Image>
              <div className="mb-1 flex flex-row justify-center absolute bottom-0">
                {props.outfit.products.map((_, i) => (
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
                  {props.outfit.products[selectedProduct].name}
                </h1>
              </div>
              <div className="pt-8 pb-6 flex flex-row w-fit max-w-11/12 self-center overflow-x-scroll items-center gap-4">
                {props.outfit.products.map((p, i) => (
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
                <h1 className="mt-4 mb-4 text-primary text-2xl">
                  <strong>Total: </strong>
                  {`${convertPrice(props.outfit.discountedPriceInCents).toFixed(2).toString().replace('.', ',')}€ con IVA`}
                </h1>
              </div>
              <Button
                onClick={() => setIsConfirmModalOpen(true)}
                className="self-center bg-secondary hover:bg-dark-secondary hover:cursor-pointer text-white font-bold text-xl h-12 w-11/12 md:w-1/3"
              >
                Hacer pedido
              </Button>
            </div>
          </>
        ) : (
          <NotFoundText message="El outfit que buscas no existe..." />
        )}
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background p-8 rounded-lg shadow-xl flex flex-col items-center gap-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-primary text-center">¿Confirmar pedido?</h2>
            {props.outfit && (
              <p className="text-secondary text-center">
                Vas a realizar un pedido por un total de{' '}
                <strong>{`${convertPrice(props.outfit.discountedPriceInCents).toFixed(2).toString().replace('.', ',')}€`}</strong>
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
