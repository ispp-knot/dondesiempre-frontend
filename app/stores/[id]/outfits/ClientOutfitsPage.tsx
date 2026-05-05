'use client';

import { BackButton } from '@/components/dondeSiempre/BackButton';
import NotFoundText from '@/components/dondeSiempre/NotFoundText';
import OutfitCard from '@/components/dondeSiempre/OutfitCard';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

export interface ClientOutfitsPageProps {
  storeId: string;
  outfits?: OutfitDTO[];
}

export default function ClientOutfitsPage(props: ClientOutfitsPageProps): ReactNode {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="w-full md:w-8/12">
          {props.outfits && props.outfits.length > 0 ? (
            <>
              {props.outfits.map((outfit) => (
                <OutfitCard key={outfit.id} outfit={outfit} isOwner={false} onDelete={() => {}} />
              ))}
            </>
          ) : (
            <>
              <NotFoundText message="Esta tienda todavía no tiene outfits disponibles..." />
              <div className="w-full flex justify-center mt-4">
                <BackButton
                  onAction={() => router.push(`/stores/${props.storeId}`)}
                  variant="default"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
