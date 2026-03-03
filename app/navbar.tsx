'use client';

import { FaRegUser, FaRegHeart } from 'react-icons/fa';
import { LuPackage } from 'react-icons/lu';
import { AiOutlineShop } from 'react-icons/ai';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const [isAdmin, _setIsAdmin] = useState<boolean>(false);
  return (
    <>
      <div className="hidden sm:flex bg-white text-primary w-full h-0 sm:h-17.5 items-center justify-center z-20 shadow-md">
        <div className="flex flex-row items-center w-11/12 gap-10 justify-between">
          <div className="flex flex-row items-center gap-10">
            <Link href={'/'} className="flex flex-row items-center gap-2">
              <Image src="/static/logo-svg.svg" alt="Logo" width={35} height={45} />
              <p className="text-2xl font-bold">DondeSiempre</p>
            </Link>
            {!isAdmin && (
              <div className="flex flex-row items-center gap-6 text-secondary">
                <Link href="/search">Búsqueda</Link>
                <Link href="/stores">Mapa</Link>
              </div>
            )}
          </div>
          <div className="flex flex-row items-center gap-5 text-2xl font-primary">
            {!isAdmin && (
              <>
                <FaRegHeart
                  className="cursor-pointer"
                  onClick={() => (window.location.href = '/following')}
                />
                <LuPackage
                  className="cursor-pointer"
                  onClick={() => (window.location.href = '/deliveries')}
                />
                <FaRegUser
                  className="cursor-pointer"
                  onClick={() => (window.location.href = '/profile')}
                />
              </>
            )}
            {isAdmin && (
              <>
                <LuPackage
                  className="cursor-pointer"
                  onClick={() => (window.location.href = '/deliveries')}
                />
                <AiOutlineShop />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
