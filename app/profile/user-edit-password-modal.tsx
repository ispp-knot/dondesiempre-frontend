'use client';

import { useEffect, useState } from 'react';
import { KeyRound, Loader2, Save, X } from 'lucide-react';
import { z } from 'zod';
import { useActiveFetcher } from '@/lib/api/fetcher';
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

const passwordUpdateSchema = z
  .object({
    oldPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
    newPassword: z
      .string()
      .min(8, 'Debe tener al menos 8 caracteres')
      .regex(/\p{Lu}/u, 'Debe contener al menos una letra mayúscula')
      .regex(/\p{N}/u, 'Debe contener al menos un número')
      .regex(/[\p{S}\p{P}]/u, 'Debe contener al menos un símbolo'),
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type PasswordUpdateInput = z.input<typeof passwordUpdateSchema>;
type PasswordUpdateValues = z.infer<typeof passwordUpdateSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

type UserEditPasswordProps = {
  onSuccessAction: () => void;
};

export default function UserEditPassword({ onSuccessAction }: UserEditPasswordProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const updatePassword = useActiveFetcher<void>({
    url: 'auth/password',
    method: 'PUT',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordUpdateInput, unknown, PasswordUpdateValues>({
    resolver: zodResolver(passwordUpdateSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [isOpen, reset]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    setApiError(null);
  };

  async function onSubmit(data: PasswordUpdateValues) {
    setApiError(null);

    try {
      await updatePassword.fetch({
        body: {
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
        },
      });

      setIsOpen(false);
      onSuccessAction();
    } catch (err: unknown) {
      const fetchError = err as {
        status?: number;
        response?: { status?: number };
        message?: string;
        data?: { message?: string };
      };

      const statusCode = fetchError?.status || fetchError?.response?.status;
      const isUnauthorized =
        statusCode === 403 ||
        statusCode === 401 ||
        fetchError?.message?.includes('403') ||
        fetchError?.message?.includes('401');

      if (isUnauthorized) {
        setApiError('Contraseña actual incorrecta.');
      } else if (fetchError?.data?.message) {
        setApiError(fetchError.data.message);
      } else {
        setApiError('Ocurrió un error al intentar cambiar la contraseña.');
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Cambiar contraseña">
          <KeyRound className="w-5 h-5 text-muted-foreground" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex items-center justify-center">
          <DialogTitle className="inline-flex items-center justify-center rounded-full bg-secondary px-3 py-4 w-64 text-xl font-bold text-white text-center">
            Cambiar contraseña
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2" noValidate>
          <div className="grid gap-2">
            <Label htmlFor="oldPassword">Contraseña actual</Label>
            <Input
              id="oldPassword"
              type="password"
              aria-invalid={!!errors.oldPassword}
              {...register('oldPassword')}
            />
            <FieldError message={errors.oldPassword?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              aria-invalid={!!errors.newPassword}
              {...register('newPassword')}
            />
            <FieldError message={errors.newPassword?.message} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Repite la nueva contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              aria-invalid={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
            <FieldError message={errors.confirmPassword?.message} />
          </div>

          {apiError && <p className="text-xs text-destructive text-center">{apiError}</p>}

          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting || updatePassword.isPending}
            >
              <X className="w-4 h-4 mr-1" />
              Cancelar
            </Button>

            <Button type="submit" disabled={isSubmitting || updatePassword.isPending}>
              {isSubmitting || updatePassword.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Actualizar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
