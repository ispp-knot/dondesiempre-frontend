'use client';
import ProductCard from '@/components/dondeSiempre/ProductCard';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import { useAuth } from '@/lib/auth/AuthContext';
import { ProductDTO } from '@/lib/types/products/productsDto';
import Link from 'next/link';
import { IoMdAddCircleOutline } from 'react-icons/io';

type Props = {
  storeId?: string;
  products?: ProductDTO[];
};

export default function Products({ storeId = undefined, products = [] }: Readonly<Props>) {
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:scale-105 transition-transform text-white font-bold text-sm whitespace-nowrap"
          >
            <IoMdAddCircleOutline className="text-lg shrink-0" />
            <span className="hidden sm:inline">Crear producto</span>
            <span className="sm:hidden">Crear</span>
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4 transition-opacity duration-300 ease-in-out">
        {products && products.length > 0 ? (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        ) : (
          <div className="col-span-2 sm:col-span-4 flex justify-center py-8">
            <NotFoundText message="No se encontraron productos con tu búsqueda" />
          </div>
        )}
      </div>
    </div>
  );
}
