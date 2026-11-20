// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pager } from './Pager';

describe('Pager', () => {
  it('renders nothing when everything fits in one page', () => {
    const { container } = render(<Pager page={1} total={5} pageSize={10} onChange={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows the visible range and the page count', () => {
    render(<Pager page={2} total={25} pageSize={10} onChange={vi.fn()} />);
    const nav = screen.getByRole('navigation', { name: 'Páginas' });
    expect(nav.textContent).toContain('11–20 de 25');
    expect(nav.textContent).toContain('Página 2 de 3');
  });

  it('disables previous on the first page and moves forward', async () => {
    const onChange = vi.fn();
    render(<Pager page={1} total={25} pageSize={10} onChange={onChange} />);
    expect(screen.getByRole('button', { name: 'Página anterior' }).hasAttribute('disabled')).toBe(true);
    await userEvent.click(screen.getByRole('button', { name: 'Página siguiente' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('disables next on the last page', () => {
    render(<Pager page={3} total={25} pageSize={10} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Página siguiente' }).hasAttribute('disabled')).toBe(true);
  });
});
