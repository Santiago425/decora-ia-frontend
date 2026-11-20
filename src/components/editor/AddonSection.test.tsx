// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { FurnitureAddon } from '../../types/catalog';
import { AddonSection } from './Inspector';

const addon = (slug: string, name: string, visual: FurnitureAddon['visual'], price: string): FurnitureAddon => ({
  id: slug.length,
  slug,
  name,
  description: 'Descripción',
  price,
  visual,
  icon: 'sparkles',
  color_hex: visual === 'none' ? null : '#a9b49a',
  categories: ['sofa'],
});

const addons = [
  addon('cushions', 'Cojines', 'cushions', '120000'),
  addon('throw', 'Manta', 'throw', '95000'),
  addon('assembly', 'Armado profesional', 'none', '120000'),
];

describe('add-on section', () => {
  it('splits decor from services and sums what is chosen', () => {
    render(<AddonSection addons={addons} chosen={['cushions', 'assembly']} disabled={false} onChange={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Decoración' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Servicios' })).toBeTruthy();
    expect(screen.getByText(/2 elegidos/).textContent).toMatch(/240\.000/);
  });

  it('toggles an add-on on and off', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AddonSection addons={addons} chosen={['cushions']} disabled={false} onChange={onChange} />);
    await user.click(screen.getByRole('checkbox', { name: /Manta/ }));
    expect(onChange).toHaveBeenLastCalledWith(['cushions', 'throw']);
    await user.click(screen.getByRole('checkbox', { name: /Cojines/ }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});
