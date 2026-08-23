import cuisinesPhoto from '../assets/photos/feature-cuisines.jpg';
import dietPhoto from '../assets/photos/feature-diet.jpg';
import timePhoto from '../assets/photos/feature-time.jpg';

const FEATURES = [
  {
    image: cuisinesPhoto,
    title: 'Receitas do mundo todo',
    text: 'Quer algo italiano, tailandês ou mexicano? Escolha a culinária e o Remi filtra pra você — sem precisar sair procurando.',
  },
  {
    image: dietPhoto,
    title: 'Do jeito que você come',
    text: 'Vegana, vegetariana, sem lactose ou sem glúten: os filtros de dieta e restrição garantem receitas que combinam com sua rotina.',
  },
  {
    image: timePhoto,
    title: 'No tempo que você tem',
    text: 'Rápido, médio ou demorado — e um nível de dificuldade estimado pra você já saber no que está se metendo antes de começar.',
  },
];

export default function FeatureShowcase() {
  return (
    <section className="feature-showcase">
      {FEATURES.map(({ image, title, text }, idx) => (
        <div className={`feature-row ${idx % 2 === 1 ? 'feature-row-reverse' : ''}`} key={title}>
          <div className="feature-visual">
            <img src={image} alt="" loading="lazy" />
          </div>
          <div className="feature-text">
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
