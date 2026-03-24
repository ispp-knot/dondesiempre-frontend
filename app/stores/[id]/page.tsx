'use client';

export const dynamic = 'force-dynamic';
import { useState } from 'react';

import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import { StoreSocialNetworkDTO } from '@/lib/types/stores/storesSocialDto';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { hasMinimumOutfitProducts } from '@/lib/types/outfits/outfitsRules';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  FaFacebook,
  FaHome,
  FaInstagram,
  FaLink,
  FaPhoneAlt,
  FaTiktok,
  FaTwitter,
} from 'react-icons/fa';
import { FaLocationDot, FaWhatsapp } from 'react-icons/fa6';
import { MdAccessTimeFilled } from 'react-icons/md';
import StoreTabs from './store-tabs';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import ErrorText from '@/components/dondeSiempre/ErrorText';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { useAuth } from '@/lib/auth/AuthContext';
import { Edit2, Heart } from 'lucide-react';
import StoreEditModal from './store-edit-modal';
import StoreSocialNetworksModal from './store-social-edit-modal';
import { Button } from '@/components/ui/button';
import { PromotionDTO } from '@/lib/types/promotions/promotionsDto';

const getSocialIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('instagram')) return <FaInstagram className="w-4 h-4" />;
  if (lowerName.includes('facebook')) return <FaFacebook className="w-4 h-4" />;
  if (lowerName.includes('twitter') || lowerName.includes('x'))
    return <FaTwitter className="w-4 h-4" />;
  if (lowerName.includes('tiktok')) return <FaTiktok className="w-4 h-4" />;
  if (lowerName.includes('web')) return <FaHome className="w-4 h-4" />;
  if (lowerName.includes('teléfono')) return <FaPhoneAlt className="w-4 h-4" />;
  if (lowerName.includes('whatsapp')) return <FaWhatsapp className="w-4 h-4" />;
  return <FaLink className="w-4 h-4" />;
};

