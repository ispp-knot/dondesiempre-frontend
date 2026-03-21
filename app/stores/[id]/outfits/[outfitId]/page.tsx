'use client';

import ErrorText from '@/components/dondeSiempre/ErrorText';
import ImageUpload from '@/components/dondeSiempre/ImageUpload';
import LabelledSwitch from '@/components/dondeSiempre/LabelledSwitch';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePassiveFetcher, useActiveFetcher } from '@/lib/api/fetcher';
import { OutfitDTO, OutfitUpdateDTO } from '@/lib/types/outfits/outfitsDto';
import {
  createEditOutfitFormSchema,
  MAX_OUTFIT_DESCRIPTION_LENGTH,
  MAX_OUTFIT_INDEX,
  MAX_OUTFIT_NAME_LENGTH,
  MAX_OUTFIT_TAG_LENGTH,
  normalizeOutfitTag,
  outfitTagSchema,
} from '@/lib/types/outfits/outfitsRules';
import { OrderDTO } from '@/lib/types/orders/orderDto';
import {
  calculatePriceWithPercentageDiscount,
  convertPrice,
  getOutfitDiscountPercentage,
  getOutfitDisplayPrice,
} from '@/lib/utils';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { FaTag } from 'react-icons/fa6';
import { GoDotFill } from 'react-icons/go';
import { z } from 'zod';

interface FetchError {
  status?: number;
  message?: string;
}

type EditOutfitSchema = ReturnType<typeof createEditOutfitFormSchema>;
type EditOutfitFormInput = z.input<EditOutfitSchema>;
type EditOutfitFormValues = z.infer<EditOutfitSchema>;

type OutfitAdminFormProps = {
  outfit: OutfitDTO;
  onSave: (dto: OutfitUpdateDTO, image: File | null) => Promise<void>;
  onAddTag: (tag: string) => Promise<void>;
  onRemoveTag: (tag: string) => Promise<void>;
  isSaving: boolean;
  isAddingTag: boolean;
  isRemovingTag: boolean;
};

