'use client';

import { JSX, useEffect, useState } from 'react';
import { StoreDTO } from '@/lib/api/types';
import { getFollowedStores, unfollowStore } from '@/lib/api/followEndpoints';

export default function FollowPage(): JSX.Element {
  const [shops, setShops] = useState<StoreDTO[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getFollowedStores()
      .then((data: StoreDTO[]) => {
        if (mounted) {
          setShops(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Error desconocido');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">Catálogo de tiendas</h1>
        </header>

        {loading && <p className="text-gray-600">Cargando tiendas…</p>}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
            Error al cargar: {error}
          </div>
        )}

        {!loading && !error && (!shops || shops.length === 0) && (
          <p className="text-gray-600">No hay tiendas para mostrar.</p>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {shops?.map((shop) => (
            <article key={shop.id} className="bg-white rounded-2xl shadow p-4 flex flex-col">
              <h2 className="text-lg font-medium text-gray-800 mb-1">
                {shop.name ?? 'Tienda sin nombre'}
              </h2>

              {shop.address && <p className="text-sm text-gray-500 mb-3">📍 {shop.address}</p>}

              <div className="mt-auto">
                {shop.openingHours && (
                  <p className="text-sm text-gray-500">Horario: {shop.openingHours}</p>
                )}
              </div>
              <div className="mt-2">
                {shop.phone && <p className="text-sm text-gray-500">Tel: {shop.phone}</p>}
              </div>
              <div className="mt-2">
                {shop.email !== undefined && (
                  <p className="text-sm text-gray-500">Email: {shop.email}</p>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <button
                  onClick={() => (window.location.href = `/storefront/${shop.id}`)}
                  className="mt-4 bg-gray-100 hover:bg-gray-200 text-green-800 py-2 px-4 rounded-md"
                >
                  Ir a la tienda
                </button>
                <button
                  onClick={() =>
                    unfollowStore(shop.id).then(() => {
                      window.location.reload();
                    })
                  }
                  className="mt-4 bg-gray-100 hover:bg-gray-200 text-green-800 py-2 px-4 rounded-md"
                >
                  Dejar de seguir
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
