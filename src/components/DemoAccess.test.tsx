// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DemoAccount, PublicMeta } from '../types/meta';
import { DemoAccess } from './DemoAccess';

const publicMeta = vi.hoisted(() => vi.fn());

vi.mock('../services/metaService', () => ({ metaService: { publicMeta } }));

const ACCOUNTS: DemoAccount[] = [
  { role: 'user', name: 'Ana', email: 'ana@demo.test', password: 'secreto1' },
  { role: 'admin', name: 'Luis', email: 'luis@demo.test', password: 'secreto2' },
];

function meta(demo_accounts: DemoAccount[]): Partial<PublicMeta> {
  return { demo_accounts };
}

describe('DemoAccess', () => {
  beforeEach(() => publicMeta.mockReset());

  it('offers one button per demo account from the server', async () => {
    publicMeta.mockResolvedValue(meta(ACCOUNTS));
    render(<DemoAccess onSelect={vi.fn()} />);
    expect(await screen.findByRole('button', { name: /usuario de prueba \(Ana\)/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /administrador de prueba \(Luis\)/ })).toBeTruthy();
  });

  it('hands the chosen account to the login', async () => {
    publicMeta.mockResolvedValue(meta(ACCOUNTS));
    const onSelect = vi.fn();
    render(<DemoAccess onSelect={onSelect} />);
    await userEvent.click(await screen.findByRole('button', { name: /administrador de prueba/ }));
    expect(onSelect).toHaveBeenCalledWith(ACCOUNTS[1]);
  });

  it('stays hidden when the server has no demo accounts', async () => {
    publicMeta.mockResolvedValue(meta([]));
    const { container } = render(<DemoAccess onSelect={vi.fn()} />);
    await vi.waitFor(() => expect(publicMeta).toHaveBeenCalled());
    expect(container.innerHTML).toBe('');
  });

  it('disables the buttons while a login is running', async () => {
    publicMeta.mockResolvedValue(meta(ACCOUNTS));
    render(<DemoAccess disabled onSelect={vi.fn()} />);
    const buttons = await screen.findAllByRole('button');
    expect(buttons.every((button) => button.hasAttribute('disabled'))).toBe(true);
  });
});
