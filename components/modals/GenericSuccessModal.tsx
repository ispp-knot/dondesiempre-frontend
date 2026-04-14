import { Button } from '../ui/button';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

interface GenericSuccessModalProps {
  setOpenModal: (open: boolean) => void;
  title?: string;
  description?: string;
  onClose?: () => void;
  buttonLabel?: string;
}

export default function GenericSuccessModal({
  setOpenModal,
  title = '¡Acción exitosa!',
  description = 'Pulse en cerrar para continuar.',
  onClose,
  buttonLabel = 'Cerrar',
}: GenericSuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl flex flex-col items-center gap-4 w-full max-w-md relative p-6 sm:p-8">
        <button
          onClick={() => setOpenModal(false)}
          className="absolute top-3 right-3 text-muted-foreground hover:text-primary transition-colors"
        >
          <FaTimes size={18} />
        </button>
        <FaCheckCircle className="text-green-500 text-5xl sm:text-6xl" />
        <h2 className="text-xl sm:text-2xl font-bold text-primary text-center">{title}</h2>
        <p className="text-sm sm:text-base text-center text-muted-foreground">{description}</p>
        <Button
          onClick={() => {
            setOpenModal(false);
            if (onClose) onClose();
          }}
          variant="outline"
          className="w-full font-bold"
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}
