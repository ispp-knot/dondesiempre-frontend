import { Button } from '../ui/button';

export function ErrorModal({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background p-8 rounded-lg shadow-xl flex flex-col items-center gap-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-destructive text-center">Error</h2>
        <p className="text-secondary text-center">{message}</p>
        <Button onClick={onClose} className="w-full font-bold">
          Cerrar
        </Button>
      </div>
    </div>
  );
}
