import { OutfitProductDTO } from '@/lib/types/outfits/outfitsDto';
import { ProductDTO } from '@/lib/types/products/productsDto';
import { convertPrice } from '@/lib/utils';
import { useSortable } from '@dnd-kit/react/sortable';
import { IoIosCloseCircle } from 'react-icons/io';
import { MdEdit } from 'react-icons/md';
import { Card } from '../ui/card';
import Image from 'next/image';
import Link from 'next/link';

export type SortableProductProps = {
  index: number;
  product: ProductDTO | OutfitProductDTO;
  removable: boolean;
  onClick: () => void;
  isOwner?: boolean;
  storeId?: string;
};

export default function SortableProduct(props: Readonly<SortableProductProps>) {
  const { ref } = useSortable({ id: props.product.id, index: props.index });

  return (
    <div ref={ref} className="inline-block relative">
      <Card className="p-2 gap-2 shrink-0">
        <div className="flex flex-row justify-between items-start gap-1">
          {props.removable && (
            <IoIosCloseCircle
              onClick={props.onClick}
              className="text-2xl text-secondary hover:text-dark-secondary cursor-pointer"
            />
          )}
          {props.isOwner && props.storeId && (
            <Link href={`/stores/${props.storeId}/products/${props.product.id}/edit`}>
              <MdEdit className="text-2xl text-secondary hover:text-dark-secondary cursor-pointer" />
            </Link>
          )}
        </div>
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
