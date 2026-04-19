'use client';

import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FaQrcode } from 'react-icons/fa';

interface QrScannerModalProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function QrScannerModal({ onScan, onClose }: QrScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    const startScanner = (facingMode: ConstrainDOMString) =>
      scanner.start(
        { facingMode },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          if (isRunningRef.current) {
            scanner.stop().catch(() => {});
            isRunningRef.current = false;
          }
        },
        () => {}
      );

    startScanner({ exact: 'environment' })
      .then(() => {
        isRunningRef.current = true;
      })
      .catch(() => {
        startScanner('user')
          .then(() => {
            isRunningRef.current = true;
          })
          .catch(() => {});
      });

    return () => {
      if (isRunningRef.current) {
        scanner.stop().catch(() => {});
        isRunningRef.current = false;
      }
    };
  }, [onScan]);

  const handleClose = () => {
    if (isRunningRef.current) {
      scannerRef.current?.stop().catch(() => {});
      isRunningRef.current = false;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-sm flex flex-col overflow-hidden">
        <div className="flex items-center justify-center gap-2 p-4 border-b">
          <FaQrcode className="text-primary text-xl" />
          <h3 className="text-lg font-bold">Escanear código QR</h3>
        </div>
        <div id="qr-reader" className="w-full" />
        <button
          onClick={handleClose}
          className="m-4 bg-gray-200 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
