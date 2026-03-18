'use client';

import { HiOutlineLocationMarker } from 'react-icons/hi';
import { BadgePercent } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { StoreDTO } from '@/lib/types/stores/storesDto';

interface StoreListItemProps {
  store: StoreDTO;
}

export function StoreListItem({ store }: StoreListItemProps) {
  return (
    <Link
      href={`/stores/${store.id}`}
      className="relative flex flex-row items-center md:items-stretch p-4 md:p-8 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 hover:shadow-md md:hover:shadow-xl md:hover:-translate-y-1 transition-all duration-300 group"
    >
      {/* Mobile Image (Original) vs Desktop (Premium) */}
      <div className="relative w-16 h-16 md:w-44 md:h-44 rounded-xl md:rounded-3xl overflow-hidden bg-gray-100 mr-4 md:mr-10 flex-shrink-0 shadow-inner">
        {store.storefront?.bannerImageUrl ? (
          <Image
            src={store.storefront.bannerImageUrl}
            alt={store.name}
            fill
            className="object-cover group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-500 md:duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/30">
            <HiOutlineLocationMarker className="w-8 h-8 md:w-20 md:h-20" />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0 justify-center">
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-1 md:mb-3">
          <h3 className="text-lg md:text-3xl font-bold md:font-extrabold text-dark-blue group-hover:text-primary transition-colors tracking-tight pr-8 md:pr-0">
            {store.name}
          </h3>

          {/* Mobile Badge (Original) */}
          {store.hasActivePromotions && (
            <div className="md:hidden absolute top-4 right-4 text-primary bg-primary/10 p-1.5 rounded-full shadow-sm">
              <BadgePercent size={20} />
            </div>
          )}

          {/* Desktop Badge (Premium) */}
          {store.hasActivePromotions && (
            <div className="hidden md:inline-flex items-center justify-center text-primary bg-primary/10 px-3 py-1.5 rounded-full text-sm font-black tracking-wider animate-pulse-subtle border border-primary/20 whitespace-nowrap">
              <BadgePercent size={20} className="mr-1.5 flex-shrink-0" />
              <span>¡PROMOCIÓN DISPONIBLE!</span>
            </div>
          )}
        </div>

        <p className="text-sm md:text-lg text-gray-500 md:font-medium line-clamp-1 mb-1 md:mb-6">
          {store.address}
        </p>

        {store.distance !== undefined && store.distance !== null && (
          <div className="flex items-center mt-1 md:mt-0">
            {/* Mobile (Original) */}
            <span className="md:hidden text-xs font-semibold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
              {store.distance.toFixed(1)} km
            </span>

            {/* Desktop (Premium) */}
            <div className="hidden md:flex items-center text-base font-bold text-secondary bg-secondary/5 px-4 py-2 rounded-xl border border-secondary/10 shadow-sm">
              <HiOutlineLocationMarker className="mr-2 text-secondary" />
              <span>A solo {store.distance.toFixed(1)} km de distancia</span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
