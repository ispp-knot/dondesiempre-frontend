import { Loader2 } from 'lucide-react';

export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-background">
      <Loader2 className="animate-spin w-12 h-12" />
    </div>
  );
}
