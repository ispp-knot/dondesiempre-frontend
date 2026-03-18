'use client';
import HorizontalScroll from '@/components/dondeSiempre/HorizontalScroll';

type Collection = {
  id: number;
  name: string;
  image: string;
};

type Props = {
  storeId?: string;
  collections?: Collection[];
};

// collections.tsx
export default function Collections({ storeId, collections = [] }: Props) {
  return (
    <HorizontalScroll title="Nuestras colecciones" viewMoreHref={`/stores/${storeId}/collections`}>
      {collections.map((col) => (
        <div
          key={col.id}
          className="flex flex-col shrink-0 border-2 border-gray-200 w-[45%] md:w-1/4 h-40 sm:h-60 bg-cover bg-center justify-end rounded-lg shadow-sm"
          style={{
            backgroundImage: `url(${col.image || `/static/img/collection_placeholder_${col.id}.jpg`})`,
          }}
        >
          <div className="flex flex-col items-center justify-center gap-2 w-full h-4/12 md:h-1/4 self-end bg-white text-sm sm:text-lg px-4 text-center">
            {col.name}
          </div>
        </div>
      ))}
    </HorizontalScroll>
  );
}
