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
      className="relative flex flex-row items-center p-4 md:p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
    >
      <div className="relative w-16 h-16 md:w-32 md:h-32 rounded-xl md:rounded-2xl overflow-hidden bg-gray-100 mr-4 md:mr-8 flex-shrink-0">
        {store.storefront?.bannerImageUrl ? (
          <Image
            src={store.storefront.bannerImageUrl}
            alt={store.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
            <HiOutlineLocationMarker className="w-8 h-8 md:w-16 md:h-16" />
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1 md:mb-2">
          <h3 className="text-lg md:text-3xl font-bold text-dark-blue group-hover:text-primary transition-colors pr-10 truncate">
            {store.name}
          </h3>
          {store.hasActivePromotions && (
            <div className="absolute top-4 right-4 md:top-8 md:right-8 text-primary bg-primary/10 p-1.5 md:p-2.5 rounded-full shadow-sm">
              <BadgePercent className="w-5 h-5 md:w-8 md:h-8" />
            </div>
          )}
        </div>
        <p className="text-sm md:text-lg text-gray-500 line-clamp-1 md:line-clamp-2 mb-2 md:mb-4">
          {store.address}
        </p>
        {store.distance !== undefined && store.distance !== null && (
          <div className="flex items-center mt-auto">
            <span className="text-xs md:text-base font-semibold bg-secondary/10 text-secondary px-2 py-0.5 md:px-4 md:py-1 rounded-full">
              {store.distance.toFixed(1)} km
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
