// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Lock, Mail } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { FormField } from './FormField';

describe('FormField', () => {
  it('links the label to its input', async () => {
    render(<FormField label="Correo" icon={Mail} />);
    const input = screen.getByLabelText('Correo');
    await userEvent.type(input, 'ana@correo.com');
    expect((input as HTMLInputElement).value).toBe('ana@correo.com');
  });

  it('announces the error and marks the input invalid', () => {
    render(<FormField label="Correo" icon={Mail} error="Ese correo no parece válido" />);
    const input = screen.getByLabelText('Correo');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const errorId = input.getAttribute('aria-describedby');
    expect(errorId && document.getElementById(errorId)?.textContent).toBe('Ese correo no parece válido');
  });

  it('toggles the password visibility', async () => {
    render(<FormField label="Contraseña" icon={Lock} type="password" />);
    const input = screen.getByLabelText('Contraseña');
    expect(input.getAttribute('type')).toBe('password');
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(input.getAttribute('type')).toBe('text');
    await userEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(input.getAttribute('type')).toBe('password');
  });
});
