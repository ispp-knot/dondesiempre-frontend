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
    <div className="flex flex-col px-5">
      <div className="flex flex-row items-center justify-between w-full">
        <h1 className="text-primary text-xl md:text-2xl font-bold">Nuestras colecciones</h1>
        <Link href="" className="text-secondary underline">
          Ver más
        </Link>
      </div>
      {/* TODO: Style collections with images */}
      <div className="flex gap-3 overflow-x-auto">
        {collections.map((col) => (
          <div key={col.id} className="">
            <span className="text-primary">{col.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
