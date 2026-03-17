import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePassiveFetcher, useActiveFetcher } from '@/lib/api/fetcher';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import { convertToBrightness } from '@/lib/colorUtils';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { LuStore } from 'react-icons/lu';
import { DEFAULT_MAP_LOCATION, distance } from '@/lib/mapUtils';

export function StoreMapCard({
  store,
  userLocation,
}: {
  store: StoreDTO;
  userLocation: { lat: number; lng: number } | null;
}) {
  const color = store.storefront?.primaryColor ?? '#c65a3a';
  const isFollowing = usePassiveFetcher<boolean>({ url: `stores/${store.id}/followers/me` });
  const followStore = useActiveFetcher<void>({
    url: `stores/${store.id}/followers`,
    method: 'POST',
  });
  const unfollowStore = useActiveFetcher<void>({
    url: `stores/${store.id}/follow`,
    method: 'DELETE',
  });
  const distanceToUser = distance(
    userLocation?.lat ?? DEFAULT_MAP_LOCATION.lat,
    userLocation?.lng ?? DEFAULT_MAP_LOCATION.lng,
    store.latitude,
    store.longitude
  );

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
                style={{ color: convertToBrightness(color, 50) }}
              >
                {store.name}
              </h3>

              {/* Address */}
              <p className="text-sm sm:text-base text-secondary font-semibold line-clamp-2">
                {store.address}
              </p>
              {userLocation && (
                <p className="text-sm text-primary">{`A ${distanceToUser.toFixed(2)} km de ti`}</p>
              )}
              {/* Follow button */}
              <Button
                variant="outline"
                className="flex items-center w-fit gap-1.5 border border-primary rounded-sm px-3 py-1.5 text-xs text-primary hover:bg-primary hover:text-white transition"
                onClick={async () => {
                  console.log(store.id);
                  if (isFollowing.data) {
                    await unfollowStore.fetch();
                    isFollowing.setData(false);
                  } else {
                    await followStore.fetch();
                    isFollowing.setData(true);
                  }
                }}
              >
                {isFollowing.data ? 'Dejar de seguir' : '+ Seguir'}
              </Button>
            </div>

            {/* Store Image */}
            <div className="w-32 h-32 sm:w-36 sm:h-36 relative flex-shrink-0">
              <Image
                src={store.storefront?.bannerImageUrl || '/store-placeholder.jpeg'}
                alt={store.name}
                fill
                className="rounded-lg object-cover"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-2 w-full">
            {/*<Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 text-sm sm:text-base h-10 sm:h-11"
              onClick={() => {
                // TODO
              }}
            >
              <span className="truncate">Cómo llegar</span>
              <LuRoute className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            </Button>*/}
            <Button
              asChild
              variant="secondary"
              className="flex-1 flex items-center justify-center gap-2 text-sm sm:text-base h-10 sm:h-11"
            >
              <Link href={`/stores/${store.id}`}>
                <span className="truncate">Ver escaparate</span>
                <LuStore className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
