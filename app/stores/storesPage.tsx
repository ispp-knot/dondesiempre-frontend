'use client';

import { StoreMap } from '@/components/ui/storeMap';
import { StoreMapCard } from './storeMapCard';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Store } from '@/lib/api/types';

export function StoresPage() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  return (
    <>
      <StoreMap onStoreSelect={setSelectedStore} />
      <AnimatePresence>
        {selectedStore && <StoreMapCard key={selectedStore.name} store={selectedStore} />}
      </AnimatePresence>
    </>
  );
}
