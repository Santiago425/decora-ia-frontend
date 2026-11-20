// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('runs its handler when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Guardar</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('defaults to a non-submitting button', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button').getAttribute('type')).toBe('button');
  });

  it('shows the loading label and blocks clicks while busy', async () => {
    const onClick = vi.fn();
    render(
      <Button loading loadingLabel="Guardando…" onClick={onClick}>
        Guardar
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Guardando…' });
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
