'use client';

import { FaRegHeart } from 'react-icons/fa';
import { LuPackage } from 'react-icons/lu';
import { AiOutlineShop } from 'react-icons/ai';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { UserNavButton } from '@/components/dondeSiempre/UserNavButton';
import { useAuth } from '@/lib/auth/AuthContext';

export default function Navbar() {
  const [isAdmin, _setIsAdmin] = useState<boolean>(false);
  const pathname = usePathname();
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();

  const userActiveMatches = ['/profile', '/login', '/register'];
  const isUserActive = userActiveMatches.some((m) => pathname.startsWith(m));

  return (
    <>
      <div className="hidden sm:flex bg-white text-primary w-full h-0 sm:h-17.5 items-center justify-center z-20 shadow-md">
        <div className="flex flex-row items-center w-11/12 gap-10 justify-between">
          <div className="flex flex-row items-center gap-10">
            <Link href={'/search'} className="flex flex-row items-center gap-2">
              <Image src="/static/logo-svg.svg" alt="Logo" width={35} height={45} />
              <p className="text-2xl font-bold">DondeSiempre</p>
            </Link>
            {!isAdmin && (
              <div className="flex flex-row items-center gap-6 text-secondary">
                <Link href="/search">Tiendas</Link>
                <Link href="/stores">Mapa</Link>
              </div>
            )}
          </div>
          <div className="flex flex-row items-center gap-5 text-2xl font-primary">
            {isAdmin ? (
              <>
                <Link href="/orders" aria-label="Pedidos">
                  <LuPackage className="cursor-pointer" strokeWidth={1.5} />
                </Link>
                <AiOutlineShop />
              </>
            ) : (
              <>
                {user && !user?.roles.includes('STORE') && (
                  <Link href="/following" aria-label="Favoritos">
                    <FaRegHeart className="cursor-pointer" />
                  </Link>
                )}
                <Link href="/orders" aria-label="Pedidos">
                  <LuPackage className="cursor-pointer" strokeWidth={1.5} />
                </Link>
                <UserNavButton isActive={isUserActive} />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
