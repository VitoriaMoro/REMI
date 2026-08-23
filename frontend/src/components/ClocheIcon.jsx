// Redoma de servir (cloche) — o ícone da logo do Remi: o que você tem,
// escondido embaixo, "vira receita" quando a tampa é levantada.
export default function ClocheIcon({ size = 40, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="24" cy="7" r="2" />
      <line x1="24" y1="9" x2="24" y2="12" />
      <path d="M8 30C8 19 15 12 24 12s16 7 16 18" />
      <line x1="5" y1="30" x2="43" y2="30" />
      <path d="M9 34h30" />
    </svg>
  );
}
