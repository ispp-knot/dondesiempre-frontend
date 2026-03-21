import { getWebUrl } from '../config';

const ACCENT = '#c65a3a';
const CANVAS_W = 1080;
const CANVAS_H = 1920;
const PADDING = 60;

export interface DrawShareImageOptions {
  canvas: HTMLCanvasElement;
  backgroundImage: string;
  badgeTitle?: string;
  itemName?: string;
  discountPercentage?: number;
  ctaText?: string;
  logoUrl?: string;
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

async function loadImage(src: string): Promise<HTMLImageElement> {
  const absoluteSrc = src.startsWith('/') ? getWebUrl() + src : src;
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
}

// ── Función principal ──

export async function drawShareImage({
  canvas,
  backgroundImage,
  badgeTitle,
  itemName,
  discountPercentage,
  ctaText = '¡Compra ya en DondeSiempre!',
  logoUrl,
}: DrawShareImageOptions): Promise<string> {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo obtener el contexto del canvas');

  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  // ── Background ──
  try {
    const bgImg = await loadImage(backgroundImage);

    const bgScale = Math.max(CANVAS_W / bgImg.width, CANVAS_H / bgImg.height);
    ctx.filter = 'blur(30px) brightness(0.55)';
    ctx.drawImage(
      bgImg,
      (CANVAS_W - bgImg.width * bgScale) / 2,
      (CANVAS_H - bgImg.height * bgScale) / 2,
      bgImg.width * bgScale,
      bgImg.height * bgScale
    );
    ctx.filter = 'none';

    const fgScale = Math.min(CANVAS_W / bgImg.width, CANVAS_H / bgImg.height);
    const fgW = bgImg.width * fgScale;
    const fgH = bgImg.height * fgScale;
    ctx.drawImage(bgImg, (CANVAS_W - fgW) / 2, (CANVAS_H - fgH) / 2, fgW, fgH);
  } catch {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  // ── Gradientes oscuros ──
  const gradTop = ctx.createLinearGradient(0, 0, 0, CANVAS_H * 0.4);
  gradTop.addColorStop(0, 'rgba(0,0,0,0.65)');
  gradTop.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradTop;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  const gradBottom = ctx.createLinearGradient(0, CANVAS_H * 0.55, 0, CANVAS_H);
  gradBottom.addColorStop(0, 'rgba(0,0,0,0)');
  gradBottom.addColorStop(1, 'rgba(0,0,0,0.8)');
  ctx.fillStyle = gradBottom;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // ── Badge superior (opcional) ──
  if (badgeTitle) {
    const badgeH = 110;
    const badgeY = 120;
    const badgeW = CANVAS_W - PADDING * 2;

    ctx.fillStyle = ACCENT;
    roundRect(ctx, PADDING, badgeY, badgeW, badgeH, 24);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 58px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(badgeTitle, CANVAS_W / 2, badgeY + 74);

    // ── Nombre del item ──
    if (itemName) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      roundRect(ctx, PADDING, badgeY + badgeH + 20, badgeW, 90, 16);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = '400 40px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(itemName, CANVAS_W / 2, badgeY + badgeH + 78);
    }

    // ── Estrella de descuento ──
    if (discountPercentage && discountPercentage > 0) {
      drawStar(ctx, CANVAS_W - 175, 460, 135, 8, ACCENT);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 60px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(`-${discountPercentage}%`, CANVAS_W - 175, 480);
    }
  }

  // ── CTA inferior ──
  const ctaY = CANVAS_H - 300 + 72 + 24;
  const ctaH = 104;
  const ctaW = CANVAS_W - PADDING * 2;

  ctx.fillStyle = '#fff';
  roundRect(ctx, PADDING, ctaY, ctaW, ctaH, 20);
  ctx.fill();

  if (logoUrl) {
    try {
      const logo = await loadImage(logoUrl);
      ctx.drawImage(logo, PADDING + 24, ctaY + 20, 64, 64);
    } catch {}
  }

  ctx.fillStyle = ACCENT;
  ctx.font = 'bold 42px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(ctaText, CANVAS_W / 2 + 20, ctaY + 68);

  return canvas.toDataURL('image/jpeg', 0.92);
}
