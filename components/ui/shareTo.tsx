'use client';

import { getWebUrl } from '@/lib/config';
import { PromotionDTO } from '@/lib/types/promotions/promotionsDto';
import { OutfitDTO } from '@/lib/types/outfits/outfitsDto';
import { ProductDTO } from '@/lib/types/products/productsDto';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './button';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Share2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { drawShareImage } from '@/lib/utils/canvas';
import { useActiveFetcher } from '@/lib/api/fetcher';
import { PremiumLimitDialog } from './premium-limit-dialog';

interface Props {
  item: ProductDTO | OutfitDTO | PromotionDTO;
  images?: string[];
  className?: string;
}

enum itemType {
  PROMOTION,
  PRODUCT,
  OUTFIT,
}

function checkType(item: Props['item']) {
  const res =
    'isActive' in item ? itemType.PROMOTION : 'index' in item ? itemType.OUTFIT : itemType.PRODUCT;
  return res;
}

function getBackgroundImage(item: Props['item'], images?: string[]): string {
  if (images && images.length > 0) return images[0];
  if ('image' in item && item.image) return item.image;
  if ('products' in item && typeof item.products[0] === 'object' && 'image' in item.products[0]) {
    if (item.products[0].image !== null) return item.products[0].image;
  }
  return '/static/img/promotion_placeholder.png';
}

function getDrawOptions(item: Props['item'], typeValue: itemType) {
  const badgeTitle = '¡Nueva promoción!';
  const discount: number = item.discountPercentage ? item.discountPercentage : 0;
  item = item as PromotionDTO | ProductDTO;
  return {
    badgeTitle: badgeTitle,
    itemName: item.name,
    discountPercentage: discount,
  };
}

export function ShareTo({ item, images, className }: Props) {
  const typeValue = checkType(item);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [sharing, setSharing] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [premiumIsOpen, setPremiumIsOpen] = useState(false);
  const createShare = useActiveFetcher<void>({
    url: `promotions/${item.id}/share`,
    method: 'POST',
    onError: () => setPremiumIsOpen(true),
  });

  const backgroundImage = getBackgroundImage(item, images);
  const shareUrl = `${getWebUrl()}/stores/${item.storeId}`; // LO SUYO SERÁ CAMBIARLO POR LA URL DEL PRODUCTO, OUTFIT O PROMO
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    console.log('Click en copiar');
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Fallback por si falla el clipboard
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };
  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setLoading(true);
    setPreviewUrl('');

    try {
      const url = await drawShareImage({
        canvas,
        backgroundImage,
        logoUrl: `${getWebUrl()}/apple-touch-icon.png`,
        ...getDrawOptions(item, typeValue),
      });
      setPreviewUrl(url);
    } catch (err) {
      console.error('Error generando imagen:', err);
    } finally {
      setLoading(false);
    }
  }, [backgroundImage, item, typeValue]);

  useEffect(() => {
    if (open) {
      const timeoutId = window.setTimeout(() => {
        void drawCanvas();
      }, 100);

      return () => window.clearTimeout(timeoutId);
    } else {
      setPreviewUrl('');
      setLoading(false);
    }
  }, [open, drawCanvas]);

  const handleShare = async () => {
    if (!canvasRef.current) return;
    try {
      await createShare.fetch();
    } catch (_err) {
      console.log('Free limit reached!');
      return;
    }
    setSharing(true);
    try {
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvasRef.current!.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Canvas vacío'))),
          'image/jpeg',
          0.92
        )
      );
      const file = new File([blob], 'promocion.jpg', { type: 'image/jpeg' });
      const shareText = `Disponible en: ${shareUrl}`;

      if (navigator.canShare?.({ files: [file], text: shareText })) {
        await navigator.share({ files: [file], text: shareText });
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'promocion.jpg';
        a.click();
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') console.error(err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" className={className}>
            Compartir promoción
          </Button>
        </DialogTrigger>
        <DialogContent
          className="flex flex-col w-full max-w-sm mx-auto max-h-[90dvh] p-0 gap-0 overflow-hidden"
          data-testid="share-promotion-modal"
        >
          <div className="flex flex-col gap-3 overflow-y-auto p-4 flex-1">
            <DialogHeader>
              <DialogTitle className="text-base">Vista previa de publicación</DialogTitle>
            </DialogHeader>

            <canvas ref={canvasRef} className="fixed -left-2499.75 -top-2499.75" />

            <div
              className="relative overflow-hidden rounded-xl bg-black mx-auto"
              style={{ width: 'min(100%, 45dvh)', aspectRatio: '9/16' }}
            >
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/50 text-sm z-10">
                  <Loader2 size={32} className="animate-spin text-white/70" />
                  <span>Generando imagen...</span>
                </div>
              )}
              {previewUrl && !loading && (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center scale-110"
                    style={{
                      backgroundImage: `url(${previewUrl})`,
                      filter: 'blur(16px) brightness(0.5)',
                    }}
                  />
                  <Image
                    src={previewUrl}
                    alt="Vista previa"
                    className="relative w-full h-full object-contain"
                    width={1080}
                    height={1920}
                  />
                </>
              )}
            </div>

            <p>Enlace a la tienda:</p>
            {previewUrl && !loading && (
              <div className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-zinc-100 text-xs text-zinc-600">
                <span className="truncate flex-1 text-left">{shareUrl}</span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 font-medium px-2 py-1 rounded-md transition-colors"
                  style={{
                    border: '1px solid #c65a3a',
                    color: copied ? '#c65a3a' : '#a1a1aa',
                  }}
                >
                  {copied ? '📋 Copiado' : '📋 Copiar'}
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2 p-4 border-t border-zinc-100 shrink-0">
            <DialogClose asChild>
              <Button variant="secondary" className="flex-1">
                Cerrar
              </Button>
            </DialogClose>
            <Button
              onClick={handleShare}
              disabled={!previewUrl || sharing || loading}
              className="flex-1 gap-2 text-white"
            >
              {sharing ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
              {sharing ? 'Compartiendo...' : 'Compartir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <PremiumLimitDialog open={premiumIsOpen} onOpenChange={setPremiumIsOpen} />
    </>
  );
}
