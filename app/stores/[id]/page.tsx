'use client';

export const dynamic = 'force-dynamic';

import { usePassiveFetcher } from '@/lib/api/fetcher';
import { StoreDTO, StoreSocialNetworkDTO } from '@/lib/types/stores/storesDto';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { FaFacebook, FaInstagram, FaLink, FaTiktok, FaTwitter } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { MdAccessTimeFilled } from 'react-icons/md';
import StoreTabs from './store-tabs';
import LoadingText from '@/components/dondeSiempre/LoadingText';
import ErrorText from '@/components/dondeSiempre/ErrorText';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';

const getSocialIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('instagram')) return <FaInstagram className="w-4 h-4" />;
  if (lowerName.includes('facebook')) return <FaFacebook className="w-4 h-4" />;
  if (lowerName.includes('twitter') || lowerName.includes('x'))
    return <FaTwitter className="w-4 h-4" />;
  if (lowerName.includes('tiktok')) return <FaTiktok className="w-4 h-4" />;
  return <FaLink className="w-4 h-4" />;
};

export default function StorePage() {
  const params = useParams<{ id: string }>();

  const store = usePassiveFetcher<StoreDTO>({ url: `stores/${params.id}` });
  const outfits = usePassiveFetcher<OutfitDTO[]>({ url: `stores/${params.id}/outfits` });

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

  const collections = [
    { id: 1, name: 'Veraneo', image: '' },
    { id: 2, name: 'Nuevo', image: '' },
    { id: 3, name: 'Invierno', image: '' },
    { id: 4, name: 'Feria', image: '' },
    { id: 5, name: 'Semana Santa', image: '' },
    { id: 6, name: 'Joyería', image: '' },
    { id: 7, name: 'Ropa interior', image: '' },
  ];

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
      </div>

      <div className="flex flex-row w-full mt-2 items-center justify-center gap-1 sm:text-lg md:text-xl text-[var(--secondary)]">
        <FaLocationDot />
        {store.data.address}
      </div>

      <div className="flex flex-row w-full mt-2 items-center justify-center gap-1 sm:text-lg md:text-xl text-[var(--secondary)]">
        <MdAccessTimeFilled />
        {store.data.openingHours}
      </div>

      <div className="flex gap-3 mt-3 flex-wrap justify-center mb-2">
        {socialNetworks.map((social: StoreSocialNetworkDTO, index: number) => (
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
        ))}
      </div>

      <StoreTabs
        store={store.data}
        collections={collections}
        description={store.data?.aboutUs || ''}
        outfits={outfits.data}
      />
    </div>
  ) : (
    <NotFoundText message="No se pudo encontrar la tienda que buscabas..." />
  );
}
