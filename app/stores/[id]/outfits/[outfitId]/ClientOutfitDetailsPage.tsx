'use client';

import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { Button } from '@/components/ui/button';
import { useActiveFetcher } from '@/lib/api/fetcher';
import { useAuth } from '@/lib/auth/AuthContext';
import { OrderDTO } from '@/lib/types/orders/orderDto';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { discountPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FaTag } from 'react-icons/fa';
import { GoDotFill } from 'react-icons/go';

interface FetchError {
  status?: number;
  message?: string;
}

export interface ClientOutfitDetailsPageProps {
  outfit?: OutfitDTO;
}

export default function ClientOutfitDetailsPage(props: ClientOutfitDetailsPageProps) {
  const buttonLinkClass =
    'w-full inline-flex items-center justify-center h-9 px-4 py-2 rounded-md cursor-pointer text-sm font-medium tracking-normal whitespace-nowrap font-[inherit]';

  const [selectedProduct, setSelectedProduct] = useState(0);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();

  const isClient = Boolean(user?.client?.id);

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
                    onClick={() => setSelectedProduct(i)}
                    className={`cursor-pointer ${i === selectedProduct ? 'text-secondary' : 'text-ring'}`}
                  />
                ))}
              </div>
            </div>
            <div className="pt-4 pb-8 pl-8 pr-8 w-full md:w-8/12 flex flex-col items-center">
              <div>
                <h1 className="text-primary text-2xl">
                  {props.outfit.products[selectedProduct].name}
                </h1>
              </div>
              <div
                className="pt-8 pb-6 flex flex-row w-fit max-w-11/12 self-center overflow-x-auto items-center gap-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {props.outfit.products.map((p, i) => (
                  <Button
                    key={p.id}
                    onClick={() => setSelectedProduct(i)}
                    className={
                      'w-20 h-20 md:w-40 md:h-40 object-cover shrink-0 bg-cover bg-center rounded-lg shadow-lg cursor-pointer ' +
                      (i === selectedProduct ? 'border-4 border-ring' : '')
                    }
                    style={{
                      backgroundImage: `url(${p.image || '/static/img/product_placeholder.png'})`,
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-row gap-4 flex-wrap">
                {props.outfit.tags.map((t, i) => (
                  <div key={i} className="p-2 rounded-lg bg-secondary flex flex-row gap-1 shrink-0">
                    <FaTag className="text-white text-xl"></FaTag>
                    <p className="font-bold text-white text-center text-sm">{t}</p>
                  </div>
                ))}
              </div>
              <div>
                <h1 className="mt-4 mb-4 text-primary text-2xl">
                  <strong>Total: </strong>
                  {`${discountPrice(
                    props.outfit.priceInCents,
                    props.outfit.discountPercentage ?? null
                  )
                    .toFixed(2)
                    .toString()
                    .replace('.', ',')}€ con IVA`}
                </h1>
              </div>
              {isClient && (
                <Button
                  onClick={() => setIsConfirmModalOpen(true)}
                  className="self-center bg-secondary hover:bg-dark-secondary text-white font-bold text-xl h-12 w-11/12 md:w-1/3"
                >
                  Hacer pedido
                </Button>
              )}
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
                <strong>{`${discountPrice(
                  props.outfit.priceInCents,
                  props.outfit.discountPercentage ?? null
                )
                  .toFixed(2)
                  .toString()
                  .replace('.', ',')}€`}</strong>
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
              <Link
                href="/login"
                className={`${buttonLinkClass} bg-secondary hover:bg-dark-secondary text-white font-bold`}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className={`${buttonLinkClass} bg-primary hover:bg-dark-primary text-white font-bold`}
              >
                Registrarme
              </Link>
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
              <Link
                href="/orders"
                className={`${buttonLinkClass} bg-secondary hover:bg-dark-secondary text-white font-bold`}
              >
                Ver mis pedidos
              </Link>
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
