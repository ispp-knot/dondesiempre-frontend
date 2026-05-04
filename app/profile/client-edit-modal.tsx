'use client';

import { useEffect, useState } from 'react';
import { Edit2, Loader2, Save, X } from 'lucide-react';
import { z } from 'zod';
import { useActiveFetcher } from '@/lib/api/fetcher';
import { ClientDTO } from '@/lib/types/clients/clientsDto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FetchError } from 'ofetch';

const clientUpdateSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(255, 'Máximo 255 caracteres'),
  surname: z.string().min(1, 'Los apellidos son obligatorios').max(255, 'Máximo 255 caracteres'),
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
});

type ClientUpdateValues = z.infer<typeof clientUpdateSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

type ClientEditModalProps = {
  client: ClientDTO;
  onSavedAction: () => void;
};

export default function ClientEditModal({ client, onSavedAction }: ClientEditModalProps) {
  const updateClient = useActiveFetcher<ClientDTO>({
    url: `clients`,
    method: 'PUT',
  });

  const [isOpen, setIsOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClientUpdateValues>({
    resolver: zodResolver(clientUpdateSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: client.name ?? '',
        surname: client.surname ?? '',
        email: client.email ?? '',
      });
    }
  }, [isOpen, client, reset]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    setApiError(null);
  };

  async function onSubmit(data: ClientUpdateValues) {
    setApiError(null);

    try {
      await updateClient.fetch({
        body: {
          name: data.name,
          surname: data.surname,
          email: data.email,
        },
      });

      setIsOpen(false);
      onSavedAction();
    } catch (err: unknown) {
      const fetchError = err as { message?: string; status?: number; data?: { message?: string } };

      if (fetchError?.message?.includes('409') || fetchError?.status === 409) {
        setApiError('Este email ya está registrado en otra cuenta.');
        return;
      }
      if (fetchError?.data?.message) {
        setApiError(fetchError.data.message);
        return;
      }
      if (err instanceof FetchError && err.statusCode === 400 && typeof err.data === 'string') {
        setApiError(err.data);
        return;
      }
      setApiError('No se pudo actualizar el perfil. Comprueba los datos.');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Edit2 className="w-4 h-4 mr-2" />
          Editar perfil
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-150">
        <DialogHeader className="flex items-center justify-center">
          <DialogTitle className="inline-flex items-center justify-center rounded-full bg-secondary px-3 py-4 w-48 text-xl font-bold text-white">
            Editar perfil
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xl">
                Nombre
              </Label>
              <Input
                id="name"
                className="text-muted-foreground text-xl"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="surname" className="text-xl">
                Apellidos
              </Label>
              <Input
                id="surname"
                className="text-muted-foreground text-xl"
                aria-invalid={!!errors.surname}
                {...register('surname')}
              />
              <FieldError message={errors.surname?.message} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-xl">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              className="text-muted-foreground text-xl"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
          </div>

          {apiError && <p className="text-xs text-destructive text-center">{apiError}</p>}

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting || updateClient.isPending}
            >
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>

            <Button type="submit" disabled={isSubmitting || updateClient.isPending}>
              {isSubmitting || updateClient.isPending ? (
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
