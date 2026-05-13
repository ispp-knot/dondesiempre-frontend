'use client';

import { BackButton } from '@/components/dondeSiempre/BackButton';
import { ErrorView } from '@/components/dondeSiempre/ErrorView';
import ImageUpload from '@/components/dondeSiempre/ImageUpload';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import SortableProduct from '@/components/dondeSiempre/SortableProduct';
import { StoreOwnerGuard } from '@/components/guards/StoreOwnerGuard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { OutfitCreationDTO, OutfitDTO, OutfitTagDTO } from '@/lib/types/outfits/outfitsDto';
import { productDTOToOufitCreationProductDTO } from '@/lib/types/outfits/outfitsHelper';
import {
  createOutfitFormSchema,
  getMissingOutfitProductsCount,
  MAX_OUTFIT_DESCRIPTION_LENGTH,
  MAX_OUTFIT_NAME_LENGTH,
  MAX_OUTFIT_TAG_LENGTH,
  MIN_OUTFIT_PRODUCTS,
  normalizeOutfitTag,
  outfitTagSchema,
} from '@/lib/types/outfits/outfitsRules';
import { ProductDTO } from '@/lib/types/products/productsDto';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import {
  calculatePriceWithPercentageDiscount,
  convertPrice,
  formatDisplayPrice,
  getOutfitDiscountPercentage,
} from '@/lib/utils';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider } from '@dnd-kit/react';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { FetchError } from 'ofetch';
import { useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { FaTag } from 'react-icons/fa6';
import { z } from 'zod';

const outfitSchema = createOutfitFormSchema();

type OutfitFormInput = z.input<typeof outfitSchema>;
type OutfitFormValues = z.infer<typeof outfitSchema>;

function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

function getFetchErrorMessage(
  error: unknown,
  fallback: string,
  unauthorizedMessage = fallback
): string {
  if (error instanceof FetchError) {
    const status = error.response?.status ?? error.status;

    if (status === 401 || status === 403) {
      return unauthorizedMessage;
    }

    if (typeof error.data === 'string' && error.data.trim().length > 0) {
      return error.data;
    }

    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}

type OutfitCreationFormProps = {
  products: ProductDTO[];
  outfitProducts: ProductDTO[];
  onProductsChange: (nextProducts: ProductDTO[]) => void;
  onSubmit: (data: OutfitFormValues & { imageFile?: File | null }) => Promise<void>;
  isSubmitting: boolean;
  isCreateLocked: boolean;
  missingProductsCount: number;
};

function OutfitCreationForm({
  products,
  outfitProducts,
  onProductsChange,
  onSubmit,
  isSubmitting,
  isCreateLocked,
  missingProductsCount,
}: Readonly<OutfitCreationFormProps>) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [tagError, setTagError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OutfitFormInput, unknown, OutfitFormValues>({
    resolver: zodResolver(outfitSchema),
    defaultValues: {
      name: '',
      description: '',
      discountPercentage: 0,
      tags: [],
      productIds: [],
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const selectedTags = useWatch({ control, name: 'tags' }) ?? [];
  const nameValue = useWatch({ control, name: 'name' }) ?? '';
  const descriptionValue = useWatch({ control, name: 'description' }) ?? '';
  const discountPercentageValue = useWatch({ control, name: 'discountPercentage' }) ?? 0;
  const normalizedTagInput = normalizeOutfitTag(tagInput);
  const discountPercentage = Number(discountPercentageValue ?? 0);

  const totalPriceInCents = outfitProducts.reduce(
    (accumulator, product) => accumulator + product.priceInCents,
    0
  );
  const hasOutfitDiscount = discountPercentage > 0;
  const discountedOutfitPrice = hasOutfitDiscount
    ? calculatePriceWithPercentageDiscount(totalPriceInCents, discountPercentage)
    : convertPrice(totalPriceInCents);

  const syncProducts = (nextProducts: ProductDTO[]) => {
    setValue(
      'productIds',
      nextProducts.map((p) => p.id)
    );
    onProductsChange(nextProducts);
  };

  const addTag = () => {
    const parsedTag = outfitTagSchema.safeParse(normalizedTagInput);

    if (!parsedTag.success) {
      setTagError(parsedTag.error.issues[0]?.message ?? 'La etiqueta no es válida.');
      return;
    }

    if (selectedTags.some((tag) => tag.toLowerCase() === parsedTag.data.toLowerCase())) {
      setTagError('Esta etiqueta ya está añadida.');
      return;
    }

    const nextTags = [...selectedTags, parsedTag.data];
    setValue('tags', nextTags, { shouldDirty: true, shouldValidate: true });
    setTagError(null);
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    const nextTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setValue('tags', nextTags, { shouldDirty: true, shouldValidate: true });
    setTagError(null);
  };

  const submitForm = async (data: OutfitFormValues) => {
    debugger;

    setFormError(null);

    if (missingProductsCount > 0) {
      setFormError(
        `Debes seleccionar al menos ${MIN_OUTFIT_PRODUCTS} prendas para crear el outfit.`
      );
      return;
    }

    try {
      await onSubmit({ ...data, imageFile });
    } catch (error: unknown) {
      setFormError(
        getFetchErrorMessage(
          error,
          'No se pudo crear el outfit. Revisa los campos e inténtalo de nuevo.',
          'Debes iniciar sesión como la tienda propietaria para crear un outfit.'
        )
      );
    }
  };

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) {
          return;
        }
        const nextProducts = move(outfitProducts, event);
        syncProducts(nextProducts);
      }}
    >
      <div className="flex flex-col items-center px-4 py-6">
        <div className="w-full max-w-6xl">
          <BackButton
            variant="ghost"
            onAction={() => router.push(`/stores/${params.id}/outfits`)}
            className="p-2"
          />

          <Card className="mb-8 p-4 shadow-xl sm:p-6 md:p-8">
            <h1 className="mb-6 text-center text-3xl font-bold text-primary">Crear outfit</h1>

            <form onSubmit={handleSubmit(submitForm)} className="space-y-6" noValidate>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2" data-testid="outfit-name-input">
                  <Label htmlFor="form-name" className="text-base font-bold text-secondary">
                    Nombre
                  </Label>
                  <Input
                    id="form-name"
                    maxLength={MAX_OUTFIT_NAME_LENGTH}
                    aria-invalid={!!errors.name}
                    className="break-words"
                    {...register('name')}
                  />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <FieldError message={errors.name?.message} />
                    <p className="shrink-0 text-xs text-muted-foreground">
                      {nameValue.length}/{MAX_OUTFIT_NAME_LENGTH}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2" data-testid="outfit-description-input">
                  <Label htmlFor="form-description" className="text-base font-bold text-secondary">
                    Descripción
                  </Label>
                  <Textarea
                    id="form-description"
                    maxLength={MAX_OUTFIT_DESCRIPTION_LENGTH}
                    rows={5}
                    aria-invalid={!!errors.description}
                    className="resize-y break-words"
                    {...register('description')}
                  />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <FieldError message={errors.description?.message} />
                    <p className="shrink-0 text-xs text-muted-foreground">
                      {descriptionValue.length}/{MAX_OUTFIT_DESCRIPTION_LENGTH}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2" data-testid="outfit-image-input">
                  <Label htmlFor="form-image" className="text-base font-bold text-secondary">
                    Imagen
                  </Label>
                  <div id="form-image">
                    <ImageUpload onChange={setImageFile} />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2" data-testid="outfit-discount-input">
                  <div className="max-w-xs space-y-2">
                    <Label
                      htmlFor="form-discount-percentage"
                      className="text-base font-bold text-secondary"
                    >
                      Descuento
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="form-discount-percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        inputMode="numeric"
                        aria-invalid={!!errors.discountPercentage}
                        className="w-24 sm:w-28"
                        {...register('discountPercentage', {
                          valueAsNumber: true,
                        })}
                        onKeyDown={(e) => {
                          if (e.key === '.' || e.key === ',') {
                            e.preventDefault();
                          }
                        }}
                      />
                      <span className="text-base font-semibold text-secondary">%</span>
                    </div>
                    <FieldError message={errors.discountPercentage?.message} />
                  </div>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm text-muted-foreground">
                    Precio original del outfit:{' '}
                    <strong>{formatDisplayPrice(convertPrice(totalPriceInCents))}</strong>
                  </p>
                  {hasOutfitDiscount && (
                    <p className="text-sm font-semibold text-secondary">
                      Descuento aplicado al outfit: -{discountPercentage.toFixed(0)}%
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Precio final del outfit:{' '}
                    <strong>{formatDisplayPrice(discountedOutfitPrice)}</strong>
                  </p>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <div className="space-y-1">
                    <Label className="text-base font-bold text-secondary">
                      Productos del outfit
                    </Label>
                    <p
                      className={
                        missingProductsCount > 0
                          ? 'text-sm font-medium text-destructive'
                          : 'text-sm text-muted-foreground'
                      }
                    >
                      {missingProductsCount > 0
                        ? `Añade ${
                            missingProductsCount === 1
                              ? '1 prenda más'
                              : `${missingProductsCount} prendas más`
                          } para poder crear el outfit.`
                        : 'Añade al menos dos prendas y arrástralas para definir el orden del outfit.'}
                    </p>
                  </div>
                  <FieldError message={errors.productIds?.message} />
                  <div className="flex w-full items-center gap-4 overflow-x-auto pb-2">
                    {outfitProducts.map((product, index) => (
                      <SortableProduct
                        key={product.id}
                        index={index}
                        product={product}
                        removable={true}
                        onClick={() => {
                          syncProducts(
                            outfitProducts.filter(
                              (currentProduct) => currentProduct.id !== product.id
                            )
                          );
                        }}
                      />
                    ))}
                  </div>
                  {outfitProducts.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Pulsa la X de una prenda para quitarla del outfit antes de crearlo.
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="form-tags" className="text-base font-bold text-secondary">
                    Etiquetas
                  </Label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      id="form-tags"
                      value={tagInput}
                      maxLength={MAX_OUTFIT_TAG_LENGTH}
                      placeholder="Ej. Primavera, oficina, evento especial..."
                      className="min-w-0 break-words"
                      onChange={(event) => {
                        setTagInput(event.target.value);
                        if (tagError) {
                          setTagError(null);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ',') {
                          event.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={addTag}
                      disabled={normalizedTagInput.length === 0}
                      className="w-full bg-secondary text-white hover:bg-dark-secondary sm:w-auto"
                    >
                      <FaPlus className="mr-2" />
                      Añadir etiqueta
                    </Button>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <p className="text-xs text-muted-foreground">
                      Pulsa Enter o &quot;,&quot; para añadir una etiqueta.
                    </p>
                    <p className="shrink-0 text-xs text-muted-foreground">
                      {tagInput.length}/{MAX_OUTFIT_TAG_LENGTH}
                    </p>
                  </div>
                  <FieldError message={tagError} />
                  <div className="flex flex-wrap gap-2 max-w-full">
                    {selectedTags.map((tag) => (
                      <Button
                        key={tag}
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="h-auto max-w-full whitespace-normal break-all rounded-lg bg-secondary px-3 py-2 text-left hover:bg-dark-secondary"
                      >
                        <FaTag className="mr-2 shrink-0 text-white" />
                        <span className="break-all text-xs font-bold text-white sm:text-sm">
                          {tag}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <div className="flex justify-center" data-testid="outfit-confirm-button">
                <Button
                  type="submit"
                  className="mt-2 h-12 w-full bg-secondary text-base font-bold text-white hover:bg-dark-secondary md:w-1/3"
                  disabled={isSubmitting || isCreateLocked || missingProductsCount > 0}
                >
                  {isSubmitting || isCreateLocked
                    ? 'Creando outfit...'
                    : missingProductsCount > 0
                      ? `Selecciona ${MIN_OUTFIT_PRODUCTS} prendas`
                      : 'Crear outfit'}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-4 shadow-xl sm:p-6 md:p-8">
            <h1 className="mb-6 text-center text-3xl font-bold text-primary">Productos</h1>
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
              data-testid="outfit-products-list"
            >
              {products
                .filter((product) => !outfitProducts.some((selected) => selected.id === product.id))
                .map((product) => (
                  <Card
                    key={product.id}
                    className="flex h-full flex-col gap-4 p-3 shadow-xl sm:p-4 md:p-6"
                  >
                    <h2 className="text-center text-lg font-bold text-primary break-all sm:text-2xl">
                      {product.name}
                    </h2>
                    <div className="flex flex-1 justify-center">
                      <Image
                        src={product.image || '/static/img/product_placeholder.png'}
                        alt={product.name}
                        width={512}
                        height={512}
                        className="aspect-square w-full max-w-[220px] rounded-lg object-cover shadow-lg"
                      />
                    </div>
                    <h3 className="text-center text-lg font-bold text-primary sm:text-2xl">
                      {formatDisplayPrice(convertPrice(product.priceInCents))}
                    </h3>
                    <Button
                      type="button"
                      onClick={() => syncProducts([...outfitProducts, product])}
                      className="flex w-full items-center justify-center rounded-lg bg-secondary text-base font-bold text-white hover:bg-dark-secondary sm:text-lg"
                    >
                      Añadir
                    </Button>
                  </Card>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </DragDropProvider>
  );
}

export default function OutfitCreationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [outfitProducts, setOutfitProducts] = useState<ProductDTO[]>([]);
  const [isCreateLocked, setIsCreateLocked] = useState(false);
  const submitLockRef = useRef(false);

  const products = usePassiveFetcher<ProductDTO[]>({ url: `stores/${params.id}/products` });
  const store = usePassiveFetcher<StoreDTO>({ url: `stores/${params.id}` });
  const createOutfit = useActiveFetcher<OutfitDTO>({
    url: `stores/${params.id}/outfits`,
    method: 'POST',
  });
  const updateOutfit = useActiveFetcher<OutfitDTO>({
    method: 'PUT',
  });

  const missingProductsCount = getMissingOutfitProductsCount(outfitProducts.length);

  const onSubmit = async (data: OutfitFormValues & { imageFile?: File | null }) => {
    if (!store.data || submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    setIsCreateLocked(true);

    const dto: OutfitCreationDTO = {
      name: data.name,
      description: data.description,
      discountPercentage:
        data.discountPercentage && data.discountPercentage > 0 ? data.discountPercentage : null,
      storefrontId: store.data.storefront.id,
      tags: data.tags.map((tag) => {
        return { name: tag } as OutfitTagDTO;
      }),
      products: outfitProducts.map((product, index) =>
        productDTOToOufitCreationProductDTO(product, index)
      ),
    };

    try {
      const createdOutfit = await createOutfit.fetch({
        formPayload: {
          dto: new Blob([JSON.stringify(dto)], { type: 'application/json' }),
          image: data.imageFile ?? undefined,
        },
      });

      if (
        data.discountPercentage &&
        data.discountPercentage > 0 &&
        getOutfitDiscountPercentage(createdOutfit) === 0
      ) {
        await updateOutfit.fetch({
          url: `outfits/${createdOutfit.id}`,
          formPayload: {
            dto: new Blob(
              [
                JSON.stringify({
                  name: data.name,
                  description: data.description,
                  discountPercentage: data.discountPercentage,
                }),
              ],
              { type: 'application/json' }
            ),
          },
        });
      }
      router.push(`/stores/${params.id}/outfits`);
    } catch (error: unknown) {
      throw error;
    } finally {
      submitLockRef.current = false;
      setIsCreateLocked(false);
    }
  };

  if (products.isLoading || store.isLoading) {
    return <LoadingText />;
  }

  if (products.isError || store.isError) {
    return (
      <>
        <ErrorView />
      </>
    );
  }

  if (!products.data || products.data.length === 0) {
    return <NotFoundText message="No hay productos para crear un outfit..." />;
  }

  if (!store.data) {
    return <ErrorView />;
  }

  return (
    <StoreOwnerGuard storeId={params.id}>
      <OutfitCreationForm
        products={products.data}
        outfitProducts={outfitProducts}
        onProductsChange={setOutfitProducts}
        onSubmit={onSubmit}
        isSubmitting={createOutfit.isPending || updateOutfit.isPending}
        isCreateLocked={isCreateLocked}
        missingProductsCount={missingProductsCount}
      />
    </StoreOwnerGuard>
  );
}
