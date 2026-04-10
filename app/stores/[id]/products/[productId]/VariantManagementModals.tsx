'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Eliminar Variantes</DialogTitle>
          <DialogDescription>
            Selecciona las variantes que deseas eliminar ({selectedIds.size} seleccionadas)
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b bg-gray-50">
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

          <div className="flex flex-col">
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
            className="font-bold"
          >
            Cancelar
          </Button>
          <Button
            type="button"
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
  onUpdate: (variantIds: string[], isAvailable: boolean) => Promise<void>;
  isUpdating: boolean;
}

export function UpdateVariantsModal({
  isOpen,
  onClose,
  variants,
  onUpdate,
  isUpdating,
}: UpdateVariantsModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<'activate' | 'deactivate'>('activate');

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
    await onUpdate(Array.from(selectedIds), action === 'activate');
    setSelectedIds(new Set());
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            {action === 'activate' ? 'Activar' : 'Desactivar'} Variantes
          </DialogTitle>
          <DialogDescription>
            Selecciona las variantes que deseas {action === 'activate' ? 'activar' : 'desactivar'} (
            {selectedIds.size} seleccionadas)
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
          <label className="font-semibold text-secondary">Acción:</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAction('activate')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                action === 'activate'
                  ? 'bg-secondary text-white'
                  : 'bg-white border border-gray-300 text-secondary hover:border-secondary'
              }`}
            >
              Activar
            </button>
            <button
              type="button"
              onClick={() => setAction('deactivate')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                action === 'deactivate'
                  ? 'bg-secondary text-white'
                  : 'bg-white border border-gray-300 text-secondary hover:border-secondary'
              }`}
            >
              Desactivar
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b bg-gray-50">
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

          <div className="flex flex-col">
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
                      Estado actual: {variant.isAvailable ? 'Disponible' : 'No disponible'}
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
            disabled={isUpdating}
            className="font-bold"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isUpdating || selectedIds.size === 0}
            className="bg-secondary hover:bg-dark-secondary text-white font-bold"
          >
            {isUpdating
              ? 'Actualizando...'
              : `${action === 'activate' ? 'Activar' : 'Desactivar'} ${selectedIds.size} variante(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
