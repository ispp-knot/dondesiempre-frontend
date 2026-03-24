'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActiveFetcher } from '@/lib/api/fetcher';
import { FetchError } from 'ofetch';
import { useAuth } from '@/lib/auth/AuthContext';
import { LoginResponseDTO } from '@/lib/types/auth/authDto';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

type LoginValues = z.infer<typeof loginSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function LoginForm() {
  const [apiError, setApiError] = useState<string | null>(null);
  const { registerInfo } = useAuth();

  const login = useActiveFetcher<LoginResponseDTO>({ url: 'auth/login', method: 'POST' });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginValues) {
    setApiError(null);
    try {
      const loginResponse = await login.fetch({ body: data });
      registerInfo({ ...loginResponse.user }, loginResponse.token);
      // No need to redirect. The auth guard for this page will redirect
    } catch (err: unknown) {
      if (err instanceof FetchError && err.response?.status === 403) {
        setApiError('Credenciales incorrectos.');
      } else {
        setApiError('Ha ocurrido un error.');
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="correo@ejemplo.com"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        <FieldError message={errors.password?.message} />
      </div>

      {apiError && <p className="text-xs text-destructive">{apiError}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-primary underline underline-offset-4">
          Regístrate
        </Link>
      </p>
    </form>
  );
}
