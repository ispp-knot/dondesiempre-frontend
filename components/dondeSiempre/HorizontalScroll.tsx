'use client';
import Link from 'next/link';
import { useRef, useState, useEffect, ReactNode } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

type Props = {
  title: string;
  viewMoreHref: string;
  children: ReactNode[];
};

export default function HorizontalScroll({ title, viewMoreHref, children }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setHasOverflow(el.scrollWidth > el.clientWidth);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    const half = window.innerWidth / 2;
    scrollRef.current?.scrollBy({ left: direction === 'left' ? -half : half, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col px-5 sm:w-10/12">
      <div className="flex flex-row items-center justify-between w-full mb-4">
        <h1 className="text-primary text-xl md:text-2xl font-bold">{title}</h1>
        <Link href={viewMoreHref} className="text-secondary underline">
          Ver más
        </Link>
      </div>

      <div className="relative group">
        {hasOverflow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 h-full w-16 z-10 flex items-center justify-start pl-2 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-r from-white/80 to-transparent cursor-pointer"
          >
            <LuChevronLeft className="w-6 h-6 text-black" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex flex-row gap-2 md:gap-4 overflow-x-scroll py-2 mb-2 storefront-listing select-none"
        >
          {children}
        </div>

        {hasOverflow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 h-full w-16 z-10 flex items-center justify-end pr-2 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-l from-white/80 to-transparent cursor-pointer"
          >
            <LuChevronRight className="w-6 h-6 text-black" />
          </button>
        )}
      </div>
    </div>
  );
}
