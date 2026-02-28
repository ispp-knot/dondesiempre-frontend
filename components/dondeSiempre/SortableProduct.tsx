import { useSortable } from '@dnd-kit/react/sortable';
import { Card } from '../ui/card';
import { Product } from '@/lib/types/products';
import { IoIosCloseCircle } from 'react-icons/io';
import { Key } from 'react';
import { OutfitProduct } from '@/lib/types/outfits';
import { convertPrice } from '@/lib/utils';

export type SortableProductProps = {
  key: Key;
  index: number;
  product: Product | OutfitProduct;
  removable: boolean;
  onClick: () => void;
};

export default function SortableProduct(props: SortableProductProps) {
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
        <img
          src={props.product.image || undefined}
          alt={'Imagen de producto'}
          className="w-30 md:w-50 aspect-square object-cover shrink-0 rounded-lg shadow-lg"
        ></img>
        <h1 className="mb-1 font-bold text-center text-md">
          {`${convertPrice(props.product.priceInCents).toFixed(2).toString().replace('.', ',')}€`}
        </h1>
      </Card>
    </div>
  );
}
