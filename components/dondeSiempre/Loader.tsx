import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

interface LoaderProps {
  children?: ReactNode;
  className?: string;
}

export default function Loader({
  children,
  className = 'flex flex-col items-center justify-center w-full h-screen bg-background',
}: LoaderProps) {
  return (
    <div className={className}>
      <Loader2 className="animate-spin w-12 h-12" />
      {children}
    </div>
  );
}
