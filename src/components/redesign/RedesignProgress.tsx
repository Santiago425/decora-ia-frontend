import { useEffect, useState } from 'react';
import { config } from '../../config';

const STEPS = [
  'Subiendo tu foto…',
  'Analizando la luz y el espacio…',
  'Eligiendo muebles y materiales…',
  'Pintando tu nuevo espacio…',
  'Dando los últimos toques…',
];

export function RedesignProgress({ preview }: { preview: string | null }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="redesign-progress" role="status">
      <div className="progress-frame">
        {preview && <img src={preview} alt="" />}
        <div className="progress-scan" />
      </div>
      <div className="progress-text">
        <span className="lumi-orb" aria-hidden="true" />
        <div>
          <strong>{STEPS[step]}</strong>
          <small>{config.assistantName} está trabajando en tu diseño</small>
        </div>
      </div>
      <ol className="progress-steps">
        {STEPS.map((label, index) => (
          <li key={label} className={index < step ? 'done' : index === step ? 'current' : ''} />
        ))}
      </ol>
    </div>
  );
}
