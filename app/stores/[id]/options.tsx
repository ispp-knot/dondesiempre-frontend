'use client';

import { useState } from 'react';
import { Edit2, Loader2, Save, X, AlertCircle } from 'lucide-react';
import ImageUpload from '@/components/dondeSiempre/ImageUpload';
import { StoreDTO } from '@/lib/types/stores/storesDto';
import { useActiveFetcher } from '@/lib/api/fetcher';
import { ErrorModal } from '@/components/modals/ErrorModal';
import { GenericConfirmModal } from '@/components/modals/GenericConfirmModal';

type Props = {
  storefrontId: string;
  initialStore: StoreDTO;
};

type FetchErrorShape = {
  status?: number;
  response?: {
    status?: number;
  };
  message?: string;
};

export default function StoreOptions({ storefrontId, initialStore }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StoreDTO['storefront']>(initialStore?.storefront);
  const [hasChanges, setHasChanges] = useState(false);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [activeFetchingError, setActiveFetchingError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const updateStorefront = useActiveFetcher<StoreDTO['storefront']>({
    url: `storefronts/${storefrontId}`,
    method: 'PUT',
  });

  const updateStorefrontState = (updates: Partial<StoreDTO['storefront']>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
    setHasChanges(true);
  };

  const handleBannerFileChange = (file: File | null) => {
    if (file && file.size > 2 * 1024 * 1024) {
      setActiveFetchingError('La imagen supera el tamaño máximo permitido (2MB)');
      return;
    }
    setBannerImageFile(file);
    setHasChanges(true);
  };

  const handleCancel = () => {
    setFormData(initialStore?.storefront);
    setBannerImageFile(null);
    setHasChanges(false);
  };

  const handleConfirm = async () => {
    setIsConfirmModalOpen(false);
    setLoading(true);
    try {
      const formPayload = {
        dto: new Blob([JSON.stringify(formData)], { type: 'application/json' }),
        image: bannerImageFile ?? undefined,
      };

      await updateStorefront.fetch({
        formPayload,
      });

      setHasChanges(false);
      location.reload();
    } catch (error: unknown) {
      const err = error as FetchErrorShape;
      const status = err.status ?? err.response?.status;
      const message = err.message ?? '';

      if (status === 413 || status === 500 || message.includes('413') || message.includes('500')) {
        setActiveFetchingError('La imagen es muy grande. Por favor, sube una de menor tamaño.');
      } else {
        setActiveFetchingError('No se pudieron guardar los cambios.');
      }
    } finally {
      setLoading(false);
    }
  };

  const storefront = formData;

  return (
    <div className="w-11/12 max-w-200 space-y-10 relative pb-10 self-center">
      {isConfirmModalOpen && (
        <GenericConfirmModal
          message="¿Estás seguro de que deseas confirmar los cambios? Se actualizará la apariencia pública de la tienda."
          onConfirm={handleConfirm}
          onClose={() => setIsConfirmModalOpen(false)}
          isLoading={loading}
        />
      )}

      {activeFetchingError && (
        <ErrorModal message={activeFetchingError} onClose={() => setActiveFetchingError(null)} />
      )}

      {loading && (
        <div className="absolute inset-0 bg-white/60 z-30 flex justify-center items-center rounded-xl">
          <Loader2 className="animate-spin text-teal-700 w-12 h-12" />
        </div>
      )}

      <div className="space-y-4">
        <span className="text-[#c65a3a] text-lg font-medium">Imagen de cabecera</span>
        <ImageUpload
          onChange={handleBannerFileChange}
          existingImageUrl={storefront.bannerImageUrl || '/static/img/banner.jpg'}
        />
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
            onClick={() => setIsConfirmModalOpen(true)}
            className="w-full bg-[#19756a] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-teal-800 transition cursor-pointer"
          >
            <Save className="w-5 h-5" />
            Confirmar cambios
          </button>
          <button
            onClick={handleCancel}
            className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
            Descartar
          </button>
        </div>
      )}
    </div>
  );
}
