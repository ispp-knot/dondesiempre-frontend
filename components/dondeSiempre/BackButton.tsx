'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  return (
    <div className={`w-full flex justify-start ${className}`}>
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors p-0 h-auto"
      >
        <ChevronLeft className="w-5 h-5" />
        Volver atrás
      </Button>
    </div>
  );
}
