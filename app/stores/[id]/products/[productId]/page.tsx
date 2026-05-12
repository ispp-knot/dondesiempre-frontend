'use client';

import { ErrorView } from '@/components/dondeSiempre/ErrorView';
import { Button } from '@/components/ui/button';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import {
  ProductColor,
  ProductDTO,
  ProductSize,
  ProductVariantBackendDTO,
} from '@/lib/types/products/productsDto';
import { OrderDTO } from '@/lib/types/orders/orderDto';
import { convertPrice, formatDisplayPrice, discountPrice } from '@/lib/utils';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
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
import { BackButton } from '@/components/dondeSiempre/BackButton';
import { GenericConfirmModal } from '@/components/modals/GenericConfirmModal';
import GenericSuccessModal from '@/components/modals/GenericSuccessModal';
import { PromotionDTO } from '@/lib/types/promotions/promotionsDto';
import { BadgePercent } from 'lucide-react';
import Loader from '@/components/dondeSiempre/Loader';

function ProductPrice({
  product,
  promotion,
}: {
  product: ProductDTO;
  promotion: PromotionDTO | undefined;
}) {
  const fmt = (cents: number) => formatDisplayPrice(convertPrice(cents));
  const hasDiscount =
    (promotion ? promotion.discountPercentage : (product.discountPercentage ?? 0)) > 0;
  const discountedPrice = discountPrice(
    product.priceInCents,
    promotion ? promotion.discountPercentage : product.discountPercentage
  );

  return (
    <div className="text-primary text-2xl" data-testid="product-price">
      {hasDiscount ? (
        <span className="flex flex-row items-baseline gap-3">
          <span className="line-through text-muted-foreground text-xl">
            {fmt(product.priceInCents)}
          </span>
          <strong>{formatDisplayPrice(discountedPrice)} (IVA incluido)</strong>
        </span>
      ) : (
        <strong>{fmt(product.priceInCents)} (IVA incluido)</strong>
      )}
    </div>
  );
}

