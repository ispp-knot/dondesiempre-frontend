'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import { z } from 'zod';
import { useActiveFetcher } from '@/lib/api/fetcher';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const storeUpdateSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255, 'Máximo 255 caracteres'),
  email: z
    .email('Email inválido')
    .max(254, 'Email demasiado largo')
    .refine((val) => {
      const [local, domain] = val.split('@');

      if (local.length > 64) return false;

      const domainLabels = domain.split('.');
      const isDomainLabelsValid = domainLabels.every((label) => label.length <= 63);

      return isDomainLabelsValid;
    }, 'Antes del @ tiene más de 64 caracteres o después hay segmentos del dominio superiores a 63 caracteres.'),
  address: z.string().min(1, 'La dirección es obligatoria').max(255, 'Máximo 255 caracteres'),
  openingHours: z.string().min(1, 'El horario es obligatorio').max(255, 'Máximo 255 caracteres'),
  aboutUs: z.string().max(5000, 'Máximo 5000 caracteres').optional(),
});

type StoreUpdateInput = z.input<typeof storeUpdateSchema>;
type StoreUpdateValues = z.infer<typeof storeUpdateSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

type StoreEditModalProps = {
  open: boolean;
  close: (open: boolean) => void;
  store: StoreDTO;
  storeId: string;
  onUpdated: (store: StoreDTO) => void;
};

export default function StoreEditModal({
  open,
  close,
  store,
  storeId,
  onUpdated,
}: StoreEditModalProps) {
  const updateStore = useActiveFetcher<StoreDTO>({
    url: `stores/${storeId}`,
    method: 'PUT',
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StoreUpdateInput, unknown, StoreUpdateValues>({
    resolver: zodResolver(storeUpdateSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      openingHours: '',
      aboutUs: '',
    },
  });

  useEffect(() => {
    if (!open) return;

    reset({
      name: store.name ?? '',
      email: store.email ?? '',
      address: store.address ?? '',
      openingHours: store.openingHours ?? '',
      aboutUs: store.aboutUs ?? '',
    });
  }, [open, store, reset]);
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setApiError(null);
    }
    close(nextOpen);
  };

  async function onSubmit(data: StoreUpdateValues) {
    setApiError(null);

    try {
      const updatedStore = await updateStore.fetch({
        body: {
          name: data.name,
          email: data.email,
          address: data.address,
          openingHours: data.openingHours,
          aboutUs: data.aboutUs?.trim() === '' ? null : data.aboutUs,
        },
      });

      onUpdated(updatedStore);
      close(false);
    } catch {
      setApiError('No se pudo actualizar la tienda.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex items-center justify-center">
          <DialogTitle className="inline-flex items-center justify-center rounded-full bg-secondary px-3 py-4 w-48 text-xl font-bold text-white">
            Editar tienda
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-xl">
              Nombre
            </Label>
            <Input
              id="name"
              className="text-muted-foreground text-2xl "
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-xl">
              Email de contacto
            </Label>
            <Input
              id="email"
              type="email"
              className="text-muted-foreground text-2xl "
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address" className="text-xl">
              Dirección
            </Label>
            <Input
              id="address"
              className="text-muted-foreground text-2xl "
              aria-invalid={!!errors.address}
              {...register('address')}
            />
            <FieldError message={errors.address?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="openingHours" className="text-xl">
              Horario
            </Label>
            <Input
              id="openingHours"
              className="text-muted-foreground text-xl "
              aria-invalid={!!errors.openingHours}
              {...register('openingHours')}
            />
            <FieldError message={errors.openingHours?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="aboutUs" className="text-xl">
              Sobre nosotros
            </Label>
            <textarea
              id="aboutUs"
              rows={2}
              aria-invalid={!!errors.aboutUs}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-base text-muted-foreground leading-normal aria-invalid:border-destructive"
              {...register('aboutUs')}
            />
            <FieldError message={errors.aboutUs?.message} />
          </div>

          {apiError && <p className="text-xs text-destructive">{apiError}</p>}

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => close(false)}
              disabled={isSubmitting || updateStore.isPending}
            >
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>

            <Button type="submit" disabled={isSubmitting || updateStore.isPending}>
              {isSubmitting || updateStore.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Guardar cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
