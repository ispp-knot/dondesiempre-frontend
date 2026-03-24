'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaRegUser, FaUser, FaRegHeart, FaHeart, FaSearch } from 'react-icons/fa';
import { RiLoginCircleLine, RiLoginCircleFill } from 'react-icons/ri';
import { IoSearch } from 'react-icons/io5';
import { HiOutlineLocationMarker, HiLocationMarker } from 'react-icons/hi';
import { BsBoxSeam, BsBoxSeamFill } from 'react-icons/bs';
import { useState } from 'react';
import { AiOutlineShop, AiFillShop } from 'react-icons/ai';
import { useAuth } from '@/lib/auth/AuthContext';

export default function NavbarBottom() {
  const pathname = usePathname();
  const [isAdmin, _setIsAdmin] = useState<boolean>(false);
  const { getCurrentUser } = useAuth();
  const user = getCurrentUser();
  const profileHref = user ? '/profile' : '/login';

  const navItemsClient: {
    href: string;
    icon: React.ReactElement;
    activeIcon: React.ReactElement;
    activeMatches?: string[];
  }[] = [
    {
      href: '/search',
      icon: <IoSearch />,
      activeIcon: <FaSearch />,
    },
    {
      href: '/following',
      icon: <FaRegHeart />,
      activeIcon: <FaHeart />,
    },
    {
      href: '/stores',
      icon: <HiOutlineLocationMarker />,
      activeIcon: <HiLocationMarker />,
    },
    {
      href: '/orders',
      icon: <BsBoxSeam />,
      activeIcon: <BsBoxSeamFill />,
    },
    {
      href: profileHref,
      activeMatches: ['/profile', '/login', '/register'],
      icon: user ? <FaRegUser /> : <RiLoginCircleLine />,
      activeIcon: user ? <FaUser /> : <RiLoginCircleFill />,
    },
  ];

  const navItemsAdmin: {
    href: string;
    icon: React.ReactElement;
    activeIcon: React.ReactElement;
    activeMatches?: string[];
  }[] = [
    {
      href: '/search',
      icon: <AiOutlineShop />,
      activeIcon: <AiFillShop />,
    },
    {
      href: '/orders',
      icon: <BsBoxSeam />,
      activeIcon: <BsBoxSeamFill />,
    },
    {
      href: profileHref,
      activeMatches: ['/profile', '/login', '/register'],
      icon: user ? <FaRegUser /> : <RiLoginCircleLine />,
      activeIcon: user ? <FaUser /> : <RiLoginCircleFill />,
    },
  ];

  return (
    <div className="flex fixed flex-row items-center justify-around sm:hidden bottom-0 left-0 w-full h-20 bg-primary text-white text-2xl z-50">
      {(isAdmin ? navItemsAdmin : navItemsClient).map((item) => {
        const matches = item.activeMatches ?? [item.href];
        const isActive = matches.some((m) => pathname.startsWith(m));
        return (
          <Link key={item.href} href={item.href}>
            {isActive ? item.activeIcon : item.icon}
          </Link>
        );
      })}
    </div>
  );
}
