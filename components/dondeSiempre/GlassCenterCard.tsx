import Image from 'next/image';

export default function GlassCenterCard({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center px-4 sm:px-8 sm:py-8 sm:bg-primary/10">
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

      {/* Card: glassy on desktop, plain full-width on mobile */}
      <div className="relative z-10 w-full py-6 sm:max-w-md sm:p-8 sm:rounded-2xl sm:border sm:border-white/40 sm:bg-white/85 sm:shadow-xl sm:backdrop-blur-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <Image src="/static/logo-svg.svg" alt="DondeSiempre" width={40} height={50} />
          <span className="text-xl font-bold text-primary">DondeSiempre</span>
        </div>
        {children}
      </div>
    </main>
  );
}
