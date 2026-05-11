'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../ui/button';

export function GenericConfirmModal({
  message,
  onConfirm,
  onClose,
  isLoading,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
}: {
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-background p-8 rounded-lg shadow-xl flex flex-col items-center gap-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-primary text-center">¿Estás seguro?</h2>
        <p className="text-secondary text-center">{message}</p>
        <div className="flex flex-col w-full gap-3">
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            data-testid="delete-button"
            className="w-full bg-secondary hover:bg-dark-secondary disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold"
          >
            {isLoading ? 'Procesando...' : confirmLabel}
          </Button>
          <Button
            onClick={onClose}
            disabled={isLoading}
            variant="outline"
            className="w-full font-bold"
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
