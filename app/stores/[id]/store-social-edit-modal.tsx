'use client';

import { useState, useEffect } from 'react';
import { useActiveFetcher } from '@/lib/api/fetcher';
import { StoreSocialNetworkDTO } from '@/lib/types/stores/storesSocialDto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Save, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [localNetworks, setLocalNetworks] = useState(socialNetworks);
  const [newName, setNewName] = useState('');
  const [newLink, setNewLink] = useState('');

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

  const handleAdd = async () => {
    if (!newName || !newLink) return;

    const created = await addSocial.fetch({
      body: { name: newName, link: newLink },
    });

    const next = [...localNetworks, created];
    setLocalNetworks(next);
    onUpdated(next);
    setNewName('');
    setNewLink('');
  };

  const handleUpdate = async (id: string, link: string) => {
    try {
      console.log('UPDATE CALL:', {
        storeId,
        id,
        link,
      });

      const updated = await updateSocial.fetch({
        url: `store-social-networks/${id}`,
        body: { link },
      });

      console.log('UPDATED:', updated);

      const next = localNetworks.map((s) => (s.id === id ? updated : s));
      setLocalNetworks(next);
      onUpdated(next);
    } catch (e) {
      console.error('ERROR UPDATE:', e);
      console.log('storeId:', storeId);
      console.log('id:', id);
      console.log('link:', link);
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
    } catch (e) {
      console.error('ERROR DELETE:', e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-teal-700">Redes sociales</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* EXISTENTES */}
          {localNetworks.map((social) => (
            <div key={social.id} className="flex gap-2 items-center">
              {/* Nombre */}
              <div className="w-32 text-sm font-medium text-primary">{social.name}</div>

              {/* Input */}
              <Input
                value={social.link}
                onChange={(e) =>
                  setLocalNetworks((prev) =>
                    prev.map((s) => (s.id === social.id ? { ...s, link: e.target.value } : s))
                  )
                }
                className="flex-1 text-muted-foreground"
              />

              {/* Guardar */}
              <Button
                className="bg-secondary hover:opacity-90 text-white"
                onClick={() => handleUpdate(social.id, social.link)}
              >
                <Save className="w-4 h-4" />
              </Button>

              {/* Borrar */}
              <Button
                className="bg-primary hover:opacity-90 text-white"
                onClick={() => handleDelete(social.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {/* AÑADIR NUEVA */}
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Nombre (Instagram, TikTok...)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="text-muted-foreground"
            />
            <Input
              placeholder="Link"
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
              className="text-muted-foreground"
            />
            <Button className="bg-primary hover:opacity-90 text-white" onClick={handleAdd}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
