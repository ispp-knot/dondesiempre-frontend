'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaFacebook, FaInstagram, FaTiktok, FaWhatsapp, FaTwitter } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { MdAccessTimeFilled } from 'react-icons/md';
import StoreTabs from './store-tabs';
import { useQuery } from '@tanstack/react-query';
import { getOutfitsOfStorefront } from '@/lib/api/outfitEndpoints';
import { StoreDTO } from '@/lib/api/types';
import { followStore, isFollowingStore, unfollowStore } from '@/lib/api/followEndpoints';

const SOCIAL_NETWORK_ICONS: Record<string, React.ElementType> = {
  instagram: FaInstagram,
  facebook: FaFacebook,
  tiktok: FaTiktok,
  x: FaTwitter,
  whatsapp: FaWhatsapp,
};

const COLLECTIONS = [
  { id: 1, name: 'Veraneo', image: '' },
  { id: 2, name: 'Nuevo', image: '' },
  { id: 3, name: 'Invierno', image: '' },
  { id: 4, name: 'Feria', image: '' },
  { id: 5, name: 'Semana Santa', image: '' },
  { id: 6, name: 'Joyería', image: '' },
  { id: 7, name: 'Ropa interior', image: '' },
];

export default function StoreView({ store }: { store: StoreDTO }) {
  const [followed, setFollowed] = useState<boolean>(false);
  const outfitsQuery = useQuery({
    queryKey: ['outfits', store.storefront?.id],
    queryFn: () => getOutfitsOfStorefront(store.storefront!.id),
    enabled: !!store.storefront?.id,
  });

  useEffect(() => {
    isFollowingStore(store.id).then((data) => setFollowed(data.isFollowing));
  }, [store.id]);

  return (
    <div className="flex flex-col bg-white">
      <div className="relative w-full h-52 md:h-80">
        <Image
          src={store.storefront?.bannerImageUrl || '/static/img/banner.jpg'}
          alt="Banner de la tienda"
          fill
          className="object-cover"
          priority
        />
        {followed ? (
          <button
            onClick={() => unfollowStore(store.id).then(() => setFollowed(false))}
            className="absolute top-4 right-4 md:top-6 md:right-8 
                     flex items-center gap-2 
                     bg-gray-100 
                     text-green-800 
                     px-5 py-2 
                     rounded-full 
                     shadow-sm 
                     hover:bg-gray-200 
                     transition"
          >
            <span className="font-medium">Dejar de seguir</span>
          </button>
        ) : (
          <button
            onClick={() => followStore(store.id).then(() => setFollowed(true))}
            className="absolute top-4 right-4 md:top-6 md:right-8 
                     flex items-center gap-2 
                     bg-gray-100 
                     text-green-800 
                     px-5 py-2 
                     rounded-full 
                     shadow-sm 
                     hover:bg-gray-200 
                     transition"
          >
            <span className="font-medium">+ Seguir</span>
          </button>
        )}
      </div>

      <div className={'w-full mt-5 text-center text-3xl md:text-5xl text-secondary font-bold'}>
        {store.name}
      </div>
      <div
        className={
          'flex flex-row w-full mt-2 items-center justify-center gap-1 sm:text-lg md:text-xl text-primary'
        }
      >
        <FaLocationDot />
        {store.address}
      </div>
      <div
        className={
          'flex flex-row w-full mt-2 items-center justify-center gap-1 sm:text-lg md:text-xl text-primary'
        }
      >
        <MdAccessTimeFilled />
        {store.openingHours}
      </div>
      <div className="flex gap-3 mt-3 flex-wrap justify-center mb-2">
        {store.socialNetworks?.map((sn) => {
          const Icon = SOCIAL_NETWORK_ICONS[sn.name.toLowerCase()];
          if (!Icon) return null;
          return (
            <a
              key={sn.name}
              href={sn.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-fit gap-1.5 border border-primary rounded-sm px-3 py-1.5 text-xs text-primary hover:bg-primary hover:text-white transition"
            >
              <Icon className="w-4 h-4" />
              <p>{sn.link}</p>
            </a>
          );
        })}
      </div>
      <StoreTabs
        storefrontId={store.storefront?.id}
        collections={COLLECTIONS}
        description={store.aboutUs ?? ''}
        outfits={outfitsQuery.data}
        store={store}
      />
    </div>
  );
}
