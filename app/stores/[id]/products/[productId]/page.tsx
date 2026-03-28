'use client';

import ErrorText from '@/components/dondeSiempre/ErrorText';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { Button } from '@/components/ui/button';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { ProductDTO } from '@/lib/types/products/productsDto';
import { OrderDTO } from '@/lib/types/orders/orderDto';
import { convertPrice } from '@/lib/utils';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { FetchError } from 'ofetch';
import ProductVariantSelector from './ProductVariantSelector';
import AuthModal from '@/components/modals/AuthModal';
import { useAuth } from '@/lib/auth/AuthContext';
import OrderSuccessModal from '@/components/modals/OrderSuccessModal';
import { ConfirmOrderModal } from '@/components/modals/ConfirmOrderModal';

interface ProductVariantDTO {
  id: string;
  size: { id: string; name: string };
  color: { id: string; name: string; hexCode?: string };
  isAvailable: boolean;
}

const MOCK_VARIANTS: ProductVariantDTO[] = [
  {
    id: 'v1',
    size: { id: 's', name: 'S' },
    color: { id: 'black', name: 'Negro', hexCode: '#1a1a1a' },
    isAvailable: true,
  },
  {
    id: 'v2',
    size: { id: 's', name: 'S' },
    color: { id: 'white', name: 'Blanco', hexCode: '#f5f5f5' },
    isAvailable: true,
  },
  {
    id: 'v3',
    size: { id: 's', name: 'S' },
    color: { id: 'navy', name: 'Marino', hexCode: '#1e3a5f' },
    isAvailable: false,
  },
  {
    id: 'v4',
    size: { id: 'm', name: 'M' },
    color: { id: 'black', name: 'Negro', hexCode: '#1a1a1a' },
    isAvailable: true,
  },
  {
    id: 'v5',
    size: { id: 'm', name: 'M' },
    color: { id: 'white', name: 'Blanco', hexCode: '#f5f5f5' },
    isAvailable: true,
  },
  {
    id: 'v6',
    size: { id: 'm', name: 'M' },
    color: { id: 'navy', name: 'Marino', hexCode: '#1e3a5f' },
    isAvailable: true,
  },
  {
    id: 'v7',
    size: { id: 'l', name: 'L' },
    color: { id: 'black', name: 'Negro', hexCode: '#1a1a1a' },
    isAvailable: true,
  },
  {
    id: 'v8',
    size: { id: 'l', name: 'L' },
    color: { id: 'white', name: 'Blanco', hexCode: '#f5f5f5' },
    isAvailable: false,
  },
  {
    id: 'v9',
    size: { id: 'l', name: 'L' },
    color: { id: 'red', name: 'Rojo', hexCode: '#c0392b' },
    isAvailable: true,
  },
  {
    id: 'v10',
    size: { id: 'xl', name: 'XL' },
    color: { id: 'black', name: 'Negro', hexCode: '#1a1a1a' },
    isAvailable: true,
  },
  {
    id: 'v11',
    size: { id: 'xl', name: 'XL' },
    color: { id: 'red', name: 'Rojo', hexCode: '#c0392b' },
    isAvailable: true,
  },
];

function ProductPrice({ product }: { product: ProductDTO }) {
  const fmt = (cents: number) => `${convertPrice(cents).toFixed(2).replace('.', ',')}€`;

  return (
    <div className="text-primary text-2xl">
      {product.discountedPriceInCents !== product.priceInCents ? (
        <span className="flex flex-row items-baseline gap-3">
          <span className="line-through text-muted-foreground text-xl">
            {fmt(product.priceInCents)}
          </span>
          <strong>{fmt(product.discountedPriceInCents)} (IVA incluido)</strong>
        </span>
      ) : (
        <strong>{fmt(product.priceInCents)} (IVA incluido)</strong>
      )}
    </div>
  );
}

export default function ProductDetailsPage() {
  const params = useParams<{ id: string; productId: string }>();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const product = usePassiveFetcher<ProductDTO>({ url: `products/${params.productId}` });
  const variants = { data: MOCK_VARIANTS }; // TODO: reemplazar con variantes reales

  const createOrder = useActiveFetcher<OrderDTO>({ url: 'orders', method: 'POST' });

  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();

  const isClient = Boolean(user?.client?.id);

  if (product.isLoading) return <LoadingText />;
  if (product.isError) return <ErrorText error={product.error} />;
  if (!product.data) return <NotFoundText message="El producto que buscas no existe..." />;

  const selectedVariant =
    variants.data?.find(
      (v) => v.size.id === selectedSize && v.color.id === selectedColor && v.isAvailable
    ) ?? null;

  const hasVariants = (variants.data?.length ?? 0) > 0;
  const canOrder = !hasVariants || selectedVariant !== null;

  const handleSizeChange = (sizeId: string) => {
    setSelectedSize(sizeId);
    setSelectedColor(null);
  };

  const confirmAndCreateOrder = async () => {
    if (!product.data) return;
    setIsCreatingOrder(true);
    try {
      await createOrder.fetch({ body: { [product.data.id]: 1 } });
      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error: unknown) {
      const err = error as FetchError;
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

  const MobileTitle = () => {
    return (
      <div className="md:hidden pt-8 px-8 pb-4 w-full text-center">
        <h1 className="mb-1 font-bold text-primary text-3xl">{product.data.name}</h1>
        {product.data.description && (
          <p className="text-secondary text-md">{product.data.description}</p>
        )}
      </div>
    );
  };

  const DesktopTitle = () => {
    return (
      <div className="hidden md:block">
        <h1 className="font-bold text-primary text-3xl mb-1">{product.data.name}</h1>
        {product.data.description && (
          <p className="text-secondary text-md">{product.data.description}</p>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex flex-col items-center relative">
        <MobileTitle />

        <div className="w-full md:max-w-5xl md:flex md:flex-row md:gap-10 md:px-10 md:py-10">
          <div className="md:w-1/2 shrink-0">
            <Image
              src={product.data.image || '/static/img/product_placeholder.png'}
              alt={product.data.name}
              width={1024}
              height={1024}
              loading="eager"
              className="aspect-square w-full object-cover md:rounded-xl shrink-0 shadow-lg"
            />
          </div>

          <div className="md:w-1/2 flex flex-col gap-5 pt-4 pb-8 px-8 md:px-0 md:py-0 md:justify-center">
            <DesktopTitle />

            <ProductPrice product={product.data} />

            {hasVariants && variants.data && (
              <ProductVariantSelector
                variants={variants.data}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                selectedVariant={selectedVariant}
                onSizeChange={handleSizeChange}
                onColorChange={setSelectedColor}
              />
            )}

            {isClient && (
              <Button
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={!canOrder}
                className="bg-secondary hover:bg-dark-secondary disabled:bg-gray-300 disabled:cursor-not-allowed hover:cursor-pointer text-white font-bold text-xl h-12 w-full"
              >
                Hacer pedido
              </Button>
            )}
          </div>
        </div>
      </div>

      {isConfirmModalOpen && (
        <ConfirmOrderModal
          price={convertPrice(product.data.discountedPriceInCents)}
          isCreatingOrder={isCreatingOrder}
          onConfirm={confirmAndCreateOrder}
          onClose={() => setIsConfirmModalOpen(false)}
        >
          {selectedVariant && (
            <p className="text-secondary text-center text-sm">
              Talla: <strong>{selectedVariant.size.name}</strong> · Color:{' '}
              <strong>{selectedVariant.color.name}</strong>
            </p>
          )}
        </ConfirmOrderModal>
      )}
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
