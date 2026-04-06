'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

interface PremiumLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PremiumLimitDialog({ open, onOpenChange }: PremiumLimitDialogProps) {
  const router = useRouter();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Llegaste al limite de uso gratis</AlertDialogTitle>
          <AlertDialogDescription>
            Para seguir compartiendo promociones, necesitas activar Premium.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className={'bg-secondary hover:bg-secondary/90'}>Ahora no</AlertDialogAction>
          <AlertDialogAction
            onClick={() => {
              onOpenChange(false);
              router.push('/pricing');
            }}
          >
            Ver Premium
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

