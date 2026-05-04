'use client';

import { ErrorView } from '@/components/dondeSiempre/ErrorView';
import ImageUpload from '@/components/dondeSiempre/ImageUpload';
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
import { FaPlus, FaTag } from 'react-icons/fa';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const outfitSchema = createOutfitFormSchema();

type OutfitFormInput = z.input<typeof outfitSchema>;
type OutfitFormValues = z.infer<typeof outfitSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export default function OutfitCreationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [outfitProducts, setOutfitProducts] = useState<ProductDTO[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);
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

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
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

  const syncProducts = (nextProducts: ProductDTO[]) => {
    setOutfitProducts(nextProducts);
    setValue(
      'productIds',
      nextProducts.map((product) => product.id),
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );

    if (nextProducts.length >= MIN_OUTFIT_PRODUCTS) {
      clearErrors('productIds');
    }
  };

  const addTag = () => {
    const parsedTag = outfitTagSchema.safeParse(normalizedTagInput);

    if (!parsedTag.success) {
      setError('tags', {
        type: 'manual',
        message: parsedTag.error.issues[0]?.message ?? 'La etiqueta no es válida.',
      });
      return;
    }

    if (selectedTags.some((tag) => tag.toLowerCase() === parsedTag.data.toLowerCase())) {
      setError('tags', {
        type: 'manual',
        message: 'Esta etiqueta ya está añadida.',
      });
      return;
    }

    const nextTags = [...selectedTags, parsedTag.data];
    setValue('tags', nextTags, { shouldDirty: true, shouldValidate: true });
    clearErrors('tags');
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    const nextTags = selectedTags.filter((tag) => tag !== tagToRemove);
    setValue('tags', nextTags, { shouldDirty: true, shouldValidate: true });
    clearErrors('tags');
  };

  const totalPriceInCents = outfitProducts.reduce(
    (accumulator, product) => accumulator + product.priceInCents,
    0
  );
  const hasOutfitDiscount = discountPercentage > 0;
  const discountedOutfitPrice = hasOutfitDiscount
    ? calculatePriceWithPercentageDiscount(totalPriceInCents, discountPercentage)
    : convertPrice(totalPriceInCents);

  if (products.isLoading || store.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-background">
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }

  if (products.isError || store.isError) {
    return (
      <>
        <ErrorView />
      </>
    );
  }

  const missingProductsCount = getMissingOutfitProductsCount(outfitProducts.length);
  const submitDisabled =
    isSubmitting ||
    createOutfit.isPending ||
    updateOutfit.isPending ||
    isCreateLocked ||
    missingProductsCount > 0;

  const onSubmit = async (data: OutfitFormValues) => {
    if (!store.data || submitLockRef.current) {
      return;
    }

    setApiError(null);
    submitLockRef.current = true;
    setIsCreateLocked(true);

    const dto: OutfitCreationDTO = {
      name: data.name,
      description: data.description,
      discountPercentage: data.discountPercentage > 0 ? data.discountPercentage : null,
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
          image: imageFile ?? undefined,
        },
      });

      if (createOutfit.isError) {
        setApiError('Hubo un error al crear el outfit. Por favor, intenta de nuevo.');
        submitLockRef.current = false;
        setIsCreateLocked(false);
        return;
      }

      if (discountPercentage > 0 && getOutfitDiscountPercentage(createdOutfit) === 0) {
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
      if (error instanceof FetchError && error.response?.status === 409) {
        setApiError(
          'Ya hay una creación de outfit en curso. Espera un momento antes de reintentar.'
        );
      } else if (error instanceof FetchError && error.response?.status === 400) {
        setApiError(
          'La imagen o los datos proporcionados no son válidos. Por favor, intenta de nuevo.'
        );
      } else {
        setApiError(
          'Hubo un error al crear el outfit. Por favor, revisa los campos e intenta de nuevo.'
        );
      }
    } finally {
      submitLockRef.current = false;
      setIsCreateLocked(false);
    }
  };

  return (
    <StoreOwnerGuard storeId={params.id}>
      {products.data && products.data.length > 0 ? (
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
              <Card className="mb-8 p-4 shadow-xl sm:p-6 md:p-8">
                <h1 className="mb-6 text-center text-3xl font-bold text-primary">Crear outfit</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
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
                      <Label
                        htmlFor="form-description"
                        className="text-base font-bold text-secondary"
                      >
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
                            {...register('discountPercentage')}
                          />
                          <span className="text-base font-semibold text-secondary">%</span>
                        </div>
                        <FieldError message={errors.discountPercentage?.message} />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2" data-testid="outfit-tags-input">
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
                            if (errors.tags?.message) {
                              clearErrors('tags');
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
                      <FieldError message={errors.tags?.message} />
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

                  <div className="space-y-3">
                    <div className="flex flex-col gap-1" data-testid="outfit-products-input">
                      <h2 className="text-xl font-bold text-primary">Productos del outfit</h2>
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

                  <div>
                    <h2 className="text-center text-3xl font-bold text-primary">
                      <strong>Precio original: </strong>
                      {formatDisplayPrice(convertPrice(totalPriceInCents))}
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      Precio final del outfit: {formatDisplayPrice(discountedOutfitPrice)}
                    </p>
                    {hasOutfitDiscount && (
                      <p className="text-center text-sm font-semibold text-secondary">
                        Descuento aplicado al outfit: -{discountPercentage.toFixed(0)}%
                      </p>
                    )}
                  </div>

                  {apiError && <p className="text-sm text-destructive">{apiError}</p>}

                  <div className="flex justify-center" data-testid="outfit-confirm-button">
                    <Button
                      type="submit"
                      className="mt-2 h-12 w-full bg-secondary text-base font-bold text-white hover:bg-dark-secondary md:w-1/3"
                      disabled={submitDisabled}
                    >
                      {isSubmitting ||
                      createOutfit.isPending ||
                      updateOutfit.isPending ||
                      isCreateLocked
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
                  {products.data
                    .filter(
                      (product) => !outfitProducts.some((selected) => selected.id === product.id)
                    )
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
      ) : (
        <NotFoundText message="No hay productos para crear un outfit..." />
      )}
    </StoreOwnerGuard>
  );
}
