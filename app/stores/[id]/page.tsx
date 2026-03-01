import Image from 'next/image';
import { FaLocationDot } from 'react-icons/fa6';
import { MdAccessTimeFilled } from 'react-icons/md';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import StoreTabs from './store-tabs';
import { getStore } from '@/lib/api/stores/getStore';
import { getOutfitByStoreId } from '@/lib/api/outfits/getOutfitsByStore';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StorePage({ params }: PageProps) {
  const { id } = await params;

  const storeDto = await getStore(id);
  const outfitsDto = await getOutfitByStoreId(id);

  const store = {
    name: storeDto.name,
    address: storeDto.address,
    hours: storeDto.openingHours,
    banner: storeDto.bannerImageUrl,
    instagram: '',
    facebook: '',
    description: storeDto.aboutUs,
    collections: [
      {
        id: 1,
        name: 'Veraneo',
        image: '',
      },
      {
        id: 2,
        name: 'Nuevo',
        image: '',
      },
      {
        id: 3,
        name: 'Invierno',
        image: '',
      },
      {
        id: 4,
        name: 'Feria',
        image: '',
      },
      {
        id: 5,
        name: 'Semana Santa',
        image: '',
      },
      {
        id: 6,
        name: 'Joyería',
        image: '',
      },
      {
        id: 7,
        name: 'Ropa interior',
        image: '',
      },
    ],
    outfits: outfitsDto,
    storefrontId: storeDto.storefrontId,
    primaryColor: storeDto.primaryColor,
    secondaryColor: storeDto.secondaryColor,
  };

  return (
    <div className="flex flex-col bg-white">
      <div className="relative w-full h-52 md:h-80">
        <Image
          src={store.banner || '/static/img/banner.jpg'}
          alt={`Banner de la tienda ${store.name}`}
          fill
          className="object-cover"
          priority
        />
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
        {store.hours}
      </div>
      <div className="flex gap-3 mt-3 flex-wrap justify-center mb-2">
        {store.instagram ? (
          <a
            href={`https://instagram.com/${store.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-fit gap-1.5 border border-primary rounded-sm px-3 py-1.5 text-xs text-primary hover:bg-primary hover:text-white transition"
          >
            <FaInstagram className={'w-4 h-4'} />
            <p>{store.instagram}</p>
          </a>
        ) : (
          <></>
        )}
        {store.facebook ? (
          <a
            href={`https://facebook.com/${store.facebook}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-fit gap-1.5 border border-primary rounded-sm px-2 py-1.5 text-xs sm: text-primary hover:bg-primary hover:text-white transition"
          >
            <FaFacebook className={'w-4 h-4'} />
            <p>{store.facebook}</p>
          </a>
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
}
