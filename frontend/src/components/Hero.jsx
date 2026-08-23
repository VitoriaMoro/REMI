import ClocheIcon from './ClocheIcon';
import heroImage from '../assets/photos/hero-bowls.jpg';

export default function Hero({ onCtaClick }) {
  return (
    <section className="hero" style={{ backgroundImage: `url(${heroImage})` }}>
      <div className="hero-overlay" />
      <div className="hero-content">
        <ClocheIcon className="hero-icon" />
        <p className="hero-slogan">O que você tem, vira receita.</p>
        <button type="button" className="hero-cta" onClick={onCtaClick}>
          Ache a sua receita
        </button>
      </div>
    </section>
  );
}
