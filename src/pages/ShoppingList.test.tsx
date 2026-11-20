// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ShoppingList as ShoppingListData } from '../types/shopping';
import ShoppingList from './ShoppingList';

const service = vi.hoisted(() => ({ get: vi.fn(), setBudget: vi.fn(), setPurchased: vi.fn(), export: vi.fn() }));
vi.mock('../services/shoppingListService', () => ({ shoppingListService: service }));
vi.mock('../components/patterns/PatternBadge', () => ({ PatternBadge: () => null }));

const LIST: ShoppingListData = {
  project_id: 'p1',
  project_name: 'Sala nórdica',
  currency: 'COP',
  include_redesign: false,
  has_redesign: true,
  sections: [
    {
      key: 'furniture',
      title: 'Muebles',
      total: 3000000,
      purchased_total: 0,
      lines: [
        {
          key: 'furniture:1',
          title: 'Sofá Oslo',
          detail: 'Sofás',
          unit: 'unidad',
          quantity: 1,
          unit_price: 3000000,
          total: 3000000,
          purchased: false,
        },
      ],
    },
  ],
  total: 3000000,
  purchased_total: 0,
  pending_total: 3000000,
  item_count: 1,
  purchased_count: 0,
  budget_limit: null,
  budget_remaining: null,
  budget_used_ratio: null,
  budget_status: 'none',
};

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/projects/p1/compras']}>
      <Routes>
        <Route path="/projects/:projectId/compras" element={<ShoppingList />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ShoppingList page', () => {
  beforeEach(() => {
    Object.values(service).forEach((fn) => fn.mockReset());
    service.get.mockResolvedValue(LIST);
  });

  it('lists the design products with their total', async () => {
    renderPage();
    expect(await screen.findByText('Sofá Oslo')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Sala nórdica' })).toBeTruthy();
    expect(screen.getByText(/Fija un presupuesto/)).toBeTruthy();
  });

  it('saves the budget and shows when the design goes over it', async () => {
    service.setBudget.mockResolvedValue({
      ...LIST,
      budget_limit: 2000000,
      budget_remaining: -1000000,
      budget_used_ratio: 1.5,
      budget_status: 'over',
    });
    renderPage();
    await userEvent.type(await screen.findByLabelText('¿Cuánto quieres gastar?'), '2000000');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(service.setBudget).toHaveBeenCalledWith('p1', 2000000, false);
    expect(await screen.findByText(/Te pasaste/)).toBeTruthy();
    expect(screen.getByText('Sobre el presupuesto')).toBeTruthy();
  });

  it('marks a product as bought', async () => {
    service.setPurchased.mockResolvedValue(LIST);
    renderPage();
    await userEvent.click(await screen.findByLabelText('Marcar Sofá Oslo como comprado'));
    expect(service.setPurchased).toHaveBeenCalledWith('p1', ['furniture:1'], false);
  });
});
