// Conjunto de ícones de linha (currentColor) usados na página inicial —
// ilustrações simples em vez de fotos, pra não depender de imagens de
// terceiros com direitos autorais.

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function FridgeIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" {...base} aria-hidden="true">
      <rect x="10" y="4" width="28" height="40" rx="4" />
      <line x1="10" y1="20" x2="38" y2="20" />
      <line x1="16" y1="10" x2="16" y2="15" />
      <line x1="16" y1="26" x2="16" y2="31" />
    </svg>
  );
}

export function SlidersIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" {...base} aria-hidden="true">
      <line x1="8" y1="14" x2="40" y2="14" />
      <line x1="8" y1="24" x2="40" y2="24" />
      <line x1="8" y1="34" x2="40" y2="34" />
      <circle cx="18" cy="14" r="3.5" fill="#fff" />
      <circle cx="30" cy="24" r="3.5" fill="#fff" />
      <circle cx="20" cy="34" r="3.5" fill="#fff" />
    </svg>
  );
}

export function HeartBookIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" {...base} aria-hidden="true">
      <path d="M10 6h22a4 4 0 0 1 4 4v32l-15-6-15 6V10a4 4 0 0 1 4-4Z" />
      <path d="M24 26c-4-3.2-7-5.6-7-9 0-2.3 1.8-4 4-4 1.6 0 2.7.8 3 2 .3-1.2 1.4-2 3-2 2.2 0 4 1.7 4 4 0 3.4-3 5.8-7 9Z" />
    </svg>
  );
}

export function GlobeIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" {...base} aria-hidden="true">
      <circle cx="24" cy="24" r="18" />
      <ellipse cx="24" cy="24" rx="8" ry="18" />
      <line x1="6" y1="24" x2="42" y2="24" />
    </svg>
  );
}

export function LeafIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" {...base} aria-hidden="true">
      <path d="M10 38C6 22 18 8 38 8c2 20-10 32-28 30Z" />
      <path d="M12 36c6-8 12-14 22-22" />
    </svg>
  );
}

export function ClockBadgeIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" {...base} aria-hidden="true">
      <circle cx="24" cy="26" r="16" />
      <path d="M24 18v8l6 4" />
      <path d="M18 6h12" />
    </svg>
  );
}
