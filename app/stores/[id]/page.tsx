export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { FaLocationDot } from 'react-icons/fa6';
import { MdAccessTimeFilled } from 'react-icons/md';
import { FaFacebook, FaInstagram, FaTwitter, FaTiktok, FaLink } from 'react-icons/fa';
import StoreTabs from './store-tabs';
import { getStore } from '@/lib/api/stores/getStore';
import { getOutfitByStoreId } from '@/lib/api/outfits/getOutfitsByStore';

interface PageProps {
  params: Promise<{ id: string }>;
}

const getSocialIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('instagram')) return <FaInstagram className="w-4 h-4" />;
  if (lowerName.includes('facebook')) return <FaFacebook className="w-4 h-4" />;
  if (lowerName.includes('twitter') || lowerName.includes('x'))
    return <FaTwitter className="w-4 h-4" />;
  if (lowerName.includes('tiktok')) return <FaTiktok className="w-4 h-4" />;
  return <FaLink className="w-4 h-4" />;
};

export default async function StorePage({ params }: PageProps) {
  const { id } = await params;

  const storeDto = await getStore(id);
  const outfitsDto = await getOutfitByStoreId(id);

  const socialNetworks = storeDto.socialNetworks || [];

  const primaryColor = storeDto.primaryColor || '#000000';
  const secondaryColor = storeDto.secondaryColor || '#000000';

  const store = {
    name: storeDto.name,
    address: storeDto.address,
    hours: storeDto.openingHours,
    banner: storeDto.bannerImageUrl,
    description: storeDto.aboutUs,
    collections: [
      { id: 1, name: 'Veraneo', image: '' },
      { id: 2, name: 'Nuevo', image: '' },
      { id: 3, name: 'Invierno', image: '' },
      { id: 4, name: 'Feria', image: '' },
      { id: 5, name: 'Semana Santa', image: '' },
      { id: 6, name: 'Joyería', image: '' },
      { id: 7, name: 'Ropa interior', image: '' },
    ],
    outfits: outfitsDto,
    storefrontId: storeDto.storefrontId,
    primaryColor: primaryColor,
    secondaryColor: secondaryColor,
  };

  return (
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
          src={store.banner || '/static/img/banner.jpg'}
          alt={`Banner de la tienda ${store.name}`}
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>

      <div
        className={'w-full mt-5 text-center text-3xl md:text-5xl text-[var(--primary)] font-bold'}
      >
        {store.name}
      </div>

      <div
        className={
          'flex flex-row w-full mt-2 items-center justify-center gap-1 sm:text-lg md:text-xl text-[var(--secondary)]'
        }
      >
        <FaLocationDot />
        {store.address}
      </div>

      <div
        className={
          'flex flex-row w-full mt-2 items-center justify-center gap-1 sm:text-lg md:text-xl text-[var(--secondary)]'
        }
      >
        <MdAccessTimeFilled />
        {store.hours}
      </div>

      <div className="flex gap-3 mt-3 flex-wrap justify-center mb-2">
        {socialNetworks.length > 0 ? (
          socialNetworks.map((social, index) => (
            <a
              key={index}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-fit gap-1.5 border border-[var(--primary)] rounded-sm px-3 py-1.5 text-xs text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition"
            >
              {getSocialIcon(social.name)}
              <p>{social.name}</p>
            </a>
          ))
        ) : (
          <></>
        )}
      </div>

      <StoreTabs
        store={storeDto}
        collections={store.collections}
        description={store.description}
        outfits={store.outfits}
      />
    </div>
  );
'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getStoreById } from '@/lib/api/stores/getStoreById';
import StoreView from './store-view';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import ErrorText from '@/components/dondeSiempre/ErrorText';

export default function StorefrontPage() {
  const params = useParams<{ id: string }>();
  const storeId = params.id;

  const {
    data: store,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => getStoreById(storeId),
  });

  if (isLoading) {
    return <LoadingText />;
  }

  if (error || !store) {
    return <ErrorText error={error} />;
  }

  return <StoreView store={store} />;
}
