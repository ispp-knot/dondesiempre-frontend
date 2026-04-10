'use client';

import { Card } from '@/components/ui/card';
import { usePassiveFetcher, useActiveFetcher } from '@/lib/api/fetcher';
import { OrderDTO } from '@/lib/types/orders/orderDto';
import { convertPrice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import {
  FaCalendarAlt,
  FaHashtag,
  FaBox,
  FaStore,
  FaShoppingBag,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaLock,
} from 'react-icons/fa';
import { MdOutlinePayments } from 'react-icons/md';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { ErrorView } from '@/components/dondeSiempre/ErrorView';
import { PayButton } from '@/components/dondeSiempre/PayButton';

type OrderStatus = 'ALL' | 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'PICKED';

const statusMap: Record<OrderStatus, string> = {
  ALL: 'Todos',
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  REJECTED: 'Rechazado',
  PICKED: 'Recogido',
};

export interface OrderDTOExtended extends OrderDTO {
  storeName?: string;
}

interface FetcherError {
  status?: number;
  message?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();
  const isStore = user?.roles.includes('STORE') ?? false;

  const orders = usePassiveFetcher<OrderDTOExtended[]>({ url: 'orders' });
  const updateStatus = useActiveFetcher<void>({ method: 'PATCH' });
  const [filter, setFilter] = useState<OrderStatus>('ALL');

  if (orders.isLoading) return <LoadingText />;

  if (orders.isError) {
    const errorData = orders.error as FetcherError;
    if (errorData?.status === 401 || errorData?.status === 403) {
      return (
        <div className="flex flex-col items-center pb-10">
          <Banner title="Mis Pedidos" />
          <div className="max-w-xl mx-auto mt-16 text-center px-4">
            <h2 className="text-2xl md:text-3xl text-primary font-bold mb-4">
              ¡Ups! No estás registrado
            </h2>
            <p className="text-gray-500 mb-8 text-lg">
              Para poder ver tus pedidos necesitas iniciar sesión o crear una cuenta en la
              plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/login')}
                className="inline-flex justify-center items-center gap-2 bg-secondary text-white px-8 py-4 rounded-sm font-bold text-lg hover:opacity-90 transition shadow-lg w-full sm:w-auto"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => router.push('/register')}
                className="inline-flex justify-center items-center gap-2 bg-primary text-white px-8 py-4 rounded-sm font-bold text-lg hover:opacity-90 transition shadow-lg w-full sm:w-auto"
              >
                Registrarme
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <ErrorView />;
  }

  const formatDisplayPrice = (cents: number) =>
    `${convertPrice(cents).toFixed(2).replace('.', ',')}€`;

  const filteredOrders =
    orders.data?.filter((order) => (filter === 'ALL' ? true : order.orderStatus === filter)) || [];

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

  const tabClass = (status: OrderStatus) => `
    px-4 py-2 text-xs md:text-sm font-bold rounded-full transition-all border
    ${
      filter === status
        ? 'bg-primary text-white border-primary shadow-md'
        : 'bg-white text-primary border-primary/20 hover:bg-primary/5'
    }
  `;

  async function handleUpdateStatus(orderId: string, action: 'confirm' | 'reject' | 'pick') {
    await updateStatus.fetch({ url: `orders/${orderId}/${action}` });
    orders.refetch();
  }

  const renderOrderCode = (code: string) => {
    if (isStore) {
      return (
        <span className="flex items-center gap-1 text-gray-400" title="Código oculto por seguridad">
          <FaLock className="text-xs" />
          <span className="tracking-widest">****-****-****</span>
        </span>
      );
    }
    return <span>{code}</span>;
  };

  if (!orders.data || orders.data.length === 0) {
    return (
      <div className="flex flex-col items-center pb-10">
        <Banner title={isStore ? 'Gestión de Ventas' : 'Mis Pedidos'} />
        <div className="max-w-xl mx-auto mt-16 text-center px-4">
          <FaShoppingBag className="text-gray-200 w-24 h-24 mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl text-primary font-bold mb-4">
            {isStore ? 'Aún no hay ventas' : 'Aún no has hecho ningún pedido'}
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            {isStore
              ? 'Cuando los clientes compren tus productos, aparecerán aquí.'
              : '¡Parece que tu carrito está esperando una aventura!'}
          </p>
          {!isStore && (
            <Link
              href="/stores"
              className="inline-flex items-center gap-2 bg-secondary text-white px-8 py-4 rounded-sm font-bold shadow-lg"
            >
              <FaStore /> Explorar tiendas
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pb-10">
      <Banner title={isStore ? 'Gestión de Ventas' : 'Mis Pedidos'} />

      <div className="flex flex-wrap justify-center items-center gap-2 mb-8 px-4 w-full max-w-4xl">
        <div className="flex flex-wrap justify-center gap-2">
          {(['ALL', 'PENDING', 'CONFIRMED', 'PICKED', 'REJECTED'] as OrderStatus[]).map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={tabClass(s)}>
              {statusMap[s]}
            </button>
          ))}
        </div>

        {isStore && (
          <button
            onClick={() => router.push('/orders/deliver')}
            className="ml-0 md:ml-4 mt-4 md:mt-0 flex items-center gap-2 bg-secondary hover:bg-secondary/90 text-white px-5 py-2 rounded-full font-bold text-sm transition-all shadow-md"
          >
            Entregar pedido
          </button>
        )}
      </div>

      <div className="w-full md:w-8/12 px-4">
        {filteredOrders.length > 0 ? (
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="shadow-xl overflow-hidden border-none bg-white">
                <div className="bg-primary/5 px-6 py-4 border-b border-primary/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex flex-wrap items-center gap-2 text-primary font-bold">
                    <div className="flex items-center gap-2">
                      <FaHashtag />
                      {renderOrderCode(order.orderCode)}
                      {isStore && (
                        <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded ml-2 tracking-wider uppercase">
                          Venta
                        </span>
                      )}
                    </div>

                    {!isStore && order.storeName && (
                      <div className="flex items-center gap-1.5 ml-0 sm:ml-4 text-secondary text-sm font-semibold bg-white px-2 py-1 rounded-md shadow-sm border border-secondary/10">
                        <FaStore className="text-secondary/70" /> {order.storeName}
                      </div>
                    )}
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
                      {statusMap[order.orderStatus as OrderStatus]}
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
                            <p className="font-bold text-primary leading-tight">
                              {item.productName}
                            </p>
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

                  <div className="mt-8 pt-6 border-t border-dashed border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">
                        Total
                      </p>
                      <div className="flex items-center gap-2 text-3xl text-secondary font-black">
                        <MdOutlinePayments /> {formatDisplayPrice(order.totalPrice)}
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto justify-center md:justify-end">
                      {isStore && order.orderStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'confirm')}
                            className="flex-1 md:flex-none bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition"
                          >
                            <FaCheckCircle /> Confirmar
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'reject')}
                            className="flex-1 md:flex-none bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition"
                          >
                            <FaTimesCircle /> Rechazar
                          </button>
                        </>
                      )}
                      {!isStore &&
                        order.orderStatus === 'CONFIRMED' &&
                        (order.isPaid ? (
                          <div className="flex flex-col items-center gap-1 bg-green-50 text-green-800 border border-green-200 px-5 py-2.5 rounded-lg self-center md:self-auto">
                            <FaCheckCircle className="text-green-700 text-xl" />
                            <span className="text-xs font-bold uppercase tracking-wide">
                              Pagado
                            </span>
                          </div>
                        ) : (
                          <PayButton orderId={order.id} />
                        ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-xl mx-auto mt-12 text-center">
            <FaShoppingBag className="text-gray-200 w-24 h-24 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-primary">Sin resultados</h2>
            <p className="text-gray-500 mb-8">
              No hay pedidos con el estado: {statusMap[filter].toLowerCase()}
            </p>
            <button
              onClick={() => setFilter('ALL')}
              className="bg-secondary text-white px-6 py-2 rounded-sm font-bold shadow-lg"
            >
              Ver todos los pedidos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Banner({ title }: { title: string }) {
  return (
    <div className="relative w-full h-32 md:h-48 overflow-hidden mb-8">
      <Image
        src="/static/img/banner.jpg"
        alt="Banner"
        fill
        className="object-cover opacity-60 grayscale"
        priority
      />
      <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
        <h1 className="text-4xl md:text-5xl text-white font-bold drop-shadow-lg text-center px-4">
          {title}
        </h1>
      </div>
    </div>
  );
}
