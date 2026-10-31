import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import { useId, useState, type InputHTMLAttributes } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  error?: string | null;
}

export function FormField({ label, icon: Icon, error, type = 'text', ...input }: FormFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="field-control">
        <Icon size={18} className="field-icon" aria-hidden="true" />
        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...input}
        />
        {isPassword && (
          <button
            type="button"
            className="field-toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
