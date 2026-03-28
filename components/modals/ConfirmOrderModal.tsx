import { Button } from '../ui/button';

export function ConfirmOrderModal({
  price,
  children,
  isCreatingOrder,
  onConfirm,
  onClose,
}: {
  price: number;
  children?: React.ReactNode;
  isCreatingOrder: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background p-8 rounded-lg shadow-xl flex flex-col items-center gap-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-primary text-center">¿Confirmar pedido?</h2>
        <p className="text-secondary text-center">
          Vas a realizar un pedido por un total de{' '}
          <strong>{price.toFixed(2).toString().replace('.', ',') + '€'}</strong>.
        </p>
        {children}
        <div className="flex flex-col w-full gap-3">
          <Button
            onClick={onConfirm}
            disabled={isCreatingOrder}
            className="w-full bg-secondary hover:bg-dark-secondary disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold"
          >
            {isCreatingOrder ? 'Procesando...' : 'Confirmar pedido'}
          </Button>
          <Button
            onClick={onClose}
            disabled={isCreatingOrder}
            variant="outline"
            className="w-full font-bold"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
