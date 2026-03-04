'use client';

import { OutfitDTO, ProductDTO, Promotion } from '@/lib/api/types';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './button';
import { useRef, useEffect, useState } from 'react';
import { Share2, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Props {
  item: ProductDTO | OutfitDTO | Promotion;
  images?: string[];
  className?: string;
}

// ── Helpers ──

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  points: number,
  color: string
) {
  const inner = radius * 0.5;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? radius : inner;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

const loadImage = async (src: string): Promise<HTMLImageElement> => {
  const absoluteSrc = src.startsWith('/') ? window.location.origin + src : src;
  try {
    const res = await fetch(absoluteSrc);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = reject;
      img.src = objectUrl;
    });
  } catch {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.crossOrigin = 'anonymous';
      img.src = src;
    });
  }
};

export function ShareTo({ item, images, className }: Props) {
  const isPromotion = 'discountPercentage' in item;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [sharing, setSharing] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const backgroundImage =
    images && images.length > 0 ? images[0] : item.image || '/static/img/promotion_placeholder.png';

  const storeId = isPromotion
    ? (item as Promotion).storeId
    : 'storeId' in item
      ? (item as ProductDTO).storeId
      : (item as OutfitDTO).storefrontId;

  const storeUrl = `${process.env.NEXT_PUBLIC_WEB_URL}/stores/${storeId}`;

  const ACCENT = '#c65a3a';
  const padding = 60;

  const drawCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setLoading(true);
    setPreviewUrl('');

    canvas.width = 1080;
    canvas.height = 1920;

    // ── Background ──
    try {
      const bgImg = await loadImage(backgroundImage);

      // Blurred background
      const bgScale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
      ctx.filter = 'blur(30px) brightness(0.55)';
      ctx.drawImage(
        bgImg,
        (canvas.width - bgImg.width * bgScale) / 2,
        (canvas.height - bgImg.height * bgScale) / 2,
        bgImg.width * bgScale,
        bgImg.height * bgScale
      );
      ctx.filter = 'none';

      // Foreground image centered
      const fgScale = Math.min(canvas.width / bgImg.width, canvas.height / bgImg.height);
      const fgW = bgImg.width * fgScale;
      const fgH = bgImg.height * fgScale;
      ctx.drawImage(bgImg, (canvas.width - fgW) / 2, (canvas.height - fgH) / 2, fgW, fgH);
    } catch {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Dark gradient top
    const gradTop = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.4);
    gradTop.addColorStop(0, 'rgba(0,0,0,0.65)');
    gradTop.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradTop;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dark gradient bottom
    const gradBottom = ctx.createLinearGradient(0, canvas.height * 0.55, 0, canvas.height);
    gradBottom.addColorStop(0, 'rgba(0,0,0,0)');
    gradBottom.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = gradBottom;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (isPromotion) {
      const promo = item as Promotion;

      // ── TOP BADGE "¡Nueva promoción!" ──
      const badgeH = 110;
      const badgeY = 120;
      const badgeW = canvas.width - padding * 2;

      ctx.fillStyle = ACCENT;
      roundRect(ctx, padding, badgeY, badgeW, badgeH, 24);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 58px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('¡Nueva promoción!', canvas.width / 2, badgeY + 74);

      // ── PROMO NAME ──
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      roundRect(ctx, padding, badgeY + badgeH + 20, badgeW, 90, 16);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = '400 40px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(promo.name, canvas.width / 2, badgeY + badgeH + 78);

      // ── DISCOUNT STAR ──
      if (promo.discountPercentage > 0) {
        drawStar(ctx, canvas.width - 175, 460, 135, 8, ACCENT);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 60px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(`-${promo.discountPercentage}%`, canvas.width - 175, 480);
      }
    }

    // ── BOTTOM: URL + CTA ──
    const bottomY = canvas.height - 300;

    // CTA white bar
    const ctaY = bottomY + 72 + 24;
    const ctaH = 104;
    const ctaW = canvas.width - padding * 2;

    ctx.fillStyle = '#fff';
    roundRect(ctx, padding, ctaY, ctaW, ctaH, 20);
    ctx.fill();

    try {
      const logo = await loadImage(`${window.location.origin}/apple-touch-icon.png`);
      ctx.drawImage(logo, padding + 24, ctaY + 20, 64, 64);
    } catch {}

    ctx.fillStyle = ACCENT;
    ctx.font = 'bold 42px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('¡Compra ya en DondeSiempre!', canvas.width / 2 + 20, ctaY + 68);

    setPreviewUrl(canvas.toDataURL('image/jpeg', 0.92));
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => drawCanvas(), 100);
    } else {
      setPreviewUrl('');
      setLoading(false);
    }
  }, [open]);

  const handleShare = async () => {
    if (!canvasRef.current) return;
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

      // Solo fichero → Instagram y RRSS aparecen primero en el share sheet
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        // Fallback escritorio: descarga directa
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className={className}>
          Compartir {isPromotion ? 'promoción' : 'descuento'}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col w-full max-w-sm mx-auto max-h-[90dvh] p-0 gap-0 overflow-hidden">
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
            {!loading && !previewUrl && (
              <button
                onClick={drawCanvas}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/50 hover:text-white/80 transition-colors"
              >
                <div className="w-16 h-16 rounded-full border-2 border-white/20 hover:border-white/50 flex items-center justify-center transition-colors">
                  <Share2 size={24} />
                </div>
                <span className="text-sm">Generar vista previa</span>
              </button>
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
          {/* Copy URL */}
          {previewUrl && !loading && (
            <button
              onClick={() => navigator.clipboard.writeText(storeUrl)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 transition-colors text-xs text-zinc-600"
            >
              <span className="truncate flex-1 text-left">{storeUrl}</span>
              <span className="shrink-0 font-medium text-zinc-400">📋 Copiar</span>
            </button>
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
  );
}
