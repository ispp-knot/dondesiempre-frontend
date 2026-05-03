'use client';

import { FaCheckCircle, FaBox } from 'react-icons/fa';
import Link from 'next/link';

export default function CheckoutResultPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 text-center">
      <FaCheckCircle className="text-green-500 w-16 h-16 mb-4" />
      <h1 className="text-3xl font-black text-primary mb-2">¡Pago completado!</h1>
      <p className="text-gray-500 mb-8">Tu pedido ha sido registrado correctamente.</p>

      <Link href={'/orders'} className="flex items-center gap-2">
        <FaBox /> Ver mis pedidos
      </Link>
    </div>
  );
}
