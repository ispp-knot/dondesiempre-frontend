import Image from 'next/image';
import { FaLocationDot } from 'react-icons/fa6';
import { MdAccessTimeFilled } from 'react-icons/md';
import { FaFacebook, FaInstagram } from 'react-icons/fa';
import StoreTabs from './store-tabs';

export default async function StorefrontPage({
  params: _params,
}: {
  params: Promise<{ id: string }>;
}) {
  {
    /* TODO: Add request using store id */
  }
  // const { id } = await params;
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
    outfits: [
      {
        id: 1,
        name: 'Feria',
        image: '/static/img/outfit_placeholder.jpg',
        discount: 20,
      },
      {
        id: 2,
        name: 'Casual',
        image: '',
      },
      {
        id: 3,
        name: 'Semana Santa',
        image: '',
      },
      {
        id: 4,
        name: 'Frio',
        image: '',
      },
    ],
  };
  return (
    <div className="relative w-full">
      <div className="relative w-full h-52 md:h-80 overflow-hidden">
        <Image
          src="/static/img/banner.jpg"
          alt="Banner de la tienda"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="absolute top-4 right-4 w-12 h-12 sm:w-8 sm:h-8 md:w-16 md:h-16 lg:w-20 lg:h-20">
        <button className="relative w-full h-full bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition">
          <div className="relative w-1/2 h-1/2">
            <Image
              src="/icons/ChangeBanner.png"
              alt="Cambiar banner"
              fill
              className="object-contain"
            />
          </div>
        </button>
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
        <button className="ml-4 text-sm text-secondary font-medium hover:underline transition">
          <Image
            src="/icons/Edit.png"
            alt="Cambiar horario"
            width={20}
            height={20}
            className="inline-block"
          />
        </button>
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
            <button className="flex items-center justify-center w-4 h-4 ">
              <span className="text-xl leading-none hover:text-white">x</span>
            </button>
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
            <button className="flex items-center justify-center w-4 h-4 ">
              <span className="text-xl leading-none hover:text-white">x</span>
            </button>
          </a>
        ) : (
          <></>
        )}
        <button className="flex items-center justify-center w-9 h-9 border border-secondary rounded-sm text-primary hover:bg-secondary hover:text-white transition">
          <span className="text-xl leading-none text-secondary hover:text-white">+</span>
        </button>
      </div>
      <StoreTabs
        collections={store.collections}
        description={store.description}
        outfits={store.outfits}
      />
    </div>
  );
}