export default function ProductDetailsPage() {
  const params = useParams<{ id: string; productId: string }>();

  const searchParams = useSearchParams();
  const promotionId = searchParams.get('promotionId');

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
  const [variantCreationError, setVariantCreationError] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [promotion, setPromotion] = useState<PromotionDTO | undefined>(undefined);

  const router = useRouter();

  const product = usePassiveFetcher<ProductDTO>({ url: `products/${params.productId}` });

  const promotionFetcher = usePassiveFetcher<PromotionDTO>({
    url: `promotions/${promotionId}`,
    enabled: !!promotionId,
  });

  useEffect(() => {
    if (promotionFetcher.data) {
      setPromotion(promotionFetcher.data);
    }
  }, [promotionFetcher.data]);

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
      if (error.data?.includes('promotions')) {
        setActiveFetchingError('No se puede eliminar un producto con promociones asociadas.');
      }
    },
  });

  const createOrder = useActiveFetcher<OrderDTO>({
    url: promotion ? `orders?promotionId=${promotion.id}` : 'orders',
    method: 'POST',
  });

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
    return <Loader />;
  }
  if (product.error || !product.data) {
    return (
      <ErrorView
        title="Producto no encontrado"
        description="No pudimos encontrar este producto. Puede que se haya eliminado o que el enlace ya no sea válido."
        buttonText="Volver atrás"
      />
    );
  }

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
      await createOrder.fetch({ body: { [selectedVariant.id]: 1 } });
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
      await sizes.refetch();
      await variantsBackend.refetch();
      await allVariantsBackend.refetch();
      setIsCreateVariantModalOpen(false);
      setVariantCreationError(null);
    } catch (error) {
      const err = error as FetchError;
      if (err.data?.includes('already exists')) {
        setVariantCreationError('Esta variante ya existe.');
      } else {
        setVariantCreationError('Hubo un problema al crear la variante.');
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
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProduct.fetch({ url: `products/${product.data?.id}` });
      setIsConfirmDeleteOpen(false);
      setDeleteSuccess(true);
    } catch (error) {
      setIsConfirmDeleteOpen(false);
      const err = error as FetchError;
      const message =
        err.status === 400
          ? 'No puede ser borrado porque es usado en uno o más outfits.'
          : 'Hubo un problema al eliminar el producto';
      setActiveFetchingError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const MobileTitle = () => {
    return (
      <div className="md:hidden pt-8 px-4 pb-4 w-full text-center">
        <h1 className="mb-1 font-bold text-primary text-3xl wrap-break-word">
          {product.data.name}
        </h1>
      </div>
    );
  };

  const DesktopTitle = () => {
    return (
      <div className="hidden md:block">
        <h1 className="font-bold text-primary text-3xl mb-1 wrap-break-word">
          {product.data.name}
        </h1>
      </div>
    );
  };

  return (
    <>
      {activeFetchingError && (
        <ErrorModal message={activeFetchingError} onClose={() => setActiveFetchingError(null)} />
      )}

      <div className="flex flex-col items-center relative">
        <div className="w-full max-w-5xl px-4 md:px-10 pt-4">
          <BackButton variant="ghost" onAction={() => router.push(`/stores/${params.id}`)} />
        </div>

        <MobileTitle />

        <div className="w-full md:max-w-5xl md:flex md:flex-row md:gap-10 md:px-10 md:py-10 md:pt-4">
          <div className="md:w-1/2 shrink-0 flex flex-col">
            <Image
              data-testid="product-image"
              src={product.data.image || '/static/img/product_placeholder.png'}
              alt={product.data.name}
              width={680}
              height={680}
              loading="eager"
              className="aspect-square w-full object-cover md:rounded-xl shrink-0 shadow-lg"
            />
            {product.data.description && (
              <p
                className="text-secondary text-m break-words line-clamp-3 mt-4 px-8 md:px-0"
                data-testid="product-description"
              >
                {product.data.description}
              </p>
            )}
          </div>

          <div
            className="md:w-1/2 flex flex-col gap-5 pt-4 pb-8 px-8 md:px-0 md:py-0 md:justify-start"
            data-testid="product-desktop-name"
          >
            <DesktopTitle />
            {isConfirmDeleteOpen && (
              <GenericConfirmModal
                message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
                onConfirm={handleDelete}
                onClose={() => setIsConfirmDeleteOpen(false)}
                isLoading={isDeleting}
                confirmLabel="Eliminar"
              />
            )}
            {isStore && isStoreOwner && (
              <div className="flex gap-3">
                <Link
                  href={`/stores/${product.data?.storeId}/products/${params.productId}/edit`}
                  className={`${buttonLinkClass} flex-1 flex items-center justify-center rounded-lg bg-secondary hover:bg-dark-secondary text-white font-semibold text-sm md:text-base h-11 transition-colors`}
                  data-testid="product-edit-button"
                >
                  Editar
                </Link>

                <Button
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="flex-1 flex items-center justify-center rounded-lg bg-primary hover:bg-dark-primary text-white font-semibold text-sm md:text-base h-11 transition-colors"
                  data-testid="product-delete-button"
                >
                  Eliminar
                </Button>
              </div>
            )}

            <ProductPrice product={product.data} promotion={promotion} />

            {promotion && (
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-2 rounded-full shadow-sm">
                <BadgePercent size={16} className="shrink-0" />

                <span className="text-sm font-semibold flex items-center gap-1">
                  <span className="font-bold">En promoción:</span>

                  <span className="truncate max-w-[180px]">{promotion.name}</span>

                  <span className="shrink-0">-{promotion.discountPercentage}%</span>
                </span>
              </div>
            )}

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
                data-testid="product-order-button"
                className="bg-secondary hover:bg-dark-secondary disabled:bg-gray-300 disabled:cursor-not-allowed hover:cursor-pointer text-white font-bold text-xl h-12 w-full"
              >
                Hacer pedido
              </Button>
            )}

            {isStoreOwner && (
              <div
                className="flex flex-col gap-3 mt-4 pt-4 border-t"
                data-testid="product-variants-list"
              >
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
                    data-testid="create-variant"
                    className="bg-secondary hover:bg-dark-secondary text-white font-bold"
                  >
                    Crear Variante
                  </Button>
                  <Button
                    onClick={() => setIsDeleteModalOpen(true)}
                    disabled={!hasAnyVariants}
                    variant="outline"
                    data-testid="delete-variants"
                    className="font-bold border-destructive text-destructive hover:bg-destructive hover:text-white disabled:opacity-50"
                  >
                    Eliminar Variantes
                  </Button>
                  <Button
                    onClick={() => setIsUpdateModalOpen(true)}
                    disabled={!hasAnyVariants}
                    variant="outline"
                    data-testid="allow-variant"
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
          price={discountPrice(
            product.data.priceInCents,
            promotion ? promotion.discountPercentage : product.data.discountPercentage
          )}
          isCreatingOrder={isCreatingOrder}
          onConfirm={confirmAndCreateOrder}
          onClose={() => setIsConfirmModalOpen(false)}
        >
          {selectedVariant && (
            <div className="flex flex-col gap-3 w-full">
              <p className="text-sm font-semibold text-primary/60 uppercase tracking-wide">
                Resumen
              </p>
              <div className="flex flex-row items-center justify-between border border-secondary/20 rounded-lg px-4 py-3 bg-secondary/5">
                <p className="text-secondary font-semibold text-sm truncate flex-1">
                  {product.data.name}
                </p>
                <div className="flex flex-row items-center gap-2 shrink-0 text-sm text-secondary/80">
                  <span className="bg-secondary/10 rounded px-2 py-0.5">
                    {selectedVariant.size.name ?? '—'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                      style={{ backgroundColor: selectedVariant.color.hexCode }}
                    />
                    {selectedVariant.color.name ?? '—'}
                  </span>
                </div>
              </div>
            </div>
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
        onClose={() => {
          setIsCreateVariantModalOpen(false);
          setVariantCreationError(null);
        }}
        onSubmit={handleCreateVariant}
        isSubmitting={isSubmittingVariant}
        error={variantCreationError}
        onErrorClear={() => setVariantCreationError(null)}
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
          {deleteSuccess && (
            <GenericSuccessModal
              setOpenModal={() => router.push(`/stores/${params.id}`)}
              title="Producto eliminado"
              description="El producto se ha eliminado correctamente."
            />
          )}
        </>
      )}
    </>
  );
}
