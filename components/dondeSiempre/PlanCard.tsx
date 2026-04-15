'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, CheckCircle2, X, Mail, Clipboard } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { useAuth } from '../../lib/auth/AuthContext'; // ajusta la ruta si es diferente
import Link from 'next/link';

export interface Feature {
  label: string;
  tooltip?: string;
  icon?: ReactNode;
  highlight?: boolean;
}
export interface Plan {
  id: string;
  name: string;
  badge?: string;
  price: string;
  priceNote: string;
  commission: string;
  cta: string;
  features: Feature[];
  accentColor: string;
  isPremium?: boolean;
}
// ─── CommissionBadge ──────────────────────────────────────────────────────────

function CommissionBadge({ value, color }: { value: string; color: string }) {
  return (
    <div
      className="inline-flex flex-col mt-4 rounded-xl px-4 py-2.5"
      style={{
        background: `${color}12`,
        border: `1px solid ${color}30`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <span
        className="font-extrabold leading-none"
        data-testid="plan-commission"
        style={{ fontSize: 26, color, letterSpacing: '-0.02em' }}
      >
        {value}
      </span>
      <span className="text-xs mt-1 font-medium" style={{ color: '#999' }}>
        comisión por venta
      </span>
    </div>
  );
}

// ─── FeatureRow ───────────────────────────────────────────────────────────────

function FeatureRow({ feature }: { feature: Feature }) {
  const row = (
    <li
      className="flex items-start gap-2.5 text-sm leading-snug"
      style={{
        color: feature.highlight ? '#1a1a1a' : '#888',
        fontWeight: feature.highlight ? 500 : 400,
        cursor: feature.tooltip ? 'help' : 'default',
      }}
    >
      <span className="shrink-0 mt-px" style={{ color: feature.highlight ? '#19756a' : '#ccc' }}>
        {feature.icon}
      </span>
      {feature.label}
    </li>
  );

  if (!feature.tooltip) return row;

  return (
    <TooltipProvider delayDuration={200} data-testid="feature-tooltip">
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{row}</div>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="text-xs max-w-[220px] leading-snug rounded-lg"
          style={{ background: '#1a1a1a', color: '#e5e5e5', border: 'none' }}
        >
          {feature.tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────

export function PlanCard({ plan }: { plan: Plan }) {
  const [showModal, setShowModal] = useState(false);

  const [copied, setCopied] = useState(false);

  const { getCurrentUser } = useAuth();
  const isLoggedIn = !!getCurrentUser();

  const handleCopy = () => {
    navigator.clipboard.writeText('dondesiempreispp+ventas@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* ── Modal Premium ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.35)' }}
          onClick={() => setShowModal(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowModal(false)}
          role="button"
          tabIndex={0}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl p-8 flex flex-col items-center text-center gap-4"
            style={{ background: '#fff', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Cerrar */}
            <button
              className="absolute top-4 right-4 rounded-full p-1 cursor-pointer transition-colors hover:bg-gray-100"
              onClick={() => setShowModal(false)}
            >
              <X size={16} color="#aaa" data-testid="plan-modal-close" />
            </button>

            {/* Icono */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: '#e0705015' }}
            >
              <Mail size={26} color="#e07050" />
            </div>
            {/* Texto */}
            <h2 className="text-lg font-extrabold" style={{ color: '#1a1a1a' }}>
              Hazte Premium
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#888' }}>
              Para activar el plan Premium mándanos un correo y te ayudamos a configurarlo en
              minutos.
            </p>

            {/* Botón email */}
            <button
              className="w-full h-11 flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer px-3"
              style={{ background: '#e07050', color: '#fff', border: 'none' }}
              onClick={handleCopy}
              onMouseEnter={(e) => {
                if (!copied) (e.currentTarget as HTMLButtonElement).style.background = '#d05f3f';
              }}
              onMouseLeave={(e) => {
                if (!copied) (e.currentTarget as HTMLButtonElement).style.background = '#e07050';
              }}
            >
              {copied ? (
                <>
                  <CheckCircle2 size={14} />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Mail size={14} />
                  <span className="truncate">dondesiempreispp+ventas@gmail.com</span>
                  <Clipboard size={14} style={{ opacity: 0.75 }} /> Copiar{' '}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Card ── */}
      <div
        className="flex flex-col rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
        data-testid={`plan-card-${plan.id}`}
        style={{
          background: '#fff',
          border: plan.isPremium ? '1.5px solid #e07050' : '1.5px solid #4db8b0',
          boxShadow: plan.isPremium ? '0 4px 24px rgba(224,112,80,0.13)' : 'none',
        }}
      >
        {/* Top stripe */}
        <div
          className="h-1 w-full"
          style={{ background: plan.isPremium ? '#e07050' : '#4db8b0' }}
        />
        {/* Body */}
        <div className="flex-1 px-6 pt-6">
          {/* Name + badge */}
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: '#aaa' }}
              data-testid="plan-name"
            >
              {plan.name}
            </span>
            {plan.badge && (
              <span
                className="text-xs font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full"
                style={{ background: '#e07050', color: '#fff' }}
                data-testid="plan-badge"
              >
                {plan.badge}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mt-3">
            <span
              className="font-extrabold leading-none"
              data-testid="plan-price"
              style={{ fontSize: 40, color: '#1a1a1a', letterSpacing: '-0.04em' }}
            >
              {plan.price}
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: '#bbb' }}
              data-testid="plan-price-note"
            >
              {plan.priceNote}
            </span>
          </div>

          {/* Commission */}
          <CommissionBadge value={plan.commission} color={plan.accentColor} />

          {/* Separator */}
          <div className="my-5 h-px" style={{ background: '#f0f0f0' }} />

          {/* Features */}
          <ul className="flex flex-col gap-2.5" data-testid="plan-features">
            {plan.features.map((feature, i) => (
              <FeatureRow key={i} feature={feature} />
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="p-6">
          {plan.isPremium ? (
            <button
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-bold cursor-pointer transition-all duration-150"
              style={{ background: '#e07050', color: '#fff', border: 'none' }}
              data-testid="plan-button-premium"
              onClick={() => setShowModal(true)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#d05f3f';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#e07050';
              }}
            >
              {plan.cta}
              <ArrowRight size={15} />
            </button>
          ) : isLoggedIn ? (
            <div
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold"
              style={{ color: '#4db8b0', border: '1.5px solid #4db8b0', background: '#4db8b010' }}
              data-testid="plan-button-base-logged-in"
            >
              <CheckCircle2 size={15} />
              {plan.cta}
            </div>
          ) : (
            <Link
              href="/register"
              data-testid="plan-button-base"
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-150"
              style={{ background: '#4db8b0', color: '#fff', textDecoration: 'none' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = '#3aa39b';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = '#4db8b0';
              }}
            >
              Crear cuenta gratis
              <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
