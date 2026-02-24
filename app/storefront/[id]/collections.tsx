import Link from 'next/link';

type Collection = {
  id: number;
  name: string;
  image: string;
};

type Props = {
  collections?: Collection[];
};

export default function Collections({ collections = [] }: Props) {
  return (
    <div className="flex flex-col px-5 sm:w-10/12">
      <div className="flex flex-row items-center justify-between w-full mb-4">
        <h1 className="text-primary text-xl md:text-2xl font-bold">Nuestras colecciones</h1>
        <Link href="" className="text-secondary underline">
          Ver más
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 storefront-listing">
        {collections.slice(0, 4).map((col) => (
          <div
            key={col.id}
            className="flex flex-col border-2 border-gray-200 w-full h-40 sm:h-60 bg-cover bg-center justify-end rounded-lg shadow-sm"
            style={{
              backgroundImage: `url(${col.image || `/static/img/collection_placeholder_${col.id}.jpg`})`,
            }}
          >
            <div
              className="flex flex-col items-center justify-center gap-2 w-full h-4/12 md:h-1/4 self-end bg-white
            text-sm sm:text-lg px-4 text-center"
            >
              {col.name}
            </div>
          </div>
        ))}
      </div>
      {/* style={{ backgroundImage: `url(${col.image})` }} */}
      {/* TODO: Style collections with images */}
    </div>
  );
}
