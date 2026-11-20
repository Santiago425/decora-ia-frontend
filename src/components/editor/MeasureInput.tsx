import { useEffect, useState } from 'react';
import { clamp, parseMeasure, type Range } from '../../utils/measure';

interface MeasureInputProps {
  label: string;
  value: number | null;
  range: Range;
  disabled?: boolean;
  placeholder?: string;
  /** Called with the clamped value, or null when the field is left empty and `optional` is set. */
  onCommit: (value: number | null) => void;
  optional?: boolean;
}

// A meters field that only reports on blur or Enter, so typing "3," never moves the scene halfway.
export function MeasureInput({ label, value, range, disabled, placeholder, onCommit, optional }: MeasureInputProps) {
  const [text, setText] = useState(value === null ? '' : String(value));
  useEffect(() => setText(value === null ? '' : String(value)), [value]);

  function commit() {
    const parsed = parseMeasure(text);
    if (parsed === null) {
      if (optional) {
        setText('');
        if (value !== null) onCommit(null);
      } else setText(value === null ? '' : String(value));
      return;
    }
    const next = clamp(parsed, range);
    setText(String(next));
    if (next !== value) onCommit(next);
  }

  return (
    <label className="dimension">
      <span>{label}</span>
      <input
        type="number"
        inputMode="decimal"
        step={0.05}
        min={range.min}
        max={range.max}
        value={text}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      />
      <em>m</em>
    </label>
  );
}
