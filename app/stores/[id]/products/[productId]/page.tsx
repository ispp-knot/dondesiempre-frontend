'use client';

import ErrorText from '@/components/dondeSiempre/ErrorText';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { Button } from '@/components/ui/button';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { ProductDTO } from '@/lib/types/products/productsDto';
import { OrderDTO } from '@/lib/types/orders/orderDto';
import { convertPrice, formatDisplayPrice } from '@/lib/utils';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { FetchError } from 'ofetch';
import ProductVariantSelector, { ProductVariantDTO } from './ProductVariantSelector';
import AuthModal from '@/components/modals/AuthModal';
import { useAuth } from '@/lib/auth/AuthContext';
import OrderSuccessModal from '@/components/modals/OrderSuccessModal';
import { ConfirmOrderModal } from '@/components/modals/ConfirmOrderModal';
import ProductVariantForm, { ProductVariantFormData } from './ProductVariantForm';
import { DeleteVariantsModal, UpdateVariantsModal } from './VariantManagementModals';
import Link from 'next/link';
import { buttonLinkClass } from '@/lib/utils/buttonLinkClass';
import { ErrorModal } from '@/components/modals/ErrorModal';

interface ProductVariantBackendDTO {
  id: string;
  productId: string;
  sizeId: string;
  colorId: string;
  isAvailable: boolean;
}

interface ProductSize {
  id: string;
  name: string;
}

interface ProductColor {
  id: string;
  name: string;
  hexCode: string;
}

