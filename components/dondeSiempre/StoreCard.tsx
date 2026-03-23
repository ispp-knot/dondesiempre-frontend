'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { BadgePercent, Heart } from 'lucide-react';
import { LuArrowRightToLine, LuRoute } from 'react-icons/lu';
import Image from 'next/image';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import { convertToBrightness } from '@/lib/colorUtils';
import { usePassiveFetcher, useActiveFetcher } from '@/lib/api/fetcher';
import { StoreFollowerDTO } from '@/lib/types/follows/followsDto';
import { cn } from '@/lib/utils';
import { distance } from '@/lib/geoUtils';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';

export function StoreCard({
  store,
  userLocation,
  className = '',
}: {
  store: StoreDTO;
  userLocation?: { lat: number; lng: number } | null;
  className?: string;
}) {
  const distanceToUser =
    userLocation != null
      ? distance(userLocation.lat, userLocation.lng, store.latitude, store.longitude)
      : null;
  const router = useRouter();
  const { getCurrentUser } = useAuth();
  const isLoggedIn = getCurrentUser() !== null;

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

  const toggleFollow = async () => {
    triggerHeartAnimation();
    if (isFollowing.data?.isFollowing) {
      await unfollowStore.fetch();
      isFollowing.setData({ ...isFollowing.data, isFollowing: false });
    } else if (isFollowing.data?.isFollowing === false) {
      await followStore.fetch();
      isFollowing.setData({ ...isFollowing.data, isFollowing: true });
    }
  };

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
      if (isLoggedIn) toggleFollow();
    }
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
    window.open(url, '_blank');
  };

  const handleGoToStore = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/stores/${store.id}`);
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFollow();
  };

  return (
    <Link
      href={`/stores/${store.id}`}
      onClick={handleCardClick}
      className={cn(
        'relative flex flex-row items-center md:items-stretch p-4 md:p-5 pb-12 md:pb-14 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 hover:shadow-md md:hover:shadow-xl md:hover:-translate-y-1 transition-all duration-300 group cursor-pointer',
        className
      )}
    >
      {isLoggedIn && (
        <Button
          onClick={handleFollowClick}
          className="w-7 h-7 absolute top-3 right-3 p-1.5 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-50"
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
        </Button>
      )}
      {/* Image */}
      <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-xl md:rounded-3xl overflow-hidden bg-gray-100 mr-4 sm:mr-8 flex-shrink-0 shadow-inner">
        {store.storefront?.bannerImageUrl ? (
          <Image
            src={store.storefront.bannerImageUrl}
            alt={store.name}
            fill
            className="object-cover"
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

        {distanceToUser != null && (
          <div className="flex items-center pb-2">
            <span className="md:hidden text-xs font-semibold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
              {distanceToUser.toFixed(1)} km
            </span>
            <div className="hidden md:flex items-center text-sm font-bold text-secondary bg-secondary/5 px-2 py-1 rounded-xl border border-secondary/10 shadow-sm">
              <HiOutlineLocationMarker size={17} className="mr-2 text-secondary" />
              <span>A {distanceToUser.toFixed(1)} km de distancia</span>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons — bottom right, icon only */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2">
        <Button
          onClick={handleDirections}
          className="p-1.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
          title="Cómo llegar"
        >
          <p className={'hidden sm:block'}>Cómo llegar</p>
          <LuRoute size={24} />
        </Button>

        <Button
          onClick={handleGoToStore}
          className="p-1.5 rounded-lg transition-colors bg-(--primary-color)/10 hover:bg-(--primary-color)/20 text-(--primary-color)"
          style={
            {
              '--primary-color': convertToBrightness(store.storefront.primaryColor, 30),
            } as React.CSSProperties
          }
          title="Ir a la tienda"
        >
          <p className={'hidden sm:block'}>Ir a la tienda</p>
          <LuArrowRightToLine size={24} />
        </Button>
      </div>
    </Link>
  );
}
