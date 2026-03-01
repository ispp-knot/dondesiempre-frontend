import { OutfitProduct } from '@/lib/types/outfits';
import { Product } from '@/lib/types/products';
import { convertPrice } from '@/lib/utils';
import { useSortable } from '@dnd-kit/react/sortable';
import { IoIosCloseCircle } from 'react-icons/io';
import { Card } from '../ui/card';
import Image from 'next/image';

export type SortableProductProps = {
  index: number;
  product: Product | OutfitProduct;
  removable: boolean;
  onClick: () => void;
};

export default function SortableProduct(props: Readonly<SortableProductProps>) {
  const { ref } = useSortable({ id: props.product.id, index: props.index });

  return (
    <div ref={ref} className="inline-block relative">
      <Card className="p-2 gap-2 shrink-0">
        {props.removable && (
          <IoIosCloseCircle
            onClick={props.onClick}
            className="text-2xl text-secondary hover:text-dark-secondary"
          />
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
