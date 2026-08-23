import { FridgeIcon, SlidersIcon, HeartBookIcon } from './Icons';

const STEPS = [
  {
    Icon: FridgeIcon,
    title: '1. Diga o que você tem',
    text: 'Liste os ingredientes que estão na sua geladeira ou despensa agora mesmo.',
  },
  {
    Icon: SlidersIcon,
    title: '2. Filtre do seu jeito',
    text: 'Culinária, dieta, restrições, tempo de preparo e dificuldade — só o que faz sentido pra você.',
  },
  {
    Icon: HeartBookIcon,
    title: '3. Descubra e favorite',
    text: 'Veja as receitas ordenadas pelo que você já tem em casa e guarde as favoritas.',
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works">
      <h2 className="section-title section-title-center">Como funciona</h2>
      <div className="steps-grid">
        {STEPS.map(({ Icon, title, text }) => (
          <div className="step-card" key={title}>
            <div className="step-icon">
              <Icon />
            </div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
