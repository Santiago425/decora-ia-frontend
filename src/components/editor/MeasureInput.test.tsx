// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MeasureInput } from './MeasureInput';

const range = { min: 1.5, max: 20 };

describe('MeasureInput', () => {
  it('reports the clamped value only when the field loses focus', () => {
    const onCommit = vi.fn();
    render(<MeasureInput label="Ancho" value={4} range={range} onCommit={onCommit} />);
    const input = screen.getByLabelText(/^Ancho/);
    fireEvent.change(input, { target: { value: '35' } });
    expect(onCommit).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith(20);
    expect((input as HTMLInputElement).value).toBe('20');
  });

  it('restores the value when the text is not a number', () => {
    const onCommit = vi.fn();
    render(<MeasureInput label="Alto" value={2.7} range={range} onCommit={onCommit} />);
    const input = screen.getByLabelText(/^Alto/);
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(onCommit).not.toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe('2.7');
  });

  it('lets an optional field go back to empty', () => {
    const onCommit = vi.fn();
    render(<MeasureInput label="Largo" value={3} range={range} optional onCommit={onCommit} />);
    const input = screen.getByLabelText(/^Largo/);
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(onCommit).toHaveBeenCalledWith(null);
  });
});
