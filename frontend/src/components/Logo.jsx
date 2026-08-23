import ClocheIcon from './ClocheIcon';

const ICON_SIZE = { sm: 30, md: 44, lg: 64 };

// variant "light" = pra fundo escuro (hero, nav); "dark" = pra fundo claro.
export default function Logo({ variant = 'dark', size = 'md', showTagline = false }) {
  return (
    <div className={`logo logo-${variant} logo-${size}`}>
      <ClocheIcon size={ICON_SIZE[size]} className="logo-icon" />
      <div className="logo-text">
        <span className="logo-word">
          remi<span className="logo-dot" aria-hidden="true" />
        </span>
        {showTagline && <span className="logo-tagline">O que você tem, vira receita.</span>}
      </div>
    </div>
  );
}
