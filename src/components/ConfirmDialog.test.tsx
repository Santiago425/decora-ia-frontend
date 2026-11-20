// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

function setup(props: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmDialog
      open
      title="Eliminar proyecto"
      message="Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      danger
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { onConfirm, onCancel };
}

describe('ConfirmDialog', () => {
  it('opens with its title and message', () => {
    setup();
    const dialog = screen.getByRole('dialog', { name: 'Eliminar proyecto' });
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(dialog.textContent).toContain('Esta acción no se puede deshacer.');
  });

  it('confirms and cancels through its buttons', async () => {
    const { onConfirm, onCancel } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('closes with Escape', () => {
    const idle = setup();
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(idle.onCancel).toHaveBeenCalledOnce();
  });

  it('locks both buttons while busy', () => {
    const { onCancel } = setup({ busy: true });
    expect(screen.getByRole('button', { name: 'Cancelar' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: /Un momento/ }).hasAttribute('disabled')).toBe(true);
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(onCancel).not.toHaveBeenCalled();
  });
});
