import { Store } from '@/lib/api/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LuRoute, LuStore } from 'react-icons/lu';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { convertToBrightness } from '@/lib/colorUtils';

export function StoreMapCard({ store }: { store: Store }) {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${
            i <= store.rating ? 'fill-primary text-primary' : 'fill-muted text-muted'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed bottom-0 md:bottom-4 left-0 right-0 z-50 pointer-events-none"
    >
      <Card className="rounded-t-xl rounded-b-none md:rounded-b-xl shadow-lg md:shadow-2xl border-t md:border md:w-[90%] md:max-w-2xl mx-auto py-3 sm:py-6 md:py-8">
        <div className="flex flex-col gap-4 sm:gap-6 px-5 sm:px-6 pointer-events-auto">
          {/* Top section: Text + Image */}
          <div className="flex gap-8 sm:gap-12 mx-auto">
            {/* Store Info */}
            <div className="flex-1 flex flex-col gap-1.5 sm:gap-2 min-w-0">
              {/* Store Name */}
              <h3
                className="text-lg sm:text-xl font-semibold truncate"
                style={{ color: convertToBrightness(store.color, 50) }}
              >
                {store.name}
              </h3>

              {/* Address */}
              <p className="text-sm sm:text-base text-secondary font-semibold line-clamp-2">
                {store.address}
              </p>

              {/* Stars */}
              <div className="flex gap-1">{renderStars()}</div>
            </div>

            {/* Store Image */}
            <div className="w-32 h-32 sm:w-36 sm:h-36 relative flex-shrink-0">
              <Image
                src={store.imageUrl || '/store-placeholder.jpeg'}
                alt={store.name}
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 text-sm sm:text-base h-10 sm:h-11"
              onClick={() => {
                // TODO
              }}
            >
              <span className="truncate">Cómo llegar</span>
              <LuRoute className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            </Button>
            <Button
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2 text-sm sm:text-base h-10 sm:h-11"
              onClick={() => {
                // TODO
              }}
            >
              <span className="truncate">Ver escaparate</span>
              <LuStore className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