export default function StorePage() {
  const params = useParams<{ id: string }>();
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();
  const outfits = usePassiveFetcher<OutfitDTO[]>({ url: `stores/${params.id}/outfits` });
  const store = usePassiveFetcher<StoreDTO>({ url: `stores/${params.id}` });

  const isClient = Boolean(user?.client);

  const isOwner = !!user?.store?.id && user.store.id === params.id;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

  const isFollowing = usePassiveFetcher<{ isFollowing: boolean }>({
    url: `stores/${params.id}/follow`,
    enabled: !!user,
  });
  const followStore = useActiveFetcher<void>({
    url: `stores/${params.id}/follow`,
    method: 'POST',
  });
  const unfollowStore = useActiveFetcher<void>({
    url: `stores/${params.id}/follow`,
    method: 'DELETE',
  });
  const promotionsDto = usePassiveFetcher<PromotionDTO[]>({
    url: `stores/${params.id}/promotions`,
  });

  if (store.isLoading || outfits.isLoading) {
    return <LoadingText />;
  } else if (store.isError || outfits.isError) {
    return (
      <>
        <ErrorText error={store.error} />
        <ErrorText error={outfits.error} />
      </>
    );
  }

  const promotionData: PromotionDTO[] = promotionsDto.data || [];
  const socialNetworks: Array<StoreSocialNetworkDTO> = store.data?.socialNetworks || [];
  const primaryColor = store.data?.storefront?.primaryColor || '#000000';
  const secondaryColor = store.data?.storefront?.secondaryColor || '#000000';
  const banner = store.data?.storefront?.bannerImageUrl;
  const validOutfits = (outfits.data ?? []).filter(hasMinimumOutfitProducts);

  return store.data && outfits.data ? (
    <div
      className="flex flex-col bg-white"
      style={
        {
          '--primary': primaryColor,
          '--secondary': secondaryColor,
        } as React.CSSProperties
      }
    >
      <div className="relative w-full h-52 md:h-80">
        <Image
          src={banner || '/static/img/banner.jpg'}
          alt=""
          fill
          className="object-cover"
          priority
          unoptimized
        />

        {isClient ? (
          <Button
            type="button"
            disabled={isFollowing.isLoading || followStore.isPending || unfollowStore.isPending}
            onClick={async () => {
              if (isFollowing.data?.isFollowing) {
                await unfollowStore.fetch();
                isFollowing.setData({ isFollowing: false });
              } else {
                await followStore.fetch();
                isFollowing.setData({ isFollowing: true });
              }
            }}
            style={{ '--primary': primaryColor } as React.CSSProperties}
            className={`
              absolute top-4 right-4 z-10
              flex items-center justify-center gap-2
              px-3 py-2.5 md:px-5 md:py-2.5 rounded-full
              w-11 h-11 md:w-36 md:h-auto aspect-square md:aspect-auto
              text-sm font-bold shadow-lg bg-white
              border-2 border-[var(--primary)] text-[var(--primary)]
              hover:bg-[var(--primary)] hover:text-white
              transition-all duration-200 disabled:opacity-50
              active:scale-95 hover:shadow-xl
            `}
          >
            <Heart
              size={16}
              className={`flex-shrink-0 transition-colors duration-200 ${
                isFollowing.data?.isFollowing ? 'fill-current' : ''
              }`}
            />
            <span className="hidden md:inline">
              {isFollowing.data?.isFollowing ? 'Siguiendo' : 'Seguir'}
            </span>
          </Button>
        ) : undefined}
      </div>

      <div className="flex flex-col items-center gap-2 mt-5 px-4">
        <div className="text-center text-3xl md:text-5xl text-[var(--primary)] font-bold">
          {store.data.name}
        </div>

        <div className="flex items-start justify-center gap-1 sm:text-lg md:text-xl text-[var(--secondary)]">
          <FaLocationDot className="flex-shrink-0 mt-1" />
          <span className="text-center">{store.data.address}</span>
        </div>

        <div className="sm:text-lg md:text-xl text-[var(--secondary)]">{store.data.phone}</div>

        <div className="flex items-start justify-center gap-1 sm:text-lg md:text-xl text-[var(--secondary)]">
          <MdAccessTimeFilled className="flex-shrink-0 mt-1" />
          <span className="text-center">{store.data.openingHours}</span>
        </div>
      </div>

      <div className="flex gap-3 mt-3 flex-wrap justify-center mb-2">
        {socialNetworks.map((social: StoreSocialNetworkDTO) => (
          <a
            key={social.id}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-fit gap-1.5 border border-[var(--primary)] rounded-sm px-3 py-1.5 text-xs text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition"
          >
            {getSocialIcon(social.name)}
            <p>{social.name}</p>
          </a>
        ))}
      </div>

      {isOwner && (
        <div className="flex justify-center gap-3 mt-3 mb-2">
          <Button type="button" onClick={() => setIsEditOpen(true)}>
            <Edit2 className="w-5 h-5" />
            Editar tienda
          </Button>
          <Button type="button" onClick={() => setIsSocialModalOpen(true)}>
            <Edit2 className="w-5 h-5" />
            Editar redes
          </Button>
        </div>
      )}

      <StoreTabs
        store={store.data}
        description={store.data?.aboutUs || ''}
        promotions={promotionData}
        outfits={validOutfits}
        isOwner={isOwner}
      />

      {isOwner && (
        <StoreEditModal
          open={isEditOpen}
          close={setIsEditOpen}
          store={store.data}
          storeId={params.id}
          onUpdated={(updatedStore) => {
            store.setData(updatedStore);
          }}
        />
      )}
      {isOwner && (
        <StoreSocialNetworksModal
          open={isSocialModalOpen}
          onOpenChange={setIsSocialModalOpen}
          storeId={params.id}
          socialNetworks={socialNetworks}
          onUpdated={(updated) => {
            store.setData({
              ...store.data,
              socialNetworks: updated,
            });
          }}
        />
      )}
    </div>
  ) : (
    <NotFoundText message="No se pudo encontrar la tienda que buscabas..." />
  );
}
