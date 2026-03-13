'use client';

import ErrorText from '@/components/dondeSiempre/ErrorText';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import useFetcher from '@/lib/api/fetcher';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import { JSX } from 'react';

export default function FollowPage(): JSX.Element {
  const followedStores = useFetcher<StoreDTO[]>({ url: 'clients/me/following' });
  const unfollowStore = useFetcher<void>({ method: 'DELETE', fetchOnStart: false });

  if (followedStores.isLoading) {
    return <LoadingText></LoadingText>;
  }

  if (followedStores.isError) {
    return <ErrorText error={followedStores.error}></ErrorText>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">Catálogo de tiendas</h1>
        </header>

        {(!followedStores.data || followedStores.data.length === 0) && (
          <NotFoundText message="No hay tiendas que mostrar."></NotFoundText>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {followedStores.data?.map((store) => (
            <article key={store.id} className="bg-white rounded-2xl shadow p-4 flex flex-col">
              <h2 className="text-lg font-medium text-gray-800 mb-1">
                {store.name ?? 'Tienda sin nombre'}
              </h2>

              {store.address && <p className="text-sm text-gray-500 mb-3">📍 {store.address}</p>}

              <div className="mt-auto">
                {store.openingHours && (
                  <p className="text-sm text-gray-500">Horario: {store.openingHours}</p>
                )}
              </div>
              <div className="mt-2">
                {store.phone && <p className="text-sm text-gray-500">Tel: {store.phone}</p>}
              </div>
              <div className="mt-2">
                {store.email !== undefined && (
                  <p className="text-sm text-gray-500">Email: {store.email}</p>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <button
                  onClick={() => (window.location.href = `/stores/${store.id}`)}
                  className="mt-4 bg-gray-100 hover:bg-gray-200 text-green-800 py-2 px-4 rounded-md"
                >
                  Ir a la tienda
                </button>
                <button
                  onClick={async () => {
                    await unfollowStore.fetch({ newUrl: `stores/${store.id}/follow` });
                    await followedStores.fetch();
                  }}
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
