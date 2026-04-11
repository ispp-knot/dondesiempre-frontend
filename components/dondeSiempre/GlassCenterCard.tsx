import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function GlassCenterCard({
  children,
  logo = false,
}: {
  children: React.ReactNode;
  logo?: boolean;
}) {
  return (
    <main className="relative flex flex-1 flex-col px-4 sm:items-center sm:justify-center sm:px-8 sm:py-8 sm:bg-primary/10">
      {/* Blurred background logo — desktop only */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        <Image
          src="/static/logo-svg.svg"
          alt=""
          fill
          sizes="100vw"
          className="opacity-30 blur-md object-contain"
          aria-hidden
        />
      </div>

      <Card
        className={cn(
          // mobile: invisible card, fills height, centers content
          'relative z-10 w-full flex flex-col justify-center flex-1',
          'border-0 bg-transparent shadow-none rounded-none py-6',
          // sm+: real glass card, auto-sized
          'sm:flex-none sm:block sm:max-w-4xl sm:p-8',
          'sm:rounded-2xl sm:border sm:border-white/40',
          'sm:bg-white/85 sm:shadow-xl sm:backdrop-blur-md'
        )}
      >
        {logo && (
          <div className="mb-6 flex flex-col items-center gap-2">
            <Image src="/static/logo-svg.svg" alt="DondeSiempre" width={40} height={50} />
            <span className="text-xl font-bold text-primary">DondeSiempre</span>
          </div>
        )}
        {children}
      </Card>
    </main>
  );
}
