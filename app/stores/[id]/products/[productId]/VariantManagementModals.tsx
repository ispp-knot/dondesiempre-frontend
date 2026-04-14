'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { ProductVariantDTO } from './ProductVariantSelector';

interface DeleteVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  variants: ProductVariantDTO[];
  onDelete: (variantIds: string[]) => Promise<void>;
  isDeleting: boolean;
}

export function DeleteVariantsModal({
  isOpen,
  onClose,
  variants,
  onDelete,
  isDeleting,
}: DeleteVariantsModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggle = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === variants.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(variants.map((v) => v.id)));
    }
  };

  const handleConfirm = async () => {
    await onDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col" data-testid="delete-dialog">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Eliminar Variantes</DialogTitle>
          <DialogDescription>
            Selecciona las variantes que deseas eliminar ({selectedIds.size} seleccionadas)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div
            className="flex items-center justify-between p-3 border-b bg-gray-50"
            data-testid="select-all"
          >
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedIds.size === variants.length && variants.length > 0}
                onChange={handleSelectAll}
                className="w-5 h-5 cursor-pointer"
              />
              <span className="font-semibold text-secondary">Seleccionar todas</span>
            </label>
          </div>

          <div className="flex flex-col" data-testid="variant-list">
            {variants.map((variant) => (
              <label
                key={variant.id}
                className="flex items-center gap-3 p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(variant.id)}
                  onChange={() => handleToggle(variant.id)}
                  className="w-5 h-5 cursor-pointer"
                />
                <div className="flex items-center gap-3 flex-1" data-testid="variant">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-300 shrink-0"
                    style={{ backgroundColor: variant.color.hexCode }}
                    data-testid="variant-color"
                    title={variant.color.name}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-secondary" data-testid="variant-info">
                      Talla: {variant.size.name} · Color: {variant.color.name}
                    </div>
                    <div className="text-sm text-gray-500" data-testid="variant-aviability">
                      {variant.isAvailable ? 'Disponible' : 'No disponible'}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
            data-testid="cancel-button"
            className="font-bold"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            data-testid="delete-button"
            onClick={handleConfirm}
            disabled={isDeleting || selectedIds.size === 0}
            className="bg-destructive hover:bg-destructive/90 text-white font-bold"
          >
            {isDeleting ? 'Eliminando...' : `Eliminar ${selectedIds.size} variante(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UpdateVariantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  variants: ProductVariantDTO[];
  onUpdate: (changes: Array<{ id: string; isAvailable: boolean }>) => Promise<void>;
  isUpdating: boolean;
}

export function UpdateVariantsModal({
  isOpen,
  onClose,
  variants,
  onUpdate,
  isUpdating,
}: UpdateVariantsModalProps) {
  const [variantStates, setVariantStates] = useState<Record<string, boolean>>({});

  // Initialize variant states on modal open
  React.useEffect(() => {
    if (isOpen) {
      const initialStates: Record<string, boolean> = {};
      variants.forEach((v) => {
        initialStates[v.id] = v.isAvailable;
      });
      setVariantStates(initialStates);
    }
  }, [isOpen, variants]);

  const handleSwitchChange = (id: string, checked: boolean) => {
    setVariantStates((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const getChanges = () => {
    const changes: Array<{ id: string; isAvailable: boolean }> = [];
    variants.forEach((variant) => {
      if (variantStates[variant.id] !== variant.isAvailable) {
        changes.push({
          id: variant.id,
          isAvailable: variantStates[variant.id],
        });
      }
    });
    return changes;
  };

  const handleConfirm = async () => {
    const changes = getChanges();
    if (changes.length > 0) {
      await onUpdate(changes);
      setVariantStates({});
    }
  };

  const handleClose = () => {
    setVariantStates({});
    onClose();
  };

  const changes = getChanges();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-[80vh] flex flex-col"
        data-testid="availability-dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Gestionar Disponibilidad de Variantes
          </DialogTitle>
          <DialogDescription>
            Habilita o deshabilita variantes ({changes.length} cambios detectados).
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="flex items-center justify-between gap-3 p-4 border-b hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-gray-300 shrink-0"
                    style={{ backgroundColor: variant.color.hexCode }}
                    title={variant.color.name}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-secondary">
                      Talla: {variant.size.name} · Color: {variant.color.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {variantStates[variant.id] ? 'Disponible' : 'No disponible'}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={variantStates[variant.id] || false}
                  onCheckedChange={(checked) => handleSwitchChange(variant.id, checked)}
                  disabled={isUpdating}
                />
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUpdating}
            className="font-bold"
            data-testid="cancel-button"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isUpdating || changes.length === 0}
            data-testid="update-button"
            className="bg-secondary hover:bg-dark-secondary text-white font-bold"
          >
            {isUpdating ? 'Actualizando...' : `Aplicar ${changes.length} cambio(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
