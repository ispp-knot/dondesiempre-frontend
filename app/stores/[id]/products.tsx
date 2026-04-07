'use client';
import ProductCard from '@/components/dondeSiempre/ProductCard';
import { usePassiveFetcher } from '@/lib/api/fetcher';
import { useAuth } from '@/lib/auth/AuthContext';
import { ProductDTO } from '@/lib/types/products/productsDto';
import Link from 'next/link';
import { IoMdAddCircleOutline } from 'react-icons/io';

type Props = {
  storeId?: string;
  products?: ProductDTO[];
};

export default function Products({ storeId = undefined }: Readonly<Props>) {
  const products = usePassiveFetcher<ProductDTO[]>({ url: `stores/${storeId}/products` });

  const { getCurrentUser } = useAuth();

  const user = getCurrentUser();
  const isStore = user?.roles.includes('STORE') ?? false;
  const isStoreOwner = (user?.store && user?.store.id === storeId) ?? false;

  return (
    <div className="flex flex-col px-5 sm:w-10/12">
      <div className="flex flex-row items-center justify-between w-full mb-4">
        <h1 className="text-primary text-xl md:text-2xl font-bold">Nuestros productos</h1>
        {isStore && isStoreOwner && (
          <Link
            href={`/stores/${storeId}/create-product/`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-dark-secondary text-white font-bold text-sm whitespace-nowrap"
          >
            <IoMdAddCircleOutline className="text-lg shrink-0" />
            <span className="hidden sm:inline">Crear producto</span>
            <span className="sm:hidden">Crear</span>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4">
        {products.data?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
