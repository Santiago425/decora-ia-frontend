import { Camera, Check, House, Palette, WandSparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  Icon: LucideIcon;
  title: string;
  detail: string;
  done: boolean;
}

interface RedesignSummaryProps {
  hasPhoto: boolean;
  roomName?: string;
  styleName?: string;
  paletteName?: string;
  budget: string;
}

/** Shows where the person is in the four steps and what will be sent, so the empty column has a purpose. */
export function RedesignSummary({ hasPhoto, roomName, styleName, paletteName, budget }: RedesignSummaryProps) {
  const steps: Step[] = [
    {
      Icon: Camera,
      title: 'Tu foto',
      detail: hasPhoto ? 'Lista para rediseñar' : 'Súbela o tómala con la cámara',
      done: hasPhoto,
    },
    {
      Icon: House,
      title: 'Habitación',
      detail: roomName ?? 'Elige qué espacio es',
      done: Boolean(roomName),
    },
    {
      Icon: Palette,
      title: 'Estilo',
      detail: styleName ? `${styleName}${paletteName ? ` · ${paletteName}` : ''}` : 'Elige estilo y colores',
      done: Boolean(styleName),
    },
    {
      Icon: WandSparkles,
      title: 'Resultado',
      detail: budget ? `Con presupuesto de ${budget}` : 'Antes y después, con sugerencias y presupuesto',
      done: false,
    },
  ];

  const progress = steps.filter((step) => step.done).length / steps.length;

  return (
    <div className="redesign-steps-wrap">
      <div
        className="redesign-progress-bar"
        role="progressbar"
        aria-label="Avance del rediseño"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={steps.filter((step) => step.done).length}
      >
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
      <ol className="redesign-steps" aria-label="Pasos del rediseño">
        {steps.map(({ Icon, title, detail, done }, index) => (
          <li key={title} className={done ? 'done' : ''}>
            <span className="redesign-step-icon" aria-hidden="true">
              {done ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
            </span>
            <div>
              <strong>
                {index + 1}. {title}
              </strong>
              <small>{detail}</small>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
