import { Brush, Eraser, Layers, Sofa, WandSparkles, X, type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { redesignService } from '../../services/redesignService';
import type { EditField, SuggestedColor } from '../../types/redesign';
import { initialValues, isEditReady } from '../../utils/editTools';
import { ImageProxy } from '../ImageProxy';
import { Button, Skeleton } from '../ui';

const ICONS: Record<string, LucideIcon> = {
  wall_paint: Brush,
  floor_swap: Layers,
  remove_object: Eraser,
  replace_furniture: Sofa,
};

interface Props {
  colors: SuggestedColor[];
  alert: ReactNode;
  onApply: (tool: string, values: Record<string, string>) => void;
  onClose: () => void;
}

export function EditPanel({ colors, alert, onApply, onClose }: Props) {
  const tools = useAsync(useCallback(() => redesignService.editTools(), []));
  const [toolKey, setToolKey] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const tool = tools.data?.find((item) => item.key === toolKey);
  const firstColor = colors[0]?.hex.toLowerCase();

  useEffect(() => {
    if (!toolKey && tools.data?.length) setToolKey(tools.data[0].key);
  }, [tools.data, toolKey]);

  useEffect(() => {
    setValues(initialValues(tool, firstColor));
  }, [tool, firstColor]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (tool && isEditReady(tool, values)) onApply(tool.key, values);
  }

  const setValue = (key: string, value: string) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <form className="redesign-tuning edit-panel" onSubmit={handleSubmit}>
      <header>
        <div>
          <h2>Editar una parte</h2>
          <p>Cambiamos solo lo que elijas y el resto de la foto queda igual. Se guarda como versión nueva.</p>
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>
      </header>

      {tools.loading && <Skeleton className="edit-tools-skeleton" />}
      {tools.error && (
        <p className="form-alert" role="alert">
          {tools.error}
        </p>
      )}

      {tools.data && (
        <div className="edit-tools" role="group" aria-label="Herramienta de edición">
          {tools.data.map((item) => {
            const Icon = ICONS[item.key] ?? WandSparkles;
            const selected = item.key === toolKey;
            return (
              <button
                key={item.key}
                type="button"
                className={`edit-tool ${selected ? 'selected' : ''}`}
                aria-pressed={selected}
                onClick={() => setToolKey(item.key)}
              >
                <Icon size={20} />
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </button>
            );
          })}
        </div>
      )}

      {tool?.fields.map((field) => (
        <FieldInput
          key={`${tool.key}-${field.key}`}
          field={field}
          value={values[field.key] ?? ''}
          colors={colors}
          onChange={(value) => setValue(field.key, value)}
        />
      ))}

      {alert}
      <Button type="submit" size="lg" block disabled={!isEditReady(tool, values)}>
        <WandSparkles size={20} /> Aplicar edición
      </Button>
    </form>
  );
}

interface FieldProps {
  field: EditField;
  value: string;
  colors: SuggestedColor[];
  onChange: (value: string) => void;
}

function FieldInput({ field, value, colors, onChange }: FieldProps) {
  if (field.kind === 'color') {
    return (
      <fieldset>
        <legend>{field.label}</legend>
        <div className="edit-colors">
          {colors.map((color) => (
            <button
              key={color.hex}
              type="button"
              className={`edit-color ${value === color.hex.toLowerCase() ? 'selected' : ''}`}
              style={{ background: color.hex }}
              aria-label={color.name}
              aria-pressed={value === color.hex.toLowerCase()}
              onClick={() => onChange(color.hex.toLowerCase())}
            />
          ))}
          <label className="edit-color-picker">
            <input type="color" value={value || '#d9cbb3'} onChange={(e) => onChange(e.target.value)} />
            <span>Otro color</span>
          </label>
        </div>
      </fieldset>
    );
  }

  if (field.kind === 'material') {
    return (
      <fieldset>
        <legend>{field.label}</legend>
        <div className="edit-materials">
          {field.options.map((option) => (
            <button
              key={option.slug}
              type="button"
              className={`edit-material ${value === option.slug ? 'selected' : ''}`}
              aria-pressed={value === option.slug}
              onClick={() => onChange(option.slug)}
            >
              <span className="edit-material-swatch" style={{ background: option.color_hex ?? undefined }}>
                {option.texture_url && <ImageProxy src={option.texture_url} alt="" />}
              </span>
              {option.name}
            </button>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <label className="budget-field">
      <span>{field.label}</span>
      <input placeholder={field.placeholder} maxLength={80} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
