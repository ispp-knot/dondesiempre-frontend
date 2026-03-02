'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { MdAccessTimeFilled } from 'react-icons/md';
import StoreTabs from './store-tabs';
import { useQuery } from '@tanstack/react-query';
import { getOutfitsOfStorefront } from '@/lib/api/outfitEndpoints';
import { useEffect, useState } from 'react';

type Shop = {
  id: string | number;
  name: string;
  email: string;
  storeID: string | number;
  openingHours: string;
  phone: string;
  acceptsShipping: boolean;
  latitude: number;
  longitude: number;
  address: string;
  [key: string]: any;
};

export default function StorefrontPage() {
  const params = useParams<{ id: string }>();
  const storefrontId = params.id;
  const [followed, setFollowed] = useState<boolean>(false);

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

  function isStoreFollowed() {
    fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/clients/me/followed-stores')
      .then(async (res) => {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.items ?? [];
        list.forEach((store: Shop) => {
          if (store.id === storefrontId) {
            setFollowed(true);
          }});
      })
      .catch((e) => {
        console.error(e);
        setFollowed(false);
      });
  }

  useEffect(() => {
    isStoreFollowed();
  }, [storefrontId]);

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
        {followed ? (
          <button
            onClick={() => fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/stores/' + storefrontId + '/followers/me', { method: 'DELETE' }).then(() => setFollowed(false))}
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
        </button>) : (
          <button
            onClick={() => fetch(process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/stores/' + storefrontId + '/followers', { method: 'POST' }).then(() => setFollowed(true))}
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
        </button>)}
      </div>
      <div className="w-full mt-5 flex items-center justify-center gap-4">
        <h1 className="text-3xl md:text-5xl text-secondary font-bold">
          {store.name}
        </h1>
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
