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
          <AlertDialogTitle>¡Has alcanzado el límite para tu plan!</AlertDialogTitle>
          <AlertDialogDescription>
            Únete a nuestro plan Premium para disfrutar de ventajas como esta.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction className={'bg-secondary hover:bg-secondary/90'}>
            Cerrar
          </AlertDialogAction>
          <AlertDialogAction
            onClick={() => {
              onOpenChange(false);
              router.push('/pricing');
            }}
          >
            Unirse
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
