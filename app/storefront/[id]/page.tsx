'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { MdAccessTimeFilled } from 'react-icons/md';
import StoreTabs from './store-tabs';
import { useQuery } from '@tanstack/react-query';
import { getOutfitsOfStorefront } from '@/lib/api/outfitEndpoints';

export default function StorefrontPage() {
  const params = useParams<{ id: string }>();
  const storefrontId = params.id;

  const outfitsQuery = useQuery({
    queryKey: ['outfits', storefrontId],
    queryFn: () => getOutfitsOfStorefront(storefrontId),
  });

  const store = {
    name: 'Tu Capricho',
    address: 'Avenida La Palmera, 13',
    hours: '09:00 - 14:00 | 17:00 - 20:00',
    instagram: 'tucaprichoinsta',
    facebook: 'tucaprichofacebook',
    description:
      'Nuestra boutique se basa en una fusión del estilo urbano con toques románticos, desde prendas básicas de alta calidad hasta piezas únicas de diseñadores emergentes. \n' +
      '\n' +
      'En Tu Capricho creemos que cada pieza debe sentirse personal, por lo que cada semana renovamos nuestro stock, asegurándonos de que encuentres “justo lo que necesitabas”.',
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
    outfits: outfitsQuery.data,
  };
  return (
    <div className="flex flex-col bg-white">
      <div className="relative w-full h-52 md:h-80">
        <Image
          src="/static/img/banner.jpg"
          alt="Banner de la tienda"
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
        storefrontId={storefrontId}
        collections={store.collections}
        description={store.description}
        outfits={store.outfits}
      />
    </div>
  );
}
