'use client';

import { useState, useEffect, useMemo } from 'react';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { StoreSocialNetworkDTO } from '@/lib/types/stores/storesSocialDto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Save, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { z } from 'zod';

const socialNetworkSchema = z.object({
  name: z.string().min(1, 'Debes seleccionar una red social'),
  link: z
    .string()
    .min(1, 'El enlace o teléfono es obligatorio')
    .max(500, 'Máximo 500 caracteres')
    .refine(
      (val) => {
        const urlRegex =
          /^(https?:\/\/)?(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost|(?:\d{1,3}\.){3}\d{1,3})(:\d+)?(\/[^\s]*)?$/;
        const phoneRegex = /^(\+?[1-9]\d{1,14}$|^[0-9]{9,15})$/;
        const cleanPhone = val.replace(/\s+/g, '');
        return urlRegex.test(val) || phoneRegex.test(cleanPhone);
      },
      {
        message: 'Formato inválido (URL o teléfono)',
      }
    ),
});

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  socialNetworks: StoreSocialNetworkDTO[];
  onUpdated: (updated: StoreSocialNetworkDTO[]) => void;
};

export default function StoreSocialNetworksModal({
  open,
  onOpenChange,
  storeId,
  socialNetworks,
  onUpdated,
}: Props) {
  const [localNetworks, setLocalNetworks] = useState<StoreSocialNetworkDTO[]>([]);
  const [newName, setNewName] = useState('');
  const [newLink, setNewLink] = useState('');

  const [addError, setAddError] = useState<string | null>(null);
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocalNetworks(socialNetworks);
  }, [socialNetworks]);

  const addSocial = useActiveFetcher<StoreSocialNetworkDTO>({
    url: `stores/${storeId}/social-networks`,
    method: 'POST',
  });

  const updateSocial = useActiveFetcher<StoreSocialNetworkDTO>({
    method: 'PUT',
  });

  const deleteSocial = useActiveFetcher({ method: 'DELETE' });

  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleAdd = async () => {
    const result = socialNetworkSchema.safeParse({ name: newName, link: newLink });

    if (!result.success) {
      setAddError(result.error.issues[0].message);
      return;
    }

    setAddError(null);

    try {
      const created = await addSocial.fetch({
        body: { name: newName, link: newLink },
      });

      setLocalNetworks((prev) => {
        const next = [...prev.filter((s) => s.id !== created.id), created];
        onUpdated(next);
        return next;
      });

      setNewName('');
      setNewLink('');
      setStatus({ type: 'success', message: 'Red social añadida correctamente' });
    } catch {
      setStatus({
        type: 'error',
        message: 'Error añadiendo red social.',
      });
    }
  };

  const socialNetworkNames = usePassiveFetcher<string[]>({
    url: 'social-networks/names',
    enabled: open,
  });

  const availableNames = useMemo(
    () =>
      socialNetworkNames.data?.filter(
        (name) => !localNetworks.some((network) => network.name === name)
      ) ?? [],
    [socialNetworkNames.data, localNetworks]
  );

  useEffect(() => {
    if (newName && !availableNames.includes(newName)) {
      setNewName('');
    }
  }, [availableNames, newName]);

  const handleUpdate = async (id: string, link: string) => {
    const result = socialNetworkSchema.safeParse({ name: 'valid', link });

    if (!result.success) {
      setUpdateErrors((prev) => ({
        ...prev,
        [id]: result.error.issues[0].message,
      }));
      return;
    }

    setUpdateErrors((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    try {
      const updated = await updateSocial.fetch({
        url: `store-social-networks/${id}`,
        body: { link },
      });

      const next = localNetworks.map((s) => (s.id === id ? updated : s));
      setLocalNetworks(next);
      onUpdated(next);
      setStatus({ type: 'success', message: 'Red social actualizada correctamente' });
    } catch {
      setStatus({
        type: 'error',
        message: 'Error actualizando red social.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSocial.fetch({
        url: `store-social-networks/${id}`,
      });

      const next = localNetworks.filter((s) => s.id !== id);
      setLocalNetworks(next);
      onUpdated(next);
      setStatus({ type: 'success', message: 'Red social eliminada correctamente' });
    } catch {
      setStatus({
        type: 'error',
        message: 'Error eliminando red social.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-teal-700">Redes sociales</DialogTitle>
        </DialogHeader>
        {status && (
          <div
            className={`rounded-md p-3 text-sm ${
              status.type === 'error'
                ? 'border border-red-300 bg-red-50 text-red-700'
                : 'border border-green-300 bg-green-50 text-green-700'
            }`}
          >
            {status.message}
          </div>
        )}
        <div className="flex flex-col gap-4">
          {localNetworks.map((social) => (
            <div key={social.id} className="flex flex-col gap-1">
              <div className="flex gap-2 items-center">
                <div className="w-20 sm:w-32 text-xs sm:text-sm font-medium text-primary truncate">
                  {social.name}
                </div>

                <Input
                  value={social.link ?? ''}
                  onChange={(e) =>
                    setLocalNetworks((prev) =>
                      prev.map((s) => (s.id === social.id ? { ...s, link: e.target.value } : s))
                    )
                  }
                  className={`flex-1 text-xs sm:text-sm text-muted-foreground ${updateErrors[social.id] ? 'border-destructive' : ''}`}
                  aria-invalid={!!updateErrors[social.id]}
                />

                <Button
                  size="icon"
                  className="bg-secondary hover:opacity-90 text-white shrink-0 h-9 w-9"
                  onClick={() => handleUpdate(social.id, social.link)}
                >
                  <Save className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  className="bg-primary hover:opacity-90 text-white shrink-0 h-9 w-9"
                  onClick={() => handleDelete(social.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {updateErrors[social.id] && (
                <p className="text-[10px] text-destructive ml-20 sm:ml-32">
                  {updateErrors[social.id]}
                </p>
              )}
            </div>
          ))}

          <div className="flex flex-col gap-1">
            <div className="flex gap-2 items-center">
              <select
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={`h-10 w-24 sm:w-40 rounded-md border bg-background px-2 py-2 text-xs sm:text-sm text-muted-foreground font-sans shrink-0 ${addError?.includes('seleccionar') ? 'border-destructive' : 'border-input'}`}
              >
                <option value="">Red...</option>
                {availableNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Enlace o teléfono"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                className={`flex-1 text-xs sm:text-sm ${addError && !addError.includes('seleccionar') ? 'border-destructive' : ''}`}
                aria-invalid={!!addError}
              />
              <Button
                size="icon"
                className="bg-primary hover:opacity-90 text-white shrink-0 h-9 w-9"
                onClick={handleAdd}
                disabled={addSocial.isPending}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {addError && <p className="text-[10px] text-destructive ml-2">{addError}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
