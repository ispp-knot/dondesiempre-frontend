import { OutfitProductDTO } from '@/lib/types/outfits/outfitsDto';
import { ProductDTO } from '@/lib/types/products/productsDto';
import { convertPrice } from '@/lib/utils';
import { useSortable } from '@dnd-kit/react/sortable';
import { IoIosCloseCircle } from 'react-icons/io';
import { Card } from '../ui/card';
import Image from 'next/image';

export type SortableProductProps = {
  index: number;
  product: ProductDTO | OutfitProductDTO;
  removable: boolean;
  onClick: () => void;
};

export default function SortableProduct(props: Readonly<SortableProductProps>) {
  const { ref } = useSortable({ id: props.product.id, index: props.index });

  return (
    <div ref={ref} className="relative inline-block">
      <Card className="gap-2 p-2 shrink-0">
        {props.removable && (
          <button
            type="button"
            aria-label={`Quitar ${props.product.name} del outfit`}
            onClick={props.onClick}
            className="absolute -right-2 -top-2 z-10 rounded-full bg-background text-secondary shadow-sm transition-colors hover:cursor-pointer hover:text-dark-secondary"
          >
            <IoIosCloseCircle className="text-3xl" />
          </button>
        )}
        <Image
          src={props.product.image || '/static/img/product_placeholder.png'}
          alt={props.product.name}
          width={1024}
          height={1024}
          className="w-30 md:w-50 aspect-square object-cover shrink-0 rounded-lg shadow-lg"
        ></Image>
        <h1 className="mb-1 font-bold text-center text-md">
          {`${convertPrice(props.product.priceInCents).toFixed(2).toString().replace('.', ',')}€`}
        </h1>
      </Card>
    </div>
  );
}
