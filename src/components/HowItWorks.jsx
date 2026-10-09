const STEPS = [
  { icon: '📸', title: 'Sube tu foto', text: 'Pega el enlace de una foto de tu dormitorio, sala, cocina u otro espacio.' },
  { icon: '🎨', title: 'Elige tu estilo', text: 'Moderno, nórdico, industrial, bohemio o minimalista, con tu presupuesto y colores.' },
  { icon: '🪄', title: 'Recibe la propuesta', text: 'La IA analiza el espacio y te devuelve una imagen remodelada y sugerencias.' },
];

export function HowItWorks() {
  return (
    <section className="section" id="como-funciona">
      <h2 className="section-title">Cómo funciona</h2>
      <div className="steps">
        {STEPS.map((step, i) => (
          <article key={step.title} className="step card">
            <span className="step-number">{i + 1}</span>
            <span className="step-icon">{step.icon}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
