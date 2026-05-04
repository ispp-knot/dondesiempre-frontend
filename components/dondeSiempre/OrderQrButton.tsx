// components/dondeSiempre/OrderQrButton.tsx
'use client';
import { useState } from 'react';
import { usePassiveFetcher } from '@/lib/api/fetcher';
import { FaQrcode, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

interface OrderQrButtonProps {
  orderCode: string;
}

export function OrderQrButton({ orderCode }: OrderQrButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading, isError } = usePassiveFetcher<{ qr: string }>({
    url: `orders/${orderCode}/qr`,
    enabled: showModal,
  });

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 hover:shadow-lg shadow-md cursor-pointer"
      >
        <FaQrcode /> Ver QR
      </button>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-sm flex flex-col items-center gap-4 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-primary transition-colors"
            >
              <FaTimes size={18} />
            </button>

            <h3 className="text-lg font-bold text-primary">Código QR del pedido</h3>
            <p className="text-xs text-muted-foreground text-center">
              Muéstraselo a la tienda para recoger tu pedido
            </p>

            {isLoading && (
              <div className="flex flex-col items-center justify-center w-full h-screen bg-background">
                <Loader2 className="animate-spin w-12 h-12" />
              </div>
            )}

            {isError && (
              <div className="w-48 h-48 flex flex-col items-center justify-center gap-2 text-center">
                <FaQrcode size={40} className="text-muted-foreground/40" />
                <p className="text-sm font-medium text-destructive">No se pudo cargar el QR</p>
                <p className="text-xs text-muted-foreground">Inténtalo de nuevo más tarde</p>
              </div>
            )}

            {data?.qr && (
              <Image
                src={data.qr}
                alt="QR del pedido"
                width={220}
                height={220}
                className="rounded-lg"
                unoptimized
              />
            )}

            <Button size="lg" onClick={() => setShowModal(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
