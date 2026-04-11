'use client';

import { Button } from '@/components/ui/button';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { useAuth } from '@/lib/auth/AuthContext';
import { OrderDTO } from '@/lib/types/orders/orderDto';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { convertPrice, discountPrice, formatDisplayPrice } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { GoDotFill } from 'react-icons/go';
import { FetchError } from 'ofetch';
import AuthModal from '@/components/modals/AuthModal';
import OrderSuccessModal from '@/components/modals/OrderSuccessModal';
import { ConfirmOrderModal } from '@/components/modals/ConfirmOrderModal';
import { ErrorModal } from '@/components/modals/ErrorModal';
import {
  ProductColor,
  ProductSize,
  ProductVariantBackendDTO,
} from '@/lib/types/products/productsDto';
import ProductVariantSelector, {
  ProductVariantDTO,
} from '../../products/[productId]/ProductVariantSelector';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

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

  const outfit = props.outfit || ({} as OutfitDTO);

  const [activeFetchingError, setActiveFetchingError] = useState<string | null>(null);

  const createOrder = useActiveFetcher<OrderDTO>({
    url: 'orders',
    method: 'POST',
  });

  const fmt = (cents: number) => formatDisplayPrice(convertPrice(cents));

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const sizes = usePassiveFetcher<ProductSize[]>({ url: 'product-sizes' });
  const colors = usePassiveFetcher<ProductColor[]>({ url: 'product-colors' });

  const variantsBackend = usePassiveFetcher<ProductVariantBackendDTO[]>({
    url: `product-variants/product/${outfit.products[selectedProduct].id}/available`,
    enabled: selectedProduct !== null,
  });

  const [variantsList, setVariantsList] = useState<ProductVariantDTO[][]>(
    new Array(outfit.products.length).fill([])
  );

  useEffect(() => {
    if (!variantsBackend.data || !sizes.data || !colors.data) {
      return;
    }

    const mappedData: ProductVariantDTO[] = variantsBackend.data.map((v) => {
      const size = sizes.data.find((s) => s.id === v.sizeId);
      const color = colors.data.find((c) => c.id === v.colorId);
      return {
        id: v.id,
        size: size || { id: v.sizeId, name: 'Unknown' },
        color: color || { id: v.colorId, name: 'Unknown', hexCode: '#cccccc' },
        isAvailable: v.isAvailable,
      };
    });

    setVariantsList((prev) => {
      const updated = [...prev];
      updated[selectedProduct] = mappedData;
      return updated;
    });
  }, [variantsBackend.data, sizes.data, colors.data]);

  const selectedVariants = outfit.products.map((product, index) => {
    const sizeId = selectedSizes[index];
    const colorId = selectedColors[index];
    if (!sizeId || !colorId) return null;

    const variant = variantsList[index]?.find(
      (v) => v.size.id === sizeId && v.color.id === colorId
    );
    return variant || null;
  });

  const hasVariants = variantsList[selectedProduct]?.length > 0;
  const allHaveSelectedVariant =
    selectedVariants.every((v) => v !== null) && selectedVariants.length === outfit.products.length;

  const canOrder = allHaveSelectedVariant && isClient;

  const handleSizeChange = (sizeId: string) => {
    setSelectedSizes((prev) => {
      const updated = [...prev];
      updated[selectedProduct] = sizeId;
      return updated;
    });

    const currentColor = selectedColors[selectedProduct];
    const hasMatchingVariant = variantsList[selectedProduct]?.some(
      (v) => v.size.id === sizeId && v.color.id === currentColor
    );

    if (!hasMatchingVariant) {
      setSelectedColors((prev) => {
        const updated = [...prev];
        updated[selectedProduct] = '';
        return updated;
      });
    }
  };

  const handleColorChange = (colorId: string) => {
    setSelectedColors((prev) => {
      const updated = [...prev];
      updated[selectedProduct] = colorId;
      return updated;
    });

    const currentSize = selectedSizes[selectedProduct];
    const hasMatchingVariant = variantsList[selectedProduct]?.some(
      (v) => v.color.id === colorId && v.size.id === currentSize
    );

    if (!hasMatchingVariant) {
      setSelectedSizes((prev) => {
        const updated = [...prev];
        updated[selectedProduct] = '';
        return updated;
      });
    }
  };

  const confirmAndCreateOrder = async () => {
    if (!props.outfit) return;

    setIsCreatingOrder(true);

    const payload: Record<string, number> = {};
    if (!canOrder) return;

    selectedVariants.forEach((variant) => {
      payload[variant.id] = 1;
    });

    try {
      await createOrder.fetch({
        url: `orders?outfitId=${outfit.id}`,
        body: payload,
      });
      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error: unknown) {
      const err = error as FetchError;
      console.error('Error al crear el pedido:', err);
      setIsConfirmModalOpen(false);

      if (
        err?.status === 401 ||
        err?.status === 403 ||
        err?.message?.includes('401') ||
        err?.message?.includes('403')
      ) {
        setIsAuthModalOpen(true);
      } else {
        setActiveFetchingError('Hubo un problema al crear el pedido.');
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const MobileTitle = () => (
    <div className="md:hidden pt-8 px-4 pb-4 w-full text-center">
      <h1 className="mb-1 font-bold text-primary text-3xl text-center wrap-break-word">
        {outfit.name}
      </h1>
      <OutfitDescription />
    </div>
  );

  const DesktopTitle = () => (
    <div className="hidden md:block">
      <h1 className="font-bold text-primary text-3xl mb-1 wrap-break-word">{outfit.name}</h1>
      <OutfitDescription />
    </div>
  );

  const OutfitDescription = () => {
    if (!outfit.description) return null;
    const isLong = outfit.description.length > 150;

    return (
      <div className="flex items-start gap-2 px-8 pb-4 md:px-0 md:pb-0 md:py-1">
        {isLong && (
          <button
            onClick={() => setDescriptionExpanded(!descriptionExpanded)}
            className="shrink-0 self-start text-primary/70 hover:text-primary transition-colors cursor-pointer mt-1 order-last"
          >
            {descriptionExpanded ? (
              <FaChevronUp className="text-base md:text-lg" />
            ) : (
              <FaChevronDown className="text-base md:text-lg" />
            )}
          </button>
        )}
        <p className="text-secondary text-sm md:text-base leading-relaxed flex-1 text-justify hyphens-auto">
          {descriptionExpanded || !isLong
            ? outfit.description
            : outfit.description.slice(0, 150) + '…'}
        </p>
      </div>
    );
  };

  return (
    <>
      {activeFetchingError && (
        <ErrorModal message={activeFetchingError} onClose={() => setActiveFetchingError(null)} />
      )}
      <div className="flex flex-col items-center relative">
        <MobileTitle />

        <div className="w-full md:max-w-5xl md:flex md:flex-row md:gap-10 md:px-10 md:py-10 md:pt-4">
          <div className="md:w-1/2 shrink-0 md:flex md:flex-col">
            <Image
              src={outfit.products[selectedProduct].image || '/static/img/product_placeholder.png'}
              alt={outfit.products[selectedProduct].name}
              width={680}
              height={680}
              loading="eager"
              className="aspect-square w-full md:h-[400px] md:w-auto mx-auto object-cover md:rounded-xl shadow-lg"
            />
            <div className="flex flex-row justify-center py-2">
              {outfit.products.map((_, i) => (
                <GoDotFill
                  key={i}
                  onClick={() => setSelectedProduct(i)}
                  className={`cursor-pointer ${i === selectedProduct ? 'text-secondary' : 'text-ring'}`}
                />
              ))}
            </div>
            <div className="px-8 md:px-0">
              <h1 className="text-primary text-2xl">{outfit.products[selectedProduct].name}</h1>
            </div>
            <div
              className="py-4 px-8 md:px-0 flex flex-row w-full overflow-x-auto items-center gap-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {outfit.products.map((p, i) => (
                <Button
                  key={p.id}
                  onClick={() => setSelectedProduct(i)}
                  className={
                    'w-20 h-20 shrink-0 bg-cover bg-center rounded-lg shadow-lg cursor-pointer ' +
                    (i === selectedProduct ? 'border-4 border-ring' : '')
                  }
                  style={{
                    backgroundImage: `url(${p.image || '/static/img/product_placeholder.png'})`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="md:w-1/2 flex flex-col gap-5 pb-8 px-8 md:px-0 md:py-0 md:justify-start">
            <DesktopTitle />
            <div className="text-primary text-2xl">
              {outfit.discountPercentage ? (
                <span className="flex flex-row items-baseline gap-3">
                  <span className="line-through text-muted-foreground text-xl">
                    {fmt(outfit.priceInCents)}
                  </span>
                  <strong>
                    {formatDisplayPrice(
                      discountPrice(outfit.priceInCents, outfit.discountPercentage ?? null)
                    )}{' '}
                    (IVA incluido)
                  </strong>
                </span>
              ) : (
                <strong>{fmt(outfit.priceInCents)} (IVA incluido)</strong>
              )}
            </div>

            <div className="min-h-[120px]">
              {variantsBackend.isLoading ? null : (
                <>
                  {hasVariants && !user && (
                    <p className="text-sm text-muted-foreground">
                      Inicia sesión para seleccionar variantes y hacer un pedido.
                    </p>
                  )}
                  {hasVariants && variantsList[selectedProduct] && (
                    <ProductVariantSelector
                      variants={variantsList[selectedProduct]}
                      selectedSize={selectedSizes[selectedProduct]}
                      selectedColor={selectedColors[selectedProduct]}
                      selectedVariant={selectedVariants[selectedProduct]}
                      onSizeChange={handleSizeChange}
                      onColorChange={handleColorChange}
                      disabled={!user}
                    />
                  )}
                  {!hasVariants && (
                    <p className="text-sm text-muted-foreground">
                      Este producto no tiene variantes disponibles.
                    </p>
                  )}
                </>
              )}
            </div>

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
          price={discountPrice(outfit.priceInCents, outfit.discountPercentage ?? null)}
          isCreatingOrder={isCreatingOrder}
          onConfirm={confirmAndCreateOrder}
          onClose={() => setIsConfirmModalOpen(false)}
        >
          <div className="flex flex-col gap-3 w-full">
            <p className="text-sm font-semibold text-primary/60 uppercase tracking-wide">Resumen</p>
            {outfit.products.map((product, index) => (
              <div
                key={product.id}
                className="flex flex-row items-center justify-between border border-secondary/20 rounded-lg px-4 py-3 bg-secondary/5"
              >
                <p className="text-secondary font-semibold text-sm truncate flex-1">
                  {product.name}
                </p>
                <div className="flex flex-row items-center gap-2 shrink-0 text-sm text-secondary/80">
                  <span className="bg-secondary/10 rounded px-2 py-0.5">
                    {selectedVariants[index]?.size.name ?? '—'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                      style={{ backgroundColor: selectedVariants[index]?.color.hexCode }}
                    />
                    {selectedVariants[index]?.color.name ?? '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ConfirmOrderModal>
      )}
      {isAuthModalOpen && (
        <AuthModal
          message="Para poder hacer un pedido necesitas iniciar sesión o crear una cuenta en la plataforma."
          setOpenModal={setIsAuthModalOpen}
        />
      )}

      {isSuccessModalOpen && <OrderSuccessModal setOpenModal={setIsSuccessModalOpen} />}
    </>
  );
}
