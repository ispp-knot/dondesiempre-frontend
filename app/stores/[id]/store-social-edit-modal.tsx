'use client';

import { useState, useMemo } from 'react';
import { useActiveFetcher, usePassiveFetcher } from '@/lib/api/fetcher';
import { StoreSocialNetworkDTO } from '@/lib/types/stores/storesSocialDto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Save, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { z } from 'zod';

const PHONE_NETWORKS = ['Teléfono', 'Phone'];

const socialNetworkSchema = z
  .object({
    name: z.string().min(1, 'Debes seleccionar una red social de la lista.'),
    link: z
      .string()
      .min(1, 'El campo de enlace o número no puede estar vacío.')
      .max(500, 'Máximo 500 caracteres.'),
  })
  .superRefine((val, ctx) => {
    if (!val.name || !val.link) return;

    const isPhone = PHONE_NETWORKS.includes(val.name);
    const cleanLink = val.link.startsWith('tel:') ? val.link.replace('tel:', '') : val.link;
    const nameLower = val.name.toLowerCase();

    const phoneRegex = /^\+?[1-9]\d{8,14}$/;
    const urlRegex =
      /^(https?:\/\/)?(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}|localhost|(?:\d{1,3}\.){3}\d{1,3})(:\d+)?(\/[^\s]*)?$/;

    if (isPhone) {
      const digits = cleanLink.replace(/\s+/g, '');
      if (!phoneRegex.test(digits)) {
        ctx.addIssue({
          code: 'custom',
          path: ['link'],
          message: 'Debe ser un número de teléfono válido, 9-15 dígitos (opcional prefijo "+").',
        });
      }
    } else {
      const digits = cleanLink.replace(/\s+/g, '');
      const isWhatsappPhone = nameLower === 'whatsapp' && phoneRegex.test(digits);

      if (!isWhatsappPhone && !urlRegex.test(cleanLink)) {
        ctx.addIssue({
          code: 'custom',
          path: ['link'],
          message: 'Debe ser un enlace web válido (por ejemplo: https://www.ejemplo.com).',
        });
        return;
      }

      const linkLower = cleanLink.toLowerCase();

      if (nameLower === 'instagram' && !linkLower.includes('instagram.com')) {
        ctx.addIssue({
          code: 'custom',
          path: ['link'],
          message: 'El enlace debe corresponder a una URL válida de Instagram.',
        });
      } else if (nameLower === 'tiktok' && !linkLower.includes('tiktok.com')) {
        ctx.addIssue({
          code: 'custom',
          path: ['link'],
          message: 'El enlace debe corresponder a una URL válida de TikTok.',
        });
      } else if (nameLower === 'facebook' && !linkLower.includes('facebook.com')) {
        ctx.addIssue({
          code: 'custom',
          path: ['link'],
          message: 'El enlace debe corresponder a una URL válida de Facebook.',
        });
      } else if (
        (nameLower === 'x' || nameLower === 'twitter') &&
        !linkLower.includes('x.com') &&
        !linkLower.includes('twitter.com')
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['link'],
          message: 'El enlace debe corresponder a una URL válida de X (Twitter).',
        });
      } else if (
        nameLower === 'whatsapp' &&
        !isWhatsappPhone &&
        !linkLower.includes('wa.me') &&
        !linkLower.includes('whatsapp.com')
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['link'],
          message: 'Debe ser un enlace de WhatsApp (wa.me) o un número de teléfono válido.',
        });
      }
    }
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
  const [prevSocialNetworks, setPrevSocialNetworks] = useState(socialNetworks);
  const [localNetworks, setLocalNetworks] = useState<StoreSocialNetworkDTO[]>(() =>
    socialNetworks.map((s) => ({
      ...s,
      link: s.link?.startsWith('tel:') ? s.link.replace('tel:', '') : s.link,
    }))
  );

  if (socialNetworks !== prevSocialNetworks) {
    setPrevSocialNetworks(socialNetworks);
    setLocalNetworks(
      socialNetworks.map((s) => ({
        ...s,
        link: s.link?.startsWith('tel:') ? s.link.replace('tel:', '') : s.link,
      }))
    );
  }

  const [newName, setNewName] = useState('');
  const [newLink, setNewLink] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [updateErrors, setUpdateErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const addSocial = useActiveFetcher<StoreSocialNetworkDTO>({
    url: `stores/${storeId}/social-networks`,
    method: 'POST',
  });
  const updateSocial = useActiveFetcher<StoreSocialNetworkDTO>({ method: 'PUT' });
  const deleteSocial = useActiveFetcher({ method: 'DELETE' });

  const formatLinkForBackend = (name: string, link: string) => {
    const clean = link.trim();
    const nameLower = name.toLowerCase();
    const phoneRegex = /^\+?[1-9]\d{8,14}$/;

    const isWhatsappPhone = nameLower === 'whatsapp' && phoneRegex.test(clean.replace(/\s+/g, ''));

    if (PHONE_NETWORKS.includes(name) || isWhatsappPhone) {
      const rawDigits = clean.startsWith('tel:') ? clean.replace('tel:', '') : clean;
      return `tel:${rawDigits.replace(/\s+/g, '')}`;
    }
    if (!clean.startsWith('http://') && !clean.startsWith('https://') && clean.includes('.'))
      return `https://${clean}`;
    return clean;
  };

  const handleAdd = async () => {
    const cleanLink = newLink.startsWith('tel:') ? newLink.replace('tel:', '') : newLink;
    const result = socialNetworkSchema.safeParse({ name: newName, link: cleanLink });
    if (!result.success) {
      setAddError(result.error.issues[0].message);
      return;
    }
    setAddError(null);

    try {
      const created = await addSocial.fetch({
        body: { name: newName, link: formatLinkForBackend(newName, cleanLink) },
      });
      setLocalNetworks((prev) => {
        const next = [
          ...prev.filter((s) => s.id !== created.id),
          { ...created, link: created.link.replace('tel:', '') },
        ];

        onUpdated(next.map((s) => ({ ...s, link: formatLinkForBackend(s.name, s.link ?? '') })));

        return next;
      });
      setNewName('');
      setNewLink('');
      setStatus({ type: 'success', message: 'Red social añadida correctamente' });
    } catch {
      setStatus({ type: 'error', message: 'Error añadiendo red social.' });
    }
  };

  const handleUpdate = async (id: string, name: string, link: string) => {
    const cleanLink = link.startsWith('tel:') ? link.replace('tel:', '') : link;
    const result = socialNetworkSchema.safeParse({ name, link: cleanLink });
    if (!result.success) {
      setUpdateErrors((prev) => ({ ...prev, [id]: result.error.issues[0].message }));
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
        body: { link: formatLinkForBackend(name, cleanLink) },
      });
      const next = localNetworks.map((s) =>
        s.id === id ? { ...updated, link: updated.link.replace('tel:', '') } : s
      );
      setLocalNetworks(next);

      onUpdated(next.map((s) => ({ ...s, link: formatLinkForBackend(s.name, s.link ?? '') })));

      setStatus({ type: 'success', message: 'Red social actualizada correctamente' });
    } catch {
      setStatus({ type: 'error', message: 'Error actualizando red social.' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSocial.fetch({ url: `store-social-networks/${id}` });
      const next = localNetworks.filter((s) => s.id !== id);
      setLocalNetworks(next);

      onUpdated(next.map((s) => ({ ...s, link: formatLinkForBackend(s.name, s.link ?? '') })));

      setStatus({ type: 'success', message: 'Red social eliminada correctamente' });
    } catch {
      setStatus({ type: 'error', message: 'Error eliminando red social.' });
    }
  };

  const socialNetworkNames = usePassiveFetcher<string[]>({
    url: 'social-networks/names',
    enabled: open,
  });
  const availableNames = useMemo(
    () => socialNetworkNames.data?.filter((n) => !localNetworks.some((s) => s.name === n)) ?? [],
    [socialNetworkNames.data, localNetworks]
  );

  if (newName && !availableNames.includes(newName)) {
    setNewName('');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] rounded-lg overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-teal-700">Redes sociales</DialogTitle>
        </DialogHeader>
        {status && (
          <div
            className={`rounded-md p-3 text-sm ${status.type === 'error' ? 'border border-red-300 bg-red-50 text-red-700' : 'border border-green-300 bg-green-50 text-green-700'}`}
          >
            {status.message}
          </div>
        )}
        <div className="flex flex-col gap-6">
          {localNetworks.map((social) => (
            <div
              key={social.id}
              className="flex flex-wrap sm:flex-nowrap gap-3 items-start border-b pb-4 sm:border-0 sm:pb-0"
            >
              <div className="w-full sm:w-24 text-sm font-semibold text-primary shrink-0 uppercase tracking-wider pt-2.5 sm:pt-0">
                {social.name}
              </div>

              <div className="flex-1 flex flex-col items-start gap-1 min-w-[200px] w-full">
                <Input
                  value={social.link ?? ''}
                  onChange={(e) =>
                    setLocalNetworks((prev) =>
                      prev.map((s) => (s.id === social.id ? { ...s, link: e.target.value } : s))
                    )
                  }
                  className="w-full text-muted-foreground"
                  aria-invalid={!!updateErrors[social.id]}
                />
                {updateErrors[social.id] && (
                  <p className="text-[10px] font-medium text-destructive ml-1">
                    {updateErrors[social.id]}
                  </p>
                )}
              </div>

              <div className="flex gap-2 ml-auto sm:ml-0 pt-0.5">
                <Button
                  size="icon"
                  className="bg-secondary hover:opacity-90 text-white shrink-0"
                  onClick={() => handleUpdate(social.id, social.name, social.link ?? '')}
                >
                  <Save className="w-4 h-4" />
                </Button>

                <Button
                  size="icon"
                  className="bg-primary hover:opacity-90 text-white shrink-0"
                  onClick={() => handleDelete(social.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap sm:flex-nowrap gap-3 items-start bg-slate-50 p-4 rounded-lg border border-dashed border-slate-300">
            <select
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full sm:w-auto h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground font-sans min-w-[140px]"
            >
              <option value="">Red...</option>
              {availableNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <div className="flex-1 flex flex-col items-start gap-1 min-w-[200px] w-full">
              <Input
                placeholder="Enlace o teléfono"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                aria-invalid={!!addError}
                className="w-full"
              />
              {addError && (
                <p className="text-[10px] font-medium text-destructive ml-1">{addError}</p>
              )}
            </div>

            <Button
              size="icon"
              className="bg-primary hover:opacity-90 text-white shrink-0 ml-auto sm:ml-0 pt-0.5"
              onClick={handleAdd}
              disabled={addSocial.isPending || !newName}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
