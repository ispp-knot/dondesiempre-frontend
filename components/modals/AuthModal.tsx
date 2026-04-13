import Link from 'next/link';
import { Button } from '../ui/button';
import { buttonLinkClass } from '@/lib/utils/buttonLinkClass';

interface AuthModalProps {
  message: string;
  setOpenModal: (open: boolean) => void;
}

export default function AuthModal({ message, setOpenModal }: AuthModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background p-8 rounded-lg shadow-xl flex flex-col items-center gap-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-primary text-center">¡Ups! No estás registrado</h2>
        <p className="text-secondary text-center">{message}</p>
        <div className="flex flex-col w-full gap-3">
          <Link
            href="/login"
            className={`${buttonLinkClass} bg-secondary hover:bg-dark-secondary text-white font-bold`}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className={`${buttonLinkClass} bg-primary hover:bg-dark-primary text-white font-bold`}
          >
            Registrarme
          </Link>
          <Button
            onClick={() => setOpenModal(false)}
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