function FieldError({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

function OutfitAdminForm({
  outfit,
  onSave,
  onAddTag,
  onRemoveTag,
  isSaving,
  isAddingTag,
  isRemovingTag,
}: Readonly<OutfitAdminFormProps>) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [tagError, setTagError] = useState<string | null>(null);
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
      index: outfit.index,
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

  const handleAddTag = async () => {
    const parsedTag = outfitTagSchema.safeParse(normalizedTagInput);

    if (!parsedTag.success) {
      setTagError(parsedTag.error.issues[0]?.message ?? 'La etiqueta no es válida.');
      return;
    }

    if (outfit.tags.some((tag) => tag.toLowerCase() === parsedTag.data.toLowerCase())) {
      setTagError('Esta etiqueta ya está añadida.');
      return;
    }

    try {
      await onAddTag(parsedTag.data);
      setTagInput('');
      setTagError(null);
    } catch {
      setTagError('No se pudo añadir la etiqueta. Inténtalo de nuevo.');
    }
  };

  const handleRemoveTag = async (tag: string) => {
    try {
      await onRemoveTag(tag);
      setTagError(null);
    } catch {
      setTagError('No se pudo eliminar la etiqueta. Inténtalo de nuevo.');
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
          discountedPriceInCents:
            data.discountPercentage > 0
              ? Math.round(outfit.priceInCents * (1 - data.discountPercentage / 100))
              : outfit.priceInCents,
          index: data.index,
        },
        imageFile
      );
    } catch {
      setFormError('No se pudieron guardar los cambios. Revisa los campos e inténtalo de nuevo.');
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

          <div className="space-y-2">
            <Label htmlFor="form-image" className="text-base font-bold text-secondary">
              Imagen
            </Label>
            <div id="form-image">
              <ImageUpload onChange={setImageFile} existingImageUrl={outfit.image || undefined} />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="form-discount-percentage"
                className="text-base font-bold text-secondary"
              >
                Descuento
              </Label>
              <Input
                id="form-discount-percentage"
                type="number"
                min="0"
                max="100"
                step="1"
                inputMode="numeric"
                aria-invalid={!!errors.discountPercentage}
                {...register('discountPercentage')}
              />
              <p className="text-xs text-muted-foreground">
                Usa `0` si no quieres aplicar descuento. Si lo hay, indica el porcentaje.
              </p>
              <FieldError message={errors.discountPercentage?.message} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="form-index" className="text-base font-bold text-secondary">
                Índice
              </Label>
              <Input
                id="form-index"
                type="number"
                min="0"
                max={`${MAX_OUTFIT_INDEX}`}
                step="1"
                inputMode="numeric"
                aria-invalid={!!errors.index}
                {...register('index')}
              />
              <p className="text-xs text-muted-foreground">
                Usa un número entero entre 0 y {MAX_OUTFIT_INDEX}.
              </p>
              <FieldError message={errors.index?.message} />
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <p className="text-sm text-muted-foreground">
              Precio original del outfit:{' '}
              <strong>
                {`${convertPrice(outfit.priceInCents).toFixed(2).toString().replace('.', ',')}€`}
              </strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Precio final del outfit:{' '}
              <strong>{`${outfitDisplayPrice.toFixed(2).toString().replace('.', ',')}€`}</strong>
            </p>
            {hasOutfitDiscount && (
              <p className="text-sm font-semibold text-secondary">
                Descuento aplicado al outfit: -{discountPercentage.toFixed(0)}%
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
                Pulsa Enter o &quot;,&quot; para añadir una etiqueta. Los espacios ya no la crean
                automáticamente.
              </p>
              <p className="shrink-0 text-xs text-muted-foreground">
                {tagInput.length}/{MAX_OUTFIT_TAG_LENGTH}
              </p>
            </div>
            <FieldError message={tagError} />
            <div className="flex flex-wrap gap-2">
              {outfit.tags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  onClick={() => void handleRemoveTag(tag)}
                  disabled={isAddingTag || isRemovingTag}
                  className="h-auto max-w-full whitespace-normal break-words rounded-lg bg-secondary px-3 py-2 text-left hover:bg-dark-secondary"
                >
                  <FaTag className="mr-2 shrink-0 text-white" />
                  <span className="break-words text-xs font-bold text-white sm:text-sm">{tag}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        <div className="flex justify-center">
          <Button
            type="submit"
            className="mt-2 h-12 w-full bg-secondary text-base font-bold text-white hover:cursor-pointer hover:bg-dark-secondary md:w-1/3"
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

  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(0);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const outfit = usePassiveFetcher<OutfitDTO>({ url: `outfits/${params.outfitId}` });
  const updateOutfit = useActiveFetcher<OutfitDTO>({
    url: `outfits/${params.outfitId}`,
    method: 'PUT',
  });
  const addTag = useActiveFetcher<string>({
    url: `outfits/${params.outfitId}/tags`,
    method: 'POST',
  });
  const removeTag = useActiveFetcher<string>({
    url: `outfits/${params.outfitId}/tags`,
    method: 'DELETE',
  });
  const createOrder = useActiveFetcher<OrderDTO>({
    url: 'orders',
    method: 'POST',
  });

  if (outfit.isLoading) {
    return <LoadingText />;
  }

  if (outfit.isError) {
    return <ErrorText error={outfit.error} />;
  }

  const saveOutfit = async (dto: OutfitUpdateDTO, imageFile: File | null) => {
    await updateOutfit.fetch({
      formPayload: {
        dto: new Blob([JSON.stringify(dto)], { type: 'application/json' }),
        image: imageFile ?? undefined,
      },
    });
    router.push(`/stores/${params.id}/outfits`);
  };

  const saveAddedTag = async (tag: string) => {
    const createdTag = await addTag.fetch({ body: tag });
    if (!outfit.data) {
      return;
    }

    outfit.setData({
      ...outfit.data,
      tags: [...outfit.data.tags, createdTag],
    });
  };

  const deleteTag = async (tag: string) => {
    await removeTag.fetch({ body: tag });
    if (!outfit.data) {
      return;
    }

    outfit.setData({
      ...outfit.data,
      tags: outfit.data.tags.filter((currentTag) => currentTag !== tag),
    });
  };

  const confirmAndCreateOrder = async () => {
    if (!outfit.data) return;

    setIsCreatingOrder(true);

    const payload: Record<string, number> = {};
    outfit.data.products.forEach((product) => {
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
      <LabelledSwitch
        label="Modo tienda"
        checked={isAdmin}
        onCheckedChange={(checked) => setIsAdmin(checked)}
      />
      <div className="flex flex-col items-center relative">
        {outfit.data ? (
          isAdmin ? (
            <div className="w-full px-4 py-6">
              <div className="mx-auto flex w-full justify-center">
                <OutfitAdminForm
                  outfit={outfit.data}
                  onSave={saveOutfit}
                  onAddTag={saveAddedTag}
                  onRemoveTag={deleteTag}
                  isSaving={updateOutfit.isPending}
                  isAddingTag={addTag.isPending}
                  isRemovingTag={removeTag.isPending}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="pt-8 pl-8 pr-8 pb-4">
                <div>
                  <h1 className="mb-1 font-bold text-primary text-center text-3xl">
                    {outfit.data.name}
                  </h1>
                  {outfit.data.description ? (
                    <p className="text-secondary text-center text-md">{outfit.data.description}</p>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <div className="flex flex-row justify-center relative">
                <Image
                  src={
                    outfit.data.products[selectedProduct].image ||
                    '/static/img/product_placeholder.png'
                  }
                  alt={outfit.data.products[selectedProduct].name}
                  width={1024}
                  height={1024}
                  loading={'eager'}
                  className="aspect-square w-full md:w-sm object-cover md:rounded-lg shrink-0 shadow-lg"
                ></Image>
                <div className="mb-1 flex flex-row justify-center absolute bottom-0">
                  {outfit.data.products.map((_, i) => (
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
                    {outfit.data.products[selectedProduct].name}
                  </h1>
                </div>
                <div className="pt-8 pb-6 flex flex-row w-fit max-w-11/12 self-center overflow-x-scroll items-center gap-4">
                  {outfit.data.products.map((p, i) => (
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
                    {`${getOutfitDisplayPrice(outfit.data).toFixed(2).toString().replace('.', ',')}€ con IVA`}
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
          )
        ) : (
          <NotFoundText message="El outfit que buscas no existe..." />
        )}
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background p-8 rounded-lg shadow-xl flex flex-col items-center gap-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-primary text-center">¿Confirmar pedido?</h2>
            {outfit.data && (
              <p className="text-secondary text-center">
                Vas a realizar un pedido por un total de{' '}
                <strong>{`${getOutfitDisplayPrice(outfit.data).toFixed(2).toString().replace('.', ',')}€`}</strong>
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
