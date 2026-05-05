'use client';

import { ErrorView } from '@/components/dondeSiempre/ErrorView';
import ImageUpload from '@/components/dondeSiempre/ImageUpload';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { StoreOwnerGuard } from '@/components/guards/StoreOwnerGuard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useQueryClient } from '@tanstack/react-query';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { OutfitDTO, OutfitTagDTO, OutfitUpdateDTO } from '@/lib/types/outfits/outfitsDto';
import {
  createEditOutfitFormSchema,
  MAX_OUTFIT_DESCRIPTION_LENGTH,
  MAX_OUTFIT_NAME_LENGTH,
  MAX_OUTFIT_TAG_LENGTH,
  MIN_OUTFIT_PRODUCTS,
  normalizeOutfitTag,
  outfitTagSchema,
} from '@/lib/types/outfits/outfitsRules';
import {
  calculatePriceWithPercentageDiscount,
  convertPrice,
  formatDisplayPrice,
  getOutfitDiscountPercentage,
} from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { FetchError } from 'ofetch';
import { ReactNode, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { FaTag } from 'react-icons/fa6';
import { IoIosCloseCircle } from 'react-icons/io';
import { z } from 'zod';
import ClientOutfitDetailsPage from './ClientOutfitDetailsPage';
import { BackButton } from '@/components/dondeSiempre/BackButton';

type EditOutfitSchema = ReturnType<typeof createEditOutfitFormSchema>;
type EditOutfitFormInput = z.input<EditOutfitSchema>;
type EditOutfitFormValues = z.infer<EditOutfitSchema>;

type OutfitAdminFormProps = {
  outfit: OutfitDTO;
  onSave: (dto: OutfitUpdateDTO, image: File | null) => Promise<void>;
  onAddTag: (tag: OutfitTagDTO) => Promise<void>;
  onRemoveTag: (tag: OutfitTagDTO) => Promise<void>;
  onRemoveProduct: (productId: string) => Promise<void>;
  isSaving: boolean;
  isAddingTag: boolean;
  isRemovingTag: boolean;
  isRemovingProduct: boolean;
};

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

function OutfitAdminForm({
  outfit,
  onSave,
  onAddTag,
  onRemoveTag,
  onRemoveProduct,
  isSaving,
  isAddingTag,
  isRemovingTag,
  isRemovingProduct,
}: Readonly<OutfitAdminFormProps>) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [tagError, setTagError] = useState<string | null>(null);
  const [productError, setProductError] = useState<string | null>(null);
  const editOutfitSchema = createEditOutfitFormSchema();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditOutfitFormInput, unknown, EditOutfitFormValues>({
    resolver: zodResolver(editOutfitSchema),
    defaultValues: {
      name: outfit.name,
      description: outfit.description ?? '',
      discountPercentage: getOutfitDiscountPercentage(outfit),
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const nameValue = useWatch({ control, name: 'name' }) ?? '';
  const descriptionValue = useWatch({ control, name: 'description' }) ?? '';
  const discountPercentageValue = useWatch({ control, name: 'discountPercentage' }) ?? 0;
  const normalizedTagInput = normalizeOutfitTag(tagInput);
  const discountPercentage = Number(discountPercentageValue ?? 0);
  const hasOutfitDiscount = discountPercentage > 0;
  const outfitDisplayPrice = hasOutfitDiscount
    ? calculatePriceWithPercentageDiscount(outfit.priceInCents, discountPercentage)
    : convertPrice(outfit.priceInCents);
  const sortedProducts = [...outfit.products].sort((a, b) => a.index - b.index);
  const canRemoveProducts = sortedProducts.length > MIN_OUTFIT_PRODUCTS;

  const handleAddTag = async () => {
    const parsedTag = outfitTagSchema.safeParse(normalizedTagInput);

    if (!parsedTag.success) {
      setTagError(parsedTag.error.issues[0]?.message ?? 'La etiqueta no es válida.');
      return;
    }

    if (outfit.tags.some((tag) => tag.name.toLowerCase() === parsedTag.data.toLowerCase())) {
      setTagError('Esta etiqueta ya está añadida.');
      return;
    }

    try {
      await onAddTag({ name: parsedTag.data } as OutfitTagDTO);
      setTagInput('');
      setTagError(null);
    } catch (error: unknown) {
      setTagError(
        getFetchErrorMessage(
          error,
          'No se pudo añadir la etiqueta. Inténtalo de nuevo.',
          'Solo la tienda propietaria puede modificar las etiquetas.'
        )
      );
    }
  };

  const handleRemoveTag = async (tag: OutfitTagDTO) => {
    try {
      await onRemoveTag(tag);
      setTagError(null);
    } catch (error: unknown) {
      setTagError(
        getFetchErrorMessage(
          error,
          'No se pudo eliminar la etiqueta. Inténtalo de nuevo.',
          'Solo la tienda propietaria puede modificar las etiquetas.'
        )
      );
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!canRemoveProducts) {
      setProductError(`Un outfit debe conservar al menos ${MIN_OUTFIT_PRODUCTS} prendas.`);
      return;
    }

    try {
      await onRemoveProduct(productId);
      setProductError(null);
    } catch (error: unknown) {
      setProductError(
        getFetchErrorMessage(
          error,
          'No se pudo quitar el producto. Intentalo de nuevo.',
          'Solo la tienda propietaria puede modificar los productos del outfit.'
        )
      );
    }
  };

  const submitForm = async (data: EditOutfitFormValues) => {
    setFormError(null);

    try {
      await onSave(
        {
          name: data.name,
          description: data.description,
          discountPercentage: data.discountPercentage > 0 ? data.discountPercentage : null,
        },
        imageFile
      );
    } catch (error: unknown) {
      setFormError(
        getFetchErrorMessage(
          error,
          'No se pudieron guardar los cambios. Revisa los campos e inténtalo de nuevo.',
          'Debes iniciar sesión como la tienda propietaria para editar este outfit.'
        )
      );
    }
  };

  return (
    <Card className="w-full max-w-4xl p-4 shadow-xl sm:p-6 md:p-8">
      <h1 className="mb-6 text-center text-3xl font-bold text-primary">Editar outfit</h1>

      <form onSubmit={handleSubmit(submitForm)} className="space-y-6" noValidate>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="form-name" className="text-base font-bold text-secondary">
              Nombre
            </Label>
            <Input
              id="form-name"
              maxLength={MAX_OUTFIT_NAME_LENGTH}
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <FieldError message={errors.name?.message} />
              <p className="shrink-0 text-xs text-muted-foreground">
                {nameValue.length}/{MAX_OUTFIT_NAME_LENGTH}
              </p>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
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

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="form-image" className="text-base font-bold text-secondary">
              Imagen
            </Label>
            <div id="form-image">
              <ImageUpload onChange={setImageFile} existingImageUrl={outfit.image || undefined} />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
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

          <div className="space-y-1 md:col-span-2">
            <p className="text-sm text-muted-foreground">
              Precio original del outfit:{' '}
              <strong>{formatDisplayPrice(convertPrice(outfit.priceInCents))}</strong>
            </p>
            {hasOutfitDiscount && (
              <p className="text-sm font-semibold text-secondary">
                Descuento aplicado al outfit: -{discountPercentage.toFixed(0)}%
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Precio final del outfit: <strong>{formatDisplayPrice(outfitDisplayPrice)}</strong>
            </p>
          </div>

          <div className="space-y-3 md:col-span-2">
            <div className="space-y-1">
              <Label className="text-base font-bold text-secondary">Productos del outfit</Label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sortedProducts.map((product) => (
                <Card key={product.id} className="relative overflow-hidden p-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Quitar ${product.name} del outfit`}
                    onClick={() => void handleRemoveProduct(product.id)}
                    disabled={isRemovingProduct}
                    className="absolute right-2 top-2 text-secondary hover:bg-transparent hover:text-dark-secondary"
                  >
                    <IoIosCloseCircle className="size-5" />
                  </Button>
                  <div className="flex items-start gap-3 pr-6">
                    <Image
                      src={product.image || '/static/img/product_placeholder.png'}
                      alt={product.name}
                      width={160}
                      height={160}
                      className="h-20 w-20 shrink-0 rounded-lg object-cover shadow-md"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div className="min-w-0">
                        <p className="break-words font-semibold text-primary">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDisplayPrice(convertPrice(product.priceInCents))}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <FieldError message={productError} />
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
                className="min-w-0"
                onChange={(event) => {
                  setTagInput(event.target.value);
                  if (tagError) {
                    setTagError(null);
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ',') {
                    event.preventDefault();
                    void handleAddTag();
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => void handleAddTag()}
                disabled={isAddingTag || isRemovingTag || normalizedTagInput.length === 0}
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
            <div className="flex flex-wrap gap-2">
              {outfit.tags.map((tag) => (
                <Button
                  key={tag.name}
                  type="button"
                  onClick={() => void handleRemoveTag(tag)}
                  disabled={isAddingTag || isRemovingTag}
                  className="h-auto max-w-full whitespace-normal break-words rounded-lg bg-secondary px-3 py-2 text-left hover:bg-dark-secondary"
                >
                  <FaTag className="mr-2 shrink-0 text-white" />
                  <span className="break-words text-xs font-bold text-white sm:text-sm">
                    {tag.name}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <div className="flex justify-center">
          <Button
            type="submit"
            className="mt-2 h-12 w-full bg-secondary text-base font-bold text-white hover:bg-dark-secondary md:w-1/3"
            disabled={isSubmitting || isSaving}
          >
            {isSubmitting || isSaving ? 'Guardando cambios...' : 'Confirmar cambios'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function OutfitDetailsPage() {
  const params = useParams<{ id: string; outfitId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const outfit = usePassiveFetcher<OutfitDTO>({ url: `outfits/${params.outfitId}` });
  const updateOutfit = useActiveFetcher<OutfitDTO>({
    url: `outfits/${params.outfitId}`,
    method: 'PUT',
  });
  const addTag = useActiveFetcher<OutfitTagDTO>({
    url: `outfits/${params.outfitId}/tags`,
    method: 'POST',
  });
  const removeTag = useActiveFetcher<string>({
    url: `outfits/${params.outfitId}/tags`,
    method: 'DELETE',
  });
  const removeProduct = useActiveFetcher<void>({ method: 'DELETE' });

  if (outfit.isLoading) {
    return <LoadingText />;
  }

  if (outfit.isError) {
    return (
      <ErrorView
        title="Outfit no encontrado"
        description="No pudimos encontrar este outfit. Puede que se haya eliminado o que el enlace ya no sea válido."
        buttonText="Volver atrás"
      />
    );
  }

  const saveOutfit = async (dto: OutfitUpdateDTO, imageFile: File | null) => {
    await updateOutfit.fetch({
      formPayload: {
        dto: new Blob([JSON.stringify(dto)], { type: 'application/json' }),
        image: imageFile ?? undefined,
      },
    });
    await queryClient.invalidateQueries({
      queryKey: ['outfits'],
    });
    router.push(`/stores/${params.id}/outfits`);
  };

  const saveAddedTag = async (tag: OutfitTagDTO) => {
    const createdTag = await addTag.fetch({
      body: tag,
    });
    if (!outfit.data) {
      return;
    }

    outfit.setData({
      ...outfit.data,
      tags: [...outfit.data.tags, createdTag],
    });
  };

  const deleteTag = async (tag: OutfitTagDTO) => {
    await removeTag.fetch({
      body: tag,
    });
    if (!outfit.data) {
      return;
    }

    outfit.setData({
      ...outfit.data,
      tags: outfit.data.tags.filter((currentTag) => currentTag !== tag),
    });
  };

  const deleteProduct = async (productId: string) => {
    await removeProduct.fetch({
      url: `outfits/${params.outfitId}/products/${productId}`,
    });
    await outfit.refetch();
  };

  const renderClientPage = (): ReactNode => {
    return <ClientOutfitDetailsPage outfit={outfit.data} />;
  };

  return (
    <StoreOwnerGuard
      storeId={params.id}
      fallbackWhenLoggedOut={renderClientPage()}
      fallbackWhenNotStore={renderClientPage()}
      fallbackWhenNotStoreOwner={renderClientPage()}
    >
      <div className="flex flex-col items-center relative">
        <div className="w-full max-w-5xl px-4 md:px-10 pt-4">
          <BackButton />
        </div>
        {outfit.data ? (
          <div className="w-full px-4 py-6">
            <div className="mx-auto flex w-full justify-center">
              <OutfitAdminForm
                outfit={outfit.data}
                onSave={saveOutfit}
                onAddTag={saveAddedTag}
                onRemoveTag={deleteTag}
                onRemoveProduct={deleteProduct}
                isSaving={updateOutfit.isPending}
                isAddingTag={addTag.isPending}
                isRemovingTag={removeTag.isPending}
                isRemovingProduct={removeProduct.isPending}
              />
            </div>
          </div>
        ) : (
          <NotFoundText message="El outfit que buscas no existe..." />
        )}
      </div>
    </StoreOwnerGuard>
  );
}
