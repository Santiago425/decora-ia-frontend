// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { InspirationPanel } from './InspirationPanel';

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:inspiration');
  URL.revokeObjectURL = vi.fn();
});

function setup() {
  const onApply = vi.fn();
  const onInvalid = vi.fn();
  render(<InspirationPanel alert={null} onApply={onApply} onInvalid={onInvalid} onClose={vi.fn()} />);
  return { onApply, onInvalid, input: screen.getByTestId('inspiration-input') as HTMLInputElement };
}

describe('InspirationPanel', () => {
  it('waits for a photo before applying the style', () => {
    setup();
    expect((screen.getByRole('button', { name: /aplicar este estilo/i }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('sends the chosen inspiration photo', async () => {
    const { onApply, input } = setup();
    const photo = new File(['jpg'], 'sala.jpg', { type: 'image/jpeg' });
    await userEvent.upload(input, photo);
    expect(screen.getByAltText('Foto de inspiración')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: /aplicar este estilo/i }));
    expect(onApply).toHaveBeenCalledWith(photo);
  });

  it('rejects files that are not photos', async () => {
    const { onApply, onInvalid, input } = setup();
    await userEvent.upload(input, new File(['%PDF'], 'plano.pdf', { type: 'application/pdf' }), {
      applyAccept: false,
    });
    expect(onInvalid).toHaveBeenCalledWith('Sube una foto en formato JPG, PNG o WEBP');
    expect(onApply).not.toHaveBeenCalled();
  });
});
