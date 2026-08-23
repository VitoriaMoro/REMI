import Hero from './Hero';
import HowItWorks from './HowItWorks';
import FeatureShowcase from './FeatureShowcase';

export default function Home({ onStartSearch }) {
  return (
    <>
      <Hero onCtaClick={onStartSearch} />

      <div className="page">
        <HowItWorks />
        <FeatureShowcase />

        <section className="home-final-cta">
          <h2>Bora ver o que dá pra cozinhar hoje?</h2>
          <button type="button" className="hero-cta hero-cta-solid" onClick={onStartSearch}>
            Achar receita
          </button>
        </section>
      </div>
    </>
  );
}
