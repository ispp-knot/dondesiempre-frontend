import Link from 'next/link';

type Outfit = {
  id: number;
  name: string;
  image: string;
};

type Props = {
  outfits?: Outfit[];
};

export default function Collections({ outfits = [] }: Props) {
  return (
    <div className="flex flex-col px-5 sm:w-10/12">
      <div className="flex flex-row items-center justify-between w-full mb-4">
        <h1 className="text-primary text-xl md:text-2xl font-bold">Nuestros conjuntos</h1>
        <Link href="" className="text-secondary underline">
          Ver más
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 storefront-listing">
        {outfits.slice(0, 4).map((out) => (
          <div
            key={out.id}
            className="flex flex-col border-2 border-gray-200 w-full h-60 sm:h-80 bg-cover bg-center justify-end rounded-lg shadow-sm"
            style={{
              backgroundImage: `url(${out.image || `/static/img/outfit_placeholder_${out.id}.jpg`})`,
            }}
          >
            <div
              className="flex flex-col items-center justify-center gap-2 w-full h-1/4 md:h-2/12 self-end bg-white
            text-sm md:text-lg px-4 text-center"
            >
              {out.name}
            </div>
          </div>
        ))}
      </div>
      {/* style={{ backgroundImage: `url(${col.image})` }} */}
      {/* TODO: Style collections with images */}
    </div>
  );
}
