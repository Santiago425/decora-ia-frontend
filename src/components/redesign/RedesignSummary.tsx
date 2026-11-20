import { Camera, Check, Palette, WandSparkles } from 'lucide-react';
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

/** Shows where the person is in the three steps and what will be sent, so the empty column has a purpose. */
export function RedesignSummary({ hasPhoto, roomName, styleName, paletteName, budget }: RedesignSummaryProps) {
  const choice = [roomName, styleName].filter(Boolean).join(' · ');
  const steps: Step[] = [
    {
      Icon: Camera,
      title: 'Tu foto',
      detail: hasPhoto ? 'Lista para rediseñar' : 'Súbela o tómala con la cámara',
      done: hasPhoto,
    },
    {
      Icon: Palette,
      title: 'Estilo y colores',
      detail: choice ? `${choice}${paletteName ? ` · ${paletteName}` : ''}` : 'Elige habitación y estilo',
      done: Boolean(choice),
    },
    {
      Icon: WandSparkles,
      title: 'Resultado',
      detail: budget ? `Con presupuesto de ${budget}` : 'Antes y después, con sugerencias y presupuesto',
      done: false,
    },
  ];

  return (
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
  );
}
