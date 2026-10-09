const STEPS = [
  { title: 'Sube tu foto', text: 'Comparte el enlace de una foto de tu dormitorio, sala, cocina u otro espacio.' },
  { title: 'Define tu estilo', text: 'Moderno, nórdico, industrial, bohemio o minimalista, con tu presupuesto y paleta.' },
  { title: 'Recibe la propuesta', text: 'La IA analiza el espacio y devuelve una imagen remodelada con sugerencias.' },
];

export function HowItWorks() {
  return (
    <section className="section" id="como-funciona">
      <span className="kicker">Proceso</span>
      <h2 className="section-title">Tres pasos, <em>un nuevo espacio</em></h2>
      <div className="steps">
        {STEPS.map((step, i) => (
          <article key={step.title} className="step">
            <span className="step-number">{String(i + 1).padStart(2, '0')}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
