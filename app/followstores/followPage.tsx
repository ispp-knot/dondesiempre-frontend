'use client';

import { JSX, useEffect, useState } from "react";
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/clients/me/followed-stores';


type Shop = {
  id: string | number;
  name: string;
  email: string;
  storeID: string | number;
  openingHours: string;
  phone: string;
  acceptsShipping: boolean;
  latitude: number;
  longitude: number;
  address: string;
  [key: string]: any;
};

export default function FollowPage(): JSX.Element {
  const [shops, setShops] = useState<Shop[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/clients/me/followed-stores')
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.items ?? [];
        if (mounted) setShops(list);
        console.log("Tiendas obtenidas:", list);
      })
      .catch((e) => {
        if (mounted) setError(String(e));
      })
      .finally(() => {
        if (mounted) setLoading(false);
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

        {loading && (
          <p className="text-gray-600">Cargando tiendas…</p>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">Error al cargar: {error}</div>
        )}

        {!loading && !error && (!shops || shops.length === 0) && (
          <p className="text-gray-600">No hay tiendas para mostrar.</p>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {shops?.map((shop) => (
            <article key={shop.id ?? Math.random()} className="bg-white rounded-2xl shadow p-4 flex flex-col">
              {shop.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shop.imageUrl} alt={shop.name ?? "Tienda"} className="w-full h-44 object-cover rounded-md mb-4" />
              ) : (
                <div className="w-full h-44 bg-gray-100 rounded-md mb-4 flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7h18M5 7v10a2 2 0 002 2h10a2 2 0 002-2V7M8 7v-2a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </div>
              )}

              <h2 className="text-lg font-medium text-gray-800 mb-1">{shop.name ?? shop.title ?? "Tienda sin nombre"}</h2>
              {shop.description && <p className="text-sm text-gray-600 mb-2">{shop.description}</p>}

              {shop.address && (
                <p className="text-sm text-gray-500 mb-3">📍 {shop.address}</p>
              )}

              <div className="mt-auto">
                {shop.openingHours && (
                  <p className="text-sm text-gray-500">Horario: {shop.openingHours}</p>
                )}
              </div>
              <div className="mt-2">
                {shop.phone && (
                  <p className="text-sm text-gray-500">Tel: {shop.phone}</p>
                )}
              </div>
              <div className="mt-2">
                {shop.email !== undefined && (
                  <p className="text-sm text-gray-500">Email: {shop.email}</p>
                )}
              </div>
              <div className="mt-2">
              <button 
                onClick={() => window.location.href = `/storefront/${shop.id}`}
                className="mt-4 bg-gray-100 hover:bg-gray-200 text-green-800 py-2 px-4 rounded-md">
                Ir a la tienda
            </button>
                </div>
            </article>
          ))}
        </section>

      </div>
    </main>
  );
}
