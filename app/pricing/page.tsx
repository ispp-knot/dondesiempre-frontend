import { CheckCircle2, Zap, Share2, HelpCircle, Sparkles } from 'lucide-react';
import { Plan, PlanCard } from '../../components/dondeSiempre/PlanCard';

// ─── Colores de marca DondeSiempre ───────────────────────────────────────────

// ─── Plan data ────────────────────────────────────────────────────────────────

const plans: Plan[] = [
  {
    id: 'base',
    name: 'Base',
    price: 'Gratis',
    priceNote: '',
    commission: '5%',
    cta: 'Ya obtenido al registrarse',
    accentColor: '#4db8b0',
    features: [
      { label: 'Tienda online en dondesiempre', icon: <CheckCircle2 size={14} />, highlight: true },
      {
        label: 'Gestión de productos ilimitados',
        icon: <CheckCircle2 size={14} />,
        highlight: true,
      },
      { label: 'Pasarela de pagos integrada', icon: <CheckCircle2 size={14} />, highlight: true },
      { label: 'Panel de pedidos y clientes', icon: <CheckCircle2 size={14} />, highlight: true },
      {
        label: 'Automatización de Redes Sociales limitada a dos publicaciones por mes',
        icon: <Share2 size={14} />,
        highlight: true,
        tooltip: 'Publica automáticamente en Instagram, Facebook y más.',
      },
      {
        label: '5% de comisión en cada venta',
        tooltip: 'Se descuenta automáticamente del importe neto de cada transacción.',
        icon: <HelpCircle size={14} />,
        highlight: true,
      },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    badge: 'Recomendado',
    price: '30 €',
    priceNote: '/ mes',
    commission: '2%',
    cta: 'Hazte Premium',
    accentColor: '#c65a3a',
    isPremium: true,
    features: [
      { label: 'Todo lo incluido en Base', icon: <CheckCircle2 size={14} />, highlight: true },
      {
        label: 'Sin permanencia ni costes fijos',
        icon: <CheckCircle2 size={14} />,
        highlight: true,
      },
      {
        label: 'Comisión reducida al 2%',
        icon: <Zap size={14} />,
        highlight: true,
      },
      {
        label: 'Automatización de Redes Sociales ilimitada',
        icon: <Share2 size={14} />,
        highlight: true,
        tooltip: 'Publica automáticamente en Instagram, Facebook y más.',
      },
      {
        label: 'Acceso anticipado a nuevas funciones',
        icon: <Sparkles size={14} />,
        highlight: true,
      },
    ],
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center px-6 py-20"
      style={{ background: '#f7f7f8', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
    >
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Dot pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(#4db8b018 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Eyebrow */}
      <p
        className="relative z-10 flex items-center gap-2 mb-4 text-xs font-semibold tracking-widest uppercase"
        style={{ color: '#4db8b0' }}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#4db8b0' }} />
        Planes y precios
        <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#4db8b0' }} />
      </p>

      {/* Title */}
      <h1
        className="relative z-10 text-center font-extrabold tracking-tight mb-4 leading-tight"
        style={{ fontSize: 'clamp(28px, 5vw, 44px)', color: '#1a1a1a' }}
      >
        Elige el plan que
        <br />
        <span style={{ color: '#c65a3a' }}>impulse tu tienda</span>
      </h1>

      {/* Subtitle */}
      <p
        className="relative z-10 text-center text-sm mb-14 max-w-sm leading-relaxed"
        style={{ color: '#888' }}
      >
        Empieza gratis sin riesgos y escala cuando estés listo.Sin permanencias, sin letra pequeña.
      </p>

      {/* Cards grid */}
      <div
        className="relative z-10 w-full grid gap-5 justify-center"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(295px, 365px))', maxWidth: 790 }}
      >
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {/* Footnote */}
      <p
        className="relative z-10 mt-12 text-xs text-center leading-loose"
        style={{ color: '#bbb' }}
      >
        IVA incluido · Comisión aplicada sobre el importe neto de cada venta
        <br />
      </p>
    </main>
  );
}
