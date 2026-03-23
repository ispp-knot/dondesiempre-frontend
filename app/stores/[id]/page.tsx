'use client';

export const dynamic = 'force-dynamic';
import { useState } from 'react';

import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import { StoreSocialNetworkDTO } from '@/lib/types/stores/storesSocialDto';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
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
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthContext';
import { Edit2 } from 'lucide-react';
import StoreEditModal from './store-edit-modal';
import StoreSocialNetworksModal from './store-social-edit-modal';

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

  const isOwner = !!user?.store?.id && user.store.id === params.id;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

  const isFollowing = usePassiveFetcher<{ isFollowing: boolean }>({
    url: `stores/${params.id}/follow`,
    enabled: !!user,
  });
  const followStore = useActiveFetcher<void>({
    url: `stores/${params.id}/followers`,
    method: 'POST',
  });
  const unfollowStore = useActiveFetcher<void>({
    url: `stores/${params.id}/follow`,
    method: 'DELETE',
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

  const socialNetworks: Array<StoreSocialNetworkDTO> = store.data?.socialNetworks || [];
  const primaryColor = store.data?.storefront?.primaryColor || '#000000';
  const secondaryColor = store.data?.storefront?.secondaryColor || '#000000';
  const banner = store.data?.storefront?.bannerImageUrl;

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
      </div>

      <div className="w-full mt-5 text-center text-3xl md:text-5xl text-[var(--primary)] font-bold">
        {store.data.name}
        {isOwner && (
          <button type="button" onClick={() => setIsEditOpen(true)}>
            <Edit2 className="w-8 h-8  text-teal-700 ml-3 " />
          </button>
        )}
      </div>

      <div className="flex flex-row w-full mt-2 items-center justify-center gap-1 sm:text-lg md:text-xl text-[var(--secondary)]">
        <FaLocationDot />
        {store.data.address}
      </div>

      <div className="flex flex-row w-full mt-2 items-center justify-center gap-1 sm:text-lg md:text-xl text-[var(--secondary)]">
        {store.data.phone}
      </div>

      <div className="flex flex-row w-full mt-2 items-center justify-center gap-1 sm:text-lg md:text-xl text-[var(--secondary)]">
        <MdAccessTimeFilled />
        {store.data.openingHours}
      </div>

      <div className="flex gap-3 mt-3 flex-wrap justify-center mb-2">
        {!!user && (
          <Button
            variant="outline"
            className="flex items-center w-fit gap-1.5 border border-primary rounded-sm px-3 py-1.5 text-xs text-primary hover:bg-primary hover:text-white transition"
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
          >
            {isFollowing.data?.isFollowing ? 'Dejar de seguir' : '+ Seguir'}
          </Button>
        )}
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
        <Button
          type="button"
          className="mx-auto flex w-fit rounded-md bg-teal-700 text-white font-medium hover:opacity-90"
          onClick={() => setIsSocialModalOpen(true)}
        >
          Editar redes
        </Button>
      )}

      <StoreTabs
        store={store.data}
        description={store.data?.aboutUs || ''}
        outfits={outfits.data}
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
