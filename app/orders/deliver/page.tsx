'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { formatDisplayPrice } from '@/lib/utils';
import { OrderDTO } from '@/lib/types/orders/orderDto';
import Image from 'next/image';
import {
  FaArrowLeft,
  FaSearch,
  FaHashtag,
  FaCalendarAlt,
  FaBox,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from 'react-icons/fa';
import { MdOutlinePayments } from 'react-icons/md';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import { usePassiveFetcher, useActiveFetcher } from '@/lib/api/fetcher';

const statusMap: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  REJECTED: 'Rechazado',
  PICKED: 'Recogido',
};

export default function DeliverOrderPage() {
  const router = useRouter();
  const [searchCode, setSearchCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { data: allOrders, isLoading: isLoadingOrders } = usePassiveFetcher<OrderDTO[]>({
    url: 'orders',
  });
  const pickFetcher = useActiveFetcher<void>({ method: 'PATCH' });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-600';
      case 'REJECTED':
        return 'bg-red-100 text-red-600';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-600';
      case 'PICKED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim() || !allOrders) return;

    setIsSearching(true);
    setSearchError(null);
    setOrder(null);

    const foundOrder = allOrders.find(
      (o) => o.orderCode.toUpperCase() === searchCode.toUpperCase()
    );

    if (foundOrder) {
      setOrder(foundOrder);
    } else {
      setSearchError('No se ha encontrado ningún pedido con ese código en tu tienda.');
    }

    setIsSearching(false);
  };

  const handlePickOrder = async () => {
    if (!order) return;

    try {
      await pickFetcher.fetch({ url: `orders/${order.id}/pick` });
      setOrder({ ...order, orderStatus: 'PICKED' });
    } catch (_err: unknown) {
      setSearchError('Hubo un error al marcar el pedido como recogido.');
    }
  };

  return (
    <div className="flex flex-col items-center pb-10">
      <div className="relative w-full h-32 overflow-hidden mb-8">
        <Image
          src="/static/img/banner.jpg"
          alt="Banner"
          fill
          className="object-cover opacity-60 grayscale"
          priority
        />
        <div className="absolute inset-0 bg-secondary/20 flex flex-col items-center justify-center pt-4">
          <h1 className="text-3xl md:text-4xl text-white font-bold drop-shadow-lg text-center px-4">
            Entregar Pedido
          </h1>
        </div>
      </div>

      <div className="w-full max-w-2xl px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors mb-6"
        >
          <FaArrowLeft /> Volver a mis ventas
        </button>

        <Card className="p-6 mb-8 shadow-md border-none bg-white">
          <h2 className="text-xl font-bold text-primary mb-4">Buscar por código de cliente</h2>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaHashtag />
              </div>
              <input
                type="text"
                placeholder="Ej. A1B2-C3D4-E5F6"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent uppercase font-mono"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || isLoadingOrders || !searchCode.trim()}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition"
            >
              <FaSearch /> {isSearching || isLoadingOrders ? 'Cargando...' : 'Buscar'}
            </button>
          </form>
          {searchError && (
            <p className="mt-4 text-red-500 font-medium text-sm text-center bg-red-50 py-2 rounded-md">
              {searchError}
            </p>
          )}
        </Card>

        {isSearching && <LoadingText />}

        {order && !isSearching && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-gray-500 mb-4 uppercase tracking-wider text-center">
              Resultado de la búsqueda
            </h3>
            <Card className="shadow-xl overflow-hidden border-none bg-white">
              <div className="bg-primary/5 px-6 py-4 border-b border-primary/10 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-primary font-bold text-lg">
                  <FaHashtag /> <span>{order.orderCode}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-secondary font-medium">
                    <FaCalendarAlt /> {new Date(order.orderDate).toLocaleDateString()}
                  </div>
                  <span
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase ${getStatusStyles(order.orderStatus)}`}
                  >
                    {order.orderStatus === 'PENDING' && <FaClock />}
                    {order.orderStatus === 'REJECTED' && <FaTimesCircle />}
                    {order.orderStatus === 'CONFIRMED' && <FaCheckCircle />}
                    {order.orderStatus === 'PICKED' && <FaBox />}
                    {statusMap[order.orderStatus] || order.orderStatus}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {item.quantity}x
                        </div>
                        <div>
                          <p className="font-bold text-primary leading-tight">{item.productName}</p>
                          <p className="text-xs text-secondary italic">
                            {formatDisplayPrice(item.priceAtPurchase)} / ud
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-primary text-lg">
                        {formatDisplayPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-dashed border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">
                      Total a cobrar/cobrado
                    </p>
                    <div className="flex items-center gap-2 text-3xl text-secondary font-black">
                      <MdOutlinePayments /> {formatDisplayPrice(order.totalPrice)}
                    </div>
                  </div>

                  <div className="w-full sm:w-auto">
                    {order.orderStatus === 'CONFIRMED' ? (
                      <button
                        onClick={handlePickOrder}
                        disabled={pickFetcher.isPending}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-800 hover:bg-green-900 disabled:opacity-50 text-white px-8 py-4 rounded-lg font-bold transition shadow-lg text-lg"
                      >
                        <FaBox />{' '}
                        {pickFetcher.isPending ? 'Marcando...' : 'Entregar y Marcar Recogido'}
                      </button>
                    ) : (
                      <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-500 text-sm">
                        {order.orderStatus === 'PICKED'
                          ? 'Este pedido ya ha sido entregado.'
                          : 'Solo se pueden entregar pedidos "Confirmados".'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
