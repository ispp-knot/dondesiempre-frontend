'use client';

import { useState } from 'react';
import { Edit2, Camera, Loader2, Save, X, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import useFetcher from '@/lib/api/fetcher';

type Props = {
  storefrontId: string;
  initialStore: StoreDTO;
};

export default function StoreOptions({ storefrontId, initialStore }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StoreDTO['storefront']>(initialStore?.storefront);
  const [hasChanges, setHasChanges] = useState(false);

  const updateStorefront = useFetcher<StoreDTO['storefront'], StoreDTO['storefront']>({
    url: `storefronts/${storefrontId}`,
    method: 'PUT',
    fetchOnStart: false,
  });

  const updateStorefrontState = (updates: Partial<StoreDTO['storefront']>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
    setHasChanges(true);
  };

  const handleCancel = () => {
    setFormData(initialStore?.storefront);
    setHasChanges(false);
  };

  const handleSave = async () => {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas confirmar los cambios? Se actualizará la apariencia pública de la tienda.'
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      updateStorefront.fetch({ newBody: formData });
      setHasChanges(false);
      location.reload();
    } catch (error) {
      alert('Error al guardar los cambios: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const storefront = formData;

  return (
    <div className="w-full max-w-142.5 space-y-10 relative pb-10">
      {loading && (
        <div className="absolute inset-0 bg-white/60 z-30 flex justify-center items-center rounded-xl">
          <Loader2 className="animate-spin text-teal-700 w-12 h-12" />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-[#c65a3a] text-lg font-medium">Imagen de cabecera</span>
          <Camera
            className="w-5 h-5 text-teal-700 cursor-pointer"
            onClick={() => {
              const url = prompt(
                'Introduce la URL de la nueva imagen:',
                storefront.bannerImageUrl || ''
              );
              if (url) updateStorefrontState({ bannerImageUrl: url });
            }}
          />
        </div>

        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <Image
            src={storefront.bannerImageUrl || '/static/img/banner.jpg'}
            alt="Preview"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </div>

      <div className="flex justify-between items-center gap-4">
        <p className="text-[#c65a3a] text-lg font-medium leading-tight flex-1">
          Mostrar colecciones antes que outfits
        </p>
        <button
          onClick={() =>
            updateStorefrontState({
              isFirstCollections: !storefront.isFirstCollections,
            })
          }
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            storefront.isFirstCollections ? 'bg-[#c65a3a]' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              storefront.isFirstCollections ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[#c65a3a] text-lg font-medium">Colores del escaparate</span>
          <Edit2 className="w-4 h-4 text-teal-700" />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 text-center">
            <input
              type="color"
              value={storefront.primaryColor}
              onChange={(e) => updateStorefrontState({ primaryColor: e.target.value })}
              className="w-full h-16 rounded-xl cursor-pointer border-none p-0 overflow-hidden shadow-sm"
            />
            <p className="text-teal-800 text-sm font-bold mt-2">Primario</p>
          </div>

          <div className="flex-1 text-center">
            <input
              type="color"
              value={storefront.secondaryColor}
              onChange={(e) => updateStorefrontState({ secondaryColor: e.target.value })}
              className="w-full h-16 rounded-xl cursor-pointer border-none p-0 overflow-hidden shadow-sm"
            />
            <p className="text-teal-800 text-sm font-bold mt-2">Secundario</p>
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className="flex flex-col gap-3 pt-6 border-t animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">Tienes cambios pendientes de confirmar</span>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-[#19756a] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-teal-800 transition"
          >
            <Save className="w-5 h-5" />
            Confirmar cambios
          </button>

          <button
            onClick={handleCancel}
            className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Descartar
          </button>
        </div>
      )}
    </div>
  );
}
