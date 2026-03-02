'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaRegUser, FaUser, FaRegHeart, FaHeart, FaSearch } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';
import { HiOutlineLocationMarker, HiLocationMarker } from 'react-icons/hi';
import { BsBoxSeam, BsBoxSeamFill } from 'react-icons/bs';

export default function NavbarBottom() {
  const pathname = usePathname();
  const navItems = [
    {
      href: '/search',
      icon: <IoSearch />,
      activeIcon: <FaSearch />,
    },
    {
      href: '/favorites',
      icon: <FaRegHeart />,
      activeIcon: <FaHeart />,
    },
    {
      href: '/stores',
      icon: <HiOutlineLocationMarker />,
      activeIcon: <HiLocationMarker />,
    },
    {
      href: '/deliveries',
      icon: <BsBoxSeam />,
      activeIcon: <BsBoxSeamFill />,
    },
    {
      href: '/profile',
      icon: <FaRegUser />,
      activeIcon: <FaUser />,
    },
  ];
  return (
    <div className="flex fixed flex-row items-center justify-around sm:hidden bottom-0 left-0 w-full h-20 bg-primary text-white text-2xl z-20">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href}>
            {isActive ? item.activeIcon : item.icon}
          </Link>
        );
      })}
    </div>
  );
}
