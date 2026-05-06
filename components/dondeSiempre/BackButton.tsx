import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  text?: string;
  onAction?: () => void;
  variant?: 'default' | 'ghost';
}

export const BackButton: React.FC<BackButtonProps> = ({
  text = 'Volver atrás',
  onAction,
  variant = 'default',
}) => {
  const router = useRouter();

  const handleBack = () => {
    let wentBack = false;
    window.addEventListener(
      'popstate',
      () => {
        wentBack = true;
      },
      { once: true }
    );

    if (onAction) onAction();
    else {
      router.back();
      setTimeout(() => {
        if (!wentBack) router.push('/');
      }, 100);
    }
  };

  if (variant === 'ghost') {
    return (
      <button
        onClick={handleBack}
        className="flex items-center text-gray-500 hover:text-secondary transition-colors mt-2 text-sm font-semibold cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        {text}
      </button>
    );
  }

  return (
    <Button size="lg" className="mt-2" onClick={handleBack}>
      {text}
    </Button>
  );
};
