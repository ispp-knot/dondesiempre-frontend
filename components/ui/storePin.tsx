import { Store } from '@/lib/api/types';
import { convertToBrightness } from '@/lib/colorUtils';
import { MdLocationPin } from 'react-icons/md';

export function StorePin({ store, size = 40 }: { store: Store; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <label
        className="bg-white px-1.5 py-0.5 rounded-lg whitespace-nowrap text-lg font-medium shadow-md cursor-pointer"
        style={{ color: convertToBrightness(store.color, 25) }}
      >
        {store.name}
      </label>
      <MdLocationPin
        size={size}
        className="cursor-pointer"
        color={convertToBrightness(store.color, 65)}
      />
    </div>
  );
}
