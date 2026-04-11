'use client';

import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { Button } from '@/components/ui/button';
import { useActiveFetcher } from '@/lib/api/fetcher';
import { useAuth } from '@/lib/auth/AuthContext';
import { OrderDTO } from '@/lib/types/orders/orderDto';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { discountPrice, formatDisplayPrice } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaTag } from 'react-icons/fa';
import { GoDotFill } from 'react-icons/go';
import { FetchError } from 'ofetch';
import AuthModal from '@/components/modals/AuthModal';
import OrderSuccessModal from '@/components/modals/OrderSuccessModal';
import { ConfirmOrderModal } from '@/components/modals/ConfirmOrderModal';

export interface ClientOutfitDetailsPageProps {
  outfit?: OutfitDTO;
}

export default function ClientOutfitDetailsPage(props: ClientOutfitDetailsPageProps) {
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
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
      await createOrder.fetch({
        url: `orders?outfitId=${props.outfit.id}`,
        body: payload,
      });
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
            <div className="pt-8 pl-8 pr-8 pb-4 w-full max-w-2xl">
              <h1 className="mb-1 font-bold text-primary text-center text-3xl wrap-break-word">
                {props.outfit.name}
              </h1>
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
                    <p className="font-bold text-white text-center text-sm">{t.name}</p>
                  </div>
                ))}
              </div>

              {props.outfit.description && (
                <div className="text-center max-w-3xl mx-auto py-4">
                  <p className="text-secondary text-md">
                    {descriptionExpanded
                      ? props.outfit.description
                      : props.outfit.description.slice(0, 300) + '...'}
                  </p>

                  {props.outfit.description.length > 300 && (
                    <div
                      onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                      className="flex justify-center mt-2 cursor-pointer text-primary"
                    >
                      {descriptionExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                  )}
                </div>
              )}
              <div>
                <h1 className="mt-4 mb-4 text-primary text-2xl">
                  <strong>Total: </strong>
                  {`${formatDisplayPrice(
                    discountPrice(
                      props.outfit.priceInCents,
                      props.outfit.discountPercentage ?? null
                    )
                  )} (IVA incluido)`}
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

            {isConfirmModalOpen && (
              <ConfirmOrderModal
                price={discountPrice(
                  props.outfit.priceInCents,
                  props.outfit.discountPercentage ?? null
                )}
                isCreatingOrder={isCreatingOrder}
                onConfirm={confirmAndCreateOrder}
                onClose={() => setIsConfirmModalOpen(false)}
              >
                {/* Include product variants */}
              </ConfirmOrderModal>
            )}
          </>
        ) : (
          <NotFoundText message="El outfit que buscas no existe..." />
        )}
      </div>

      {isAuthModalOpen && (
        <AuthModal
          message={
            'Para poder hacer un pedido necesitas iniciar sesión o crear una cuenta en la plataforma.'
          }
          setOpenModal={setIsAuthModalOpen}
        />
      )}

      {isSuccessModalOpen && <OrderSuccessModal setOpenModal={setIsSuccessModalOpen} />}
    </>
  );
}