function ProductPrice({ product }: { product: ProductDTO }) {
  const fmt = (cents: number) => formatDisplayPrice(convertPrice(cents));

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
  const [isCreateVariantModalOpen, setIsCreateVariantModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isSubmittingVariant, setIsSubmittingVariant] = useState(false);
  const [isDeletingVariants, setIsDeletingVariants] = useState(false);
  const [isUpdatingVariants, setIsUpdatingVariants] = useState(false);
  const [activeFetchingError, setActiveFetchingError] = useState<string | null>(null);

  const router = useRouter();

  const product = usePassiveFetcher<ProductDTO>({ url: `products/${params.productId}` });

  const variantsBackend = usePassiveFetcher<ProductVariantBackendDTO[]>({
    url: `product-variants/product/${params.productId}/available`,
  });
  const allVariantsBackend = usePassiveFetcher<ProductVariantBackendDTO[]>({
    url: `product-variants/product/${params.productId}`,
  });
  const sizes = usePassiveFetcher<ProductSize[]>({ url: 'product-sizes' });
  const colors = usePassiveFetcher<ProductColor[]>({ url: 'product-colors' });

  const variants = useMemo(() => {
    if (!variantsBackend.data || !sizes.data || !colors.data) {
      return { ...variantsBackend, data: undefined };
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

    return { ...variantsBackend, data: mappedData };
  }, [variantsBackend, sizes.data, colors.data]);

  const allVariants = useMemo(() => {
    if (!allVariantsBackend.data || !sizes.data || !colors.data) {
      return { ...allVariantsBackend, data: undefined };
    }

    const mappedData: ProductVariantDTO[] = allVariantsBackend.data.map((v) => {
      const size = sizes.data.find((s) => s.id === v.sizeId);
      const color = colors.data.find((c) => c.id === v.colorId);
      return {
        id: v.id,
        size: size || { id: v.sizeId, name: 'Unknown' },
        color: color || { id: v.colorId, name: 'Unknown', hexCode: '#cccccc' },
        isAvailable: v.isAvailable,
      };
    });

    return { ...allVariantsBackend, data: mappedData };
  }, [allVariantsBackend, sizes.data, colors.data]);

  const createVariant = useActiveFetcher<ProductVariantDTO>({
    url: 'product-variants',
    method: 'POST',
  });
  const deleteVariant = useActiveFetcher({ method: 'DELETE' });
  const updateVariant = useActiveFetcher({ method: 'PUT' });

  const deleteProduct = useActiveFetcher({
    method: 'DELETE',
    onError: (error) => {
      if (error.data?.includes('outfits')) {
        setActiveFetchingError('No se puede eliminar un producto con outfits asociados.');
      }
    },
  });

  const createOrder = useActiveFetcher<OrderDTO>({ url: 'orders', method: 'POST' });

  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();
  const isStore = user?.roles.includes('STORE') ?? false;
  const isStoreOwner = (user?.store && user?.store.id === product.data?.storeId) ?? false;

  const isClient = Boolean(user?.client?.id);

  if (
    product.isLoading ||
    variantsBackend.isLoading ||
    allVariantsBackend.isLoading ||
    sizes.isLoading ||
    colors.isLoading
  ) {
    return <LoadingText />;
  }
  if (product.isError) return <ErrorText error={product.error} />;
  if (!product.data) return <NotFoundText message="El producto que buscas no existe..." />;

  const selectedVariant =
    variants.data?.find(
      (v) => v.size.id === selectedSize && v.color.id === selectedColor && v.isAvailable
    ) ?? null;

  const hasVariants = (variants.data?.length ?? 0) > 0;
  const hasAnyVariants = (allVariants.data?.length ?? 0) > 0;
  const canOrder = hasVariants && selectedVariant && selectedVariant.isAvailable;

  const handleSizeChange = (sizeId: string) => {
    if (selectedSize !== sizeId) {
      setSelectedSize(sizeId);
      setSelectedColor(null);
    }
  };

  const confirmAndCreateOrder = async () => {
    if (!product.data) return;
    if (!canOrder) {
      setActiveFetchingError(
        'No puedes realizar un pedido sin seleccionar una variantes disponible.'
      );
      return;
    }
    setIsCreatingOrder(true);
    try {
      await createOrder.fetch({ body: { [product.data.id]: 1 } });
      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (error: unknown) {
      const err = error as FetchError;
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

  const handleCreateVariant = async (data: ProductVariantFormData) => {
    setIsSubmittingVariant(true);
    try {
      await createVariant.fetch({
        body: {
          productId: params.productId,
          sizeId: data.sizeId,
          colorId: data.colorId,
          isAvailable: data.isAvailable,
        },
      });
      await variantsBackend.refetch();
      await allVariantsBackend.refetch();
      setIsCreateVariantModalOpen(false);
    } catch (error) {
      setIsCreateVariantModalOpen(false);
      const err = error as FetchError;
      if (err.data?.includes('already exists')) {
        setActiveFetchingError('Esta variante ya existe.');
      } else {
        setActiveFetchingError('Hubo un problema al crear la variante.');
      }
    } finally {
      setIsSubmittingVariant(false);
    }
  };

  const handleDeleteVariants = async (variantIds: string[]) => {
    setIsDeletingVariants(true);
    try {
      await Promise.all(
        variantIds.map((id) => deleteVariant.fetch({ url: `product-variants/${id}` }))
      );
      await variantsBackend.refetch();
      await allVariantsBackend.refetch();
      setIsDeleteModalOpen(false);
    } catch (error) {
      setIsDeleteModalOpen(false);
      console.error('Error deleting variants:', error);
      setActiveFetchingError('Hubo un problema al eliminar las variantes.');
    } finally {
      setIsDeletingVariants(false);
    }
  };

  const handleUpdateVariants = async (changes: Array<{ id: string; isAvailable: boolean }>) => {
    setIsUpdatingVariants(true);
    try {
      await Promise.all(
        changes.map(({ id, isAvailable }) =>
          updateVariant.fetch({
            url: `product-variants/${id}`,
            body: { isAvailable },
          })
        )
      );
      await variantsBackend.refetch();
      await allVariantsBackend.refetch();
      setIsUpdateModalOpen(false);
    } catch (error) {
      setIsUpdateModalOpen(false);
      console.error('Error updating variants:', error);
      setActiveFetchingError('Hubo un problema al actualizar las variantes.');
    } finally {
      setIsUpdatingVariants(false);
    }
  };

  const MobileTitle = () => {
    return (
      <div className="md:hidden pt-8 px-8 pb-4 w-full text-center">
        <h1 className="mb-1 font-bold text-primary text-3xl wrap-break-word">
          {product.data.name}
        </h1>
        {product.data.description && (
          <p className="text-secondary text-md">{product.data.description}</p>
        )}
      </div>
    );
  };

  const DesktopTitle = () => {
    return (
      <div className="hidden md:block">
        <h1 className="font-bold text-primary text-3xl mb-1 wrap-break-word">
          {product.data.name}
        </h1>
        {product.data.description && (
          <p className="text-secondary text-md">{product.data.description}</p>
        )}
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

            {isStore && isStoreOwner && (
              <div className="flex gap-3">
                <Link
                  href={`/stores/${product.data?.storeId}/products/${params.productId}/edit`}
                  className={`${buttonLinkClass} flex-1 flex items-center justify-center rounded-lg bg-secondary hover:bg-dark-secondary text-white font-semibold text-sm md:text-base h-11 transition-colors`}
                >
                  Editar
                </Link>

                <Button
                  onClick={async () => {
                    await deleteProduct.fetch({ url: `products/${product.data?.id}` });
                    router.push(`/stores/${params.id}`);
                  }}
                  className="flex-1 flex items-center justify-center rounded-lg bg-primary hover:bg-dark-primary text-white font-semibold text-sm md:text-base h-11 transition-colors"
                >
                  Eliminar
                </Button>
              </div>
            )}

            <ProductPrice product={product.data} />

            {hasVariants && !user && (
              <p className="text-sm text-muted-foreground">
                Inicia sesión para seleccionar una variante y hacer un pedido.
              </p>
            )}

            {hasVariants && variants.data && (
              <ProductVariantSelector
                variants={variants.data}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                selectedVariant={selectedVariant}
                onSizeChange={handleSizeChange}
                onColorChange={setSelectedColor}
                disabled={!user}
              />
            )}

            {!hasVariants && !isStoreOwner && (
              <p className="text-sm text-muted-foreground">
                Este producto no tiene variantes disponibles.
              </p>
            )}

            {isClient && hasVariants && (
              <Button
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={!canOrder}
                className="bg-secondary hover:bg-dark-secondary disabled:bg-gray-300 disabled:cursor-not-allowed hover:cursor-pointer text-white font-bold text-xl h-12 w-full"
              >
                Hacer pedido
              </Button>
            )}

            {isStoreOwner && (
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
                <h3 className="font-bold text-primary text-lg">Gestión de Variantes</h3>
                {hasAnyVariants && allVariants.data && (
                  <div className="mb-2">
                    <p className="text-sm text-muted-foreground">
                      {allVariants.data.length} variante(s) total(es) ·{' '}
                      {allVariants.data.filter((v) => v.isAvailable).length} disponible(s)
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setIsCreateVariantModalOpen(true)}
                    className="bg-secondary hover:bg-dark-secondary text-white font-bold"
                  >
                    Crear Variante
                  </Button>
                  <Button
                    onClick={() => setIsDeleteModalOpen(true)}
                    disabled={!hasAnyVariants}
                    variant="outline"
                    className="font-bold border-destructive text-destructive hover:bg-destructive hover:text-white disabled:opacity-50"
                  >
                    Eliminar Variantes
                  </Button>
                  <Button
                    onClick={() => setIsUpdateModalOpen(true)}
                    disabled={!hasAnyVariants}
                    variant="outline"
                    className="font-bold disabled:opacity-50"
                  >
                    Habilitar/Deshabilitar
                  </Button>
                </div>
              </div>
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

      <ProductVariantForm
        isOpen={isCreateVariantModalOpen}
        onClose={() => setIsCreateVariantModalOpen(false)}
        onSubmit={handleCreateVariant}
        isSubmitting={isSubmittingVariant}
      />

      {allVariants.data && (
        <>
          <DeleteVariantsModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            variants={allVariants.data}
            onDelete={handleDeleteVariants}
            isDeleting={isDeletingVariants}
          />

          <UpdateVariantsModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            variants={allVariants.data}
            onUpdate={handleUpdateVariants}
            isUpdating={isUpdatingVariants}
          />
        </>
      )}
    </>
  );
}
