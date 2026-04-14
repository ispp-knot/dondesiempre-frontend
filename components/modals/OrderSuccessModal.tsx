import Link from 'next/link';
import { Button } from '../ui/button';
import { buttonLinkClass } from '@/lib/utils/buttonLinkClass';

interface OrderSuccessModalProps {
  setOpenModal: (open: boolean) => void;
}

export default function OrderSuccessModal({ setOpenModal }: OrderSuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-background p-8 rounded-lg shadow-xl flex flex-col items-center gap-6 max-w-md w-full"
        data-testid="order-success-modal"
      >
        <h2 className="text-2xl font-bold text-primary text-center">¡Pedido creado con éxito!</h2>
        <p className="text-secondary text-center">¿Qué te gustaría hacer ahora?</p>
        <div className="flex flex-col w-full gap-3">
          <Link
            href="/orders"
            className={`${buttonLinkClass} bg-secondary hover:bg-dark-secondary text-white font-bold`}
          >
            Ver mis pedidos
          </Link>
          <Button
            onClick={() => setOpenModal(false)}
            variant="outline"
            className="w-full font-bold"
          >
            Seguir explorando
          </Button>
        </div>
      </div>
    </div>
  );
}
