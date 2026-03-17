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
      className="relative flex flex-row items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
    >
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 mr-4 flex-shrink-0">
        {store.storefront?.bannerImageUrl ? (
          <Image
            src={store.storefront.bannerImageUrl}
            alt={store.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
            <HiOutlineLocationMarker size={32} />
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-dark-blue group-hover:text-primary transition-colors pr-8">
            {store.name}
          </h3>
          {store.hasActivePromotions && (
            <div className="absolute top-4 right-4 text-primary bg-primary/10 p-1.5 rounded-full shadow-sm">
              <BadgePercent size={20} />
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 line-clamp-1">{store.address}</p>
        {store.distance !== undefined && store.distance !== null && (
          <div className="flex items-center mt-1">
            <span className="text-xs font-semibold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
              {store.distance.toFixed(1)} km
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
