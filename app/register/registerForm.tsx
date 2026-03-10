'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';

import { FetchError } from 'ofetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LocationPickerMap } from '@/components/ui/locationPickerMap';
import { registerClient, registerStore } from '@/lib/api/authEndpoints';

// ── Schemas ────────────────────────────────────────────────────────────────────

const step1Schema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/\p{Uppercase_Letter}/u, 'Al menos una mayúscula')
      .regex(/\p{Number}/u, 'Al menos un número')
      .regex(/[\p{Symbol}\p{Punctuation}]/u, 'Al menos un símbolo'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

const clientStep2Schema = z.object({
  name: z.string().min(1, 'Requerido').max(255),
  surname: z.string().min(1, 'Requerido').max(255),
  phone: z
    .string()
    .refine((value) => value === '' || /^(\+\d{1,3}[- ]?)?\d{7,15}$/.test(value), {
      message: 'Invalid phone number',
    })
    .transform((value) => (value === '' ? null : value)),
  address: z
    .string()
    .max(255)
    .transform((value) => (value === '' ? null : value)),
});

const storeStep2Schema = z.object({
  name: z.string().min(1, 'Requerido').max(255),
  latitude: z.number({ error: 'Selecciona una ubicación en el mapa' }),
  longitude: z.number({ error: 'Selecciona una ubicación en el mapa' }),
  address: z.string().min(1, 'Requerido').max(255),
  openingHours: z.string().min(1, 'Requerido').max(255),
  acceptsShipping: z.boolean(),
  phone: z
    .string()
    .refine((value) => value === '' || /^(\+\d{1,3}[- ]?)?\d{7,15}$/.test(value), {
      message: 'Invalid phone number',
    })
    .transform((value) => (value === '' ? null : value)),
  aboutUs: z
    .string()
    .max(5000)
    .transform((value) => (value === '' ? null : value)),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido (ej: #FF0000)'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color inválido (ej: #FF0000)'),
});

type Step1Values = z.infer<typeof step1Schema>;
type ClientStep2InputValues = z.input<typeof clientStep2Schema>;
type ClientStep2Values = z.infer<typeof clientStep2Schema>;
type StoreStep2InputValues = z.input<typeof storeStep2Schema>;
type StoreStep2Values = z.infer<typeof storeStep2Schema>;

// ── Shared helpers ─────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="">{message}</p>;
}

// ── Root component ─────────────────────────────────────────────────────────────

export default function RegisterForm() {
  const [type, setType] = useState<'client' | 'store'>('client');
  const [step, setStep] = useState<1 | 2>(1);
  const [started, setStarted] = useState(false);
  const [step1Data, setStep1Data] = useState<Step1Values | null>(null);
  const [success, setSuccess] = useState(false);

  function handleStep1Complete(data: Step1Values) {
    setStep1Data(data);
    setStep(2);
  }

  function handleTypeSwitch(newType: 'client' | 'store') {
    if (newType === type) return;
    setType(newType);
    setStep(1);
    setStarted(false);
  }

  function handleBack() {
    setStep(1);
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-primary">¡Registro exitoso!</h2>
        <p className="text-muted-foreground">Tu cuenta ha sido creada correctamente.</p>
        <Link href="/login" className="text-primary underline underline-offset-4">
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => handleTypeSwitch('client')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            type === 'client'
              ? 'bg-secondary text-white'
              : 'bg-transparent text-secondary hover:bg-secondary/10'
          }`}
        >
          Soy cliente
        </button>
        <button
          type="button"
          onClick={() => handleTypeSwitch('store')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            type === 'store'
              ? 'bg-secondary text-white'
              : 'bg-transparent text-secondary hover:bg-secondary/10'
          }`}
        >
          Soy tienda
        </button>
      </div>

      {/* Step indicator */}
      {started && (
        <div className="flex items-center justify-center gap-2">
          <span
            className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 1 ? 'bg-primary text-white' : 'bg-primary/20 text-primary'
            }`}
          >
            1
          </span>
          <div className="h-px w-8 bg-border" />
          <span
            className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            2
          </span>
        </div>
      )}

      {step === 1 && (
        <Step1Form
          defaultValues={step1Data ?? undefined}
          onComplete={handleStep1Complete}
          onFirstSubmit={() => setStarted(true)}
        />
      )}

      {step === 2 && type === 'client' && step1Data && (
        <ClientStep2Form
          step1Data={step1Data}
          onBack={handleBack}
          onSuccess={() => setSuccess(true)}
        />
      )}

      {step === 2 && type === 'store' && step1Data && (
        <StoreStep2Form
          step1Data={step1Data}
          onBack={handleBack}
          onSuccess={() => setSuccess(true)}
        />
      )}

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-primary underline underline-offset-4">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}

// ── Step 1 form ────────────────────────────────────────────────────────────────

function Step1Form({
  defaultValues,
  onComplete,
  onFirstSubmit,
}: {
  defaultValues?: Partial<Step1Values>;
  onComplete: (data: Step1Values) => void;
  onFirstSubmit: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues,
  });

  function onSubmit(data: Step1Values) {
    onFirstSubmit();
    onComplete(data);
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

      <div className="space-y-1">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          aria-invalid={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      <Button type="submit" className="w-full">
        Siguiente
      </Button>
    </form>
  );
}

// ── Client step 2 ──────────────────────────────────────────────────────────────

function ClientStep2Form({
  step1Data,
  onBack,
  onSuccess,
}: {
  step1Data: Step1Values;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientStep2InputValues, unknown, ClientStep2Values>({
    resolver: zodResolver(clientStep2Schema),
  });

  async function onSubmit(data: ClientStep2Values) {
    setApiError(null);
    try {
      await registerClient({
        email: step1Data.email,
        password: step1Data.password,
        ...data,
      });
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof FetchError && err.response?.status === 409) {
        setApiError('El correo ya existe.');
      } else {
        setApiError('Ha ocurrido un error.');
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" aria-invalid={!!errors.name} {...register('name')} />
        <FieldError message={errors.name?.message} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="surname">Apellido</Label>
        <Input id="surname" aria-invalid={!!errors.surname} {...register('surname')} />
        <FieldError message={errors.surname?.message} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" type="tel" aria-invalid={!!errors.phone} {...register('phone')} />
        <FieldError message={errors.phone?.message} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" aria-invalid={!!errors.address} {...register('address')} />
        <FieldError message={errors.address?.message} />
      </div>

      {apiError && <p className="text-xs text-destructive">{apiError}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          Atrás
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando…' : 'Registrarse'}
        </Button>
      </div>
    </form>
  );
}

// ── Store step 2 ───────────────────────────────────────────────────────────────

function StoreStep2Form({
  step1Data,
  onBack,
  onSuccess,
}: {
  step1Data: Step1Values;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StoreStep2InputValues, unknown, StoreStep2Values>({
    resolver: zodResolver(storeStep2Schema),
    defaultValues: {
      acceptsShipping: false,
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
    },
  });

  const primaryColor = watch('primaryColor');
  const secondaryColor = watch('secondaryColor');
  const acceptsShipping = watch('acceptsShipping');

  async function onSubmit(data: StoreStep2Values) {
    setApiError(null);
    try {
      await registerStore({
        email: step1Data.email,
        password: step1Data.password,
        ...data,
      });
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof FetchError && err.response?.status === 409) {
        setApiError('Nombre de usuario ya tomado.');
      } else {
        setApiError('Ha ocurrido un error.');
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="space-y-1">
        <Label htmlFor="name">Nombre de la tienda</Label>
        <Input id="name" aria-invalid={!!errors.name} {...register('name')} />
        <FieldError message={errors.name?.message} />
      </div>
      <div className="space-y-1">
        <Label>Ubicación</Label>
        <LocationPickerMap
          latitude={watch('latitude') || undefined}
          longitude={watch('longitude') || undefined}
          onChange={(lat, lng) => {
            setValue('latitude', lat, { shouldValidate: true });
            setValue('longitude', lng, { shouldValidate: true });
          }}
        />
        {(errors.latitude || errors.longitude) && (
          <FieldError message={errors.latitude?.message ?? errors.longitude?.message} />
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" aria-invalid={!!errors.address} {...register('address')} />
        <FieldError message={errors.address?.message} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="openingHours">Horario de apertura</Label>
        <Input
          id="openingHours"
          placeholder="Lun-Vie 9:00-18:00"
          aria-invalid={!!errors.openingHours}
          {...register('openingHours')}
        />
        <FieldError message={errors.openingHours?.message} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" type="tel" aria-invalid={!!errors.phone} {...register('phone')} />
        <FieldError message={errors.phone?.message} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="aboutUs">Sobre nosotros</Label>
        <textarea
          id="aboutUs"
          rows={3}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:border-destructive"
          aria-invalid={!!errors.aboutUs}
          {...register('aboutUs')}
        />
        <FieldError message={errors.aboutUs?.message} />
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="acceptsShipping"
          checked={acceptsShipping}
          onCheckedChange={(checked) => setValue('acceptsShipping', checked)}
        />
        <Label htmlFor="acceptsShipping">Acepta envíos</Label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="primaryColor">Color primario</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setValue('primaryColor', e.target.value)}
              className="h-9 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5"
            />
            <Input
              id="primaryColor"
              aria-invalid={!!errors.primaryColor}
              {...register('primaryColor')}
            />
          </div>
          <FieldError message={errors.primaryColor?.message} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="secondaryColor">Color secundario</Label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setValue('secondaryColor', e.target.value)}
              className="h-9 w-10 cursor-pointer rounded border border-input bg-transparent p-0.5"
            />
            <Input
              id="secondaryColor"
              aria-invalid={!!errors.secondaryColor}
              {...register('secondaryColor')}
            />
          </div>
          <FieldError message={errors.secondaryColor?.message} />
        </div>
      </div>

      {apiError && <p className="text-xs text-destructive">{apiError}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          Atrás
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando…' : 'Registrarse'}
        </Button>
      </div>
    </form>
  );
}
