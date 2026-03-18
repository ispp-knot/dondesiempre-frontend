'use client';

import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { BadgePercent, Heart } from 'lucide-react';
import { LuRoute } from 'react-icons/lu';
import Image from 'next/image';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import { convertToBrightness } from '@/lib/colorUtils';
import { usePassiveFetcher, useActiveFetcher } from '@/lib/api/fetcher';
import { StoreFollowerDTO } from '@/lib/types/follows/followsDto';
import { cn } from '@/lib/utils';

export function StoreCard({ store, className = '' }: { store: StoreDTO; className?: string }) {
  const router = useRouter();

  const clickCount = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [heartAnimating, setHeartAnimating] = useState(false);

  const isFollowing = usePassiveFetcher<StoreFollowerDTO>({ url: `stores/${store.id}/follow` });
  const followStore = useActiveFetcher<void>({
    url: `stores/${store.id}/followers`,
    method: 'POST',
  });
  const unfollowStore = useActiveFetcher<void>({
    url: `stores/${store.id}/follow`,
    method: 'DELETE',
  });

  const triggerHeartAnimation = () => {
    setHeartAnimating(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setHeartAnimating(true));
    });
  };

  const toggleFollow = useCallback(async () => {
    triggerHeartAnimation();
    if (isFollowing.data?.isFollowing) {
      await unfollowStore.fetch();
      isFollowing.setData({ ...isFollowing.data, isFollowing: false });
    } else if (isFollowing.data?.isFollowing === false) {
      await followStore.fetch();
      isFollowing.setData({ ...isFollowing.data, isFollowing: true });
    }
  }, [isFollowing, unfollowStore, followStore]);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    clickCount.current++;
    if (clickCount.current === 1) {
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0;
        router.push(`/stores/${store.id}`);
      }, 300);
    } else {
      clearTimeout(clickTimer.current);
      clickCount.current = 0;
      toggleFollow();
    }
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
    window.open(url, '_blank');
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFollow();
  };

  return (
    <a
      href={`/stores/${store.id}`}
      onClick={handleCardClick}
      className={cn(
        'relative flex flex-row items-center md:items-stretch p-4 md:p-5 pb-12 md:pb-14 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 hover:shadow-md md:hover:shadow-xl md:hover:-translate-y-1 transition-all duration-300 group cursor-pointer',
        className
      )}
    >
      {/* Image */}
      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-xl md:rounded-3xl overflow-hidden bg-gray-100 mr-8 flex-shrink-0 shadow-inner">
        {store.storefront?.bannerImageUrl ? (
          <Image
            src={store.storefront.bannerImageUrl}
            alt={store.name}
            fill
            className="object-cover group-hover:scale-105 md:group-hover:scale-110 transition-transform duration-500 md:duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/30">
            <HiOutlineLocationMarker className="w-8 h-8 md:w-14 md:h-14" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 min-w-0 justify-start">
        <div className="flex flex-col md:flex-row items-start md:gap-5 md:mb-1 justify-between">
          <h3
            className="text-md md:text-lg font-bold md:font-extrabold text-dark-blue group-hover:text-primary transition-colors tracking-tight pr-8 md:pr-0"
            style={{ color: convertToBrightness(store.storefront.primaryColor, 40) }}
          >
            {store.name}
          </h3>

          {/* Mobile Promotions Badge */}
          {store.hasActivePromotions && (
            <div className="md:hidden absolute top-4 right-4 text-primary bg-primary/10 p-1.5 rounded-full shadow-sm">
              <BadgePercent size={20} />
            </div>
          )}

          {/* Desktop Promotions Badge */}
          {store.hasActivePromotions && (
            <div className="hidden md:inline-flex items-center justify-center text-primary bg-primary/10 px-2 py-1 rounded-full text-xs font-black tracking-wider animate-pulse-subtle border border-primary/20 whitespace-nowrap">
              <BadgePercent size={17} className="mr-1.5 flex-shrink-0" />
              <span>¡PROMOCIÓN DISPONIBLE!</span>
            </div>
          )}
        </div>

        <p
          className="text-sm md:text-md font-bold line-clamp-1 md:mb-1"
          style={{ color: convertToBrightness(store.storefront.secondaryColor, 40) }}
        >
          {store.openingHours}
        </p>

        <p className="text-sm md:text-md text-gray-500 md:font-medium line-clamp-1 mb-2 md:mb-3">
          {store.address}
        </p>

        {store.distance !== undefined && store.distance !== null && (
          <div className="flex items-center">
            <span className="md:hidden text-xs font-semibold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
              {store.distance.toFixed(1)} km
            </span>
            <div className="hidden md:flex items-center text-sm font-bold text-secondary bg-secondary/5 px-2 py-1 rounded-xl border border-secondary/10 shadow-sm">
              <HiOutlineLocationMarker size={17} className="mr-2 text-secondary" />
              <span>A {store.distance.toFixed(1)} km de distancia</span>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons — bottom right, icon only */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <button
          onClick={handleDirections}
          className="p-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
          title="Cómo llegar"
        >
          <LuRoute size={24} />
        </button>

        <button
          onClick={handleFollowClick}
          className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50"
          title={isFollowing.data?.isFollowing ? 'Dejar de seguir' : 'Seguir'}
          disabled={isFollowing.isLoading}
          onAnimationEnd={() => setHeartAnimating(false)}
        >
          <Heart
            size={24}
            className={`transition-colors duration-200 ${
              isFollowing.data?.isFollowing ? 'fill-primary text-primary' : 'text-primary'
            } ${heartAnimating ? 'animate-heart-pop' : ''}`}
          />
        </button>
      </div>
    </a>
  );
}
