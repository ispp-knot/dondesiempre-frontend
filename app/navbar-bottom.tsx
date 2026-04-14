'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaRegUser, FaUser, FaRegHeart, FaHeart, FaSearch } from 'react-icons/fa';
import { RiLoginCircleLine, RiLoginCircleFill } from 'react-icons/ri';
import { IoSearch } from 'react-icons/io5';
import { HiOutlineLocationMarker, HiLocationMarker } from 'react-icons/hi';
import { BsBoxSeam, BsBoxSeamFill } from 'react-icons/bs';
import { useAuth } from '@/lib/auth/AuthContext';

function BottomNavbarIcon({
  href,
  icon,
  activeIcon,
  activeMatches,
}: {
  href: string;
  icon: React.ReactElement;
  activeIcon: React.ReactElement;
  activeMatches?: string[];
}) {
  const pathname = usePathname();

  const matches = activeMatches ?? [href];
  const isActive = matches.some((m) => pathname.startsWith(m));
  return <Link href={href}>{isActive ? activeIcon : icon}</Link>;
}

export default function NavbarBottom() {
  const { getCurrentUser } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const user = getCurrentUser();
  const profileHref = user ? '/profile' : '/login';

  const isClient = Boolean(user?.client?.id);
  const isLoggedIn = Boolean(user);

  if (!mounted) {
    return (
      <div className="flex fixed flex-row items-center justify-around sm:hidden bottom-0 left-0 w-full h-20 bg-primary text-white text-2xl z-50"></div>
    );
  }

  return (
    <div className="flex fixed flex-row items-center justify-around sm:hidden bottom-0 left-0 w-full h-20 bg-primary text-white text-2xl z-50">
      <BottomNavbarIcon href="/search" icon={<IoSearch />} activeIcon={<FaSearch />} />

      {isClient ? (
        <BottomNavbarIcon href="/following" icon={<FaRegHeart />} activeIcon={<FaHeart />} />
      ) : (
        <></>
      )}

      <BottomNavbarIcon
        href="/stores"
        icon={<HiOutlineLocationMarker />}
        activeIcon={<HiLocationMarker />}
      />

      {isLoggedIn ? (
        <BottomNavbarIcon href="/orders" icon={<BsBoxSeam />} activeIcon={<BsBoxSeamFill />} />
      ) : (
        <></>
      )}

      <BottomNavbarIcon
        href={profileHref}
        activeMatches={['/profile', '/login', '/register']}
        icon={user ? <FaRegUser /> : <RiLoginCircleLine />}
        activeIcon={user ? <FaUser /> : <RiLoginCircleFill />}
      />
    </div>
  );
}
