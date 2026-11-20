import { describe, expect, it } from 'vitest';
import type { ShoppingList } from '../types/shopping';
import { budgetMessage, budgetPercent, formatQuantity, parseAmount, togglePurchased } from './shoppingList';

const line = (key: string, purchased = false) => ({
  key,
  title: key,
  detail: '',
  unit: 'unidad',
  quantity: 1,
  unit_price: 10,
  total: 10,
  purchased,
});

const list = {
  sections: [
    { key: 'furniture', title: 'Muebles', total: 20, purchased_total: 10, lines: [line('a', true), line('b')] },
  ],
} as ShoppingList;

describe('shopping list helpers', () => {
  it('toggles a line in the purchased keys', () => {
    expect(togglePurchased(list, 'b')).toEqual(['a', 'b']);
    expect(togglePurchased(list, 'a')).toEqual([]);
  });

  it('explains the budget status', () => {
    expect(budgetMessage({ budget_status: 'none', budget_remaining: null })).toMatch(/Fija un presupuesto/);
    expect(budgetMessage({ budget_status: 'over', budget_remaining: -500 })).toMatch(/Te pasaste/);
    expect(budgetMessage({ budget_status: 'under', budget_remaining: 500 })).toMatch(/Vas bien/);
  });

  it('clamps the meter and reads amounts typed with separators', () => {
    expect(budgetPercent(1.4)).toBe(100);
    expect(budgetPercent(0.456)).toBe(46);
    expect(budgetPercent(null)).toBe(0);
    expect(parseAmount('$ 2.500.000')).toBe(2500000);
    expect(parseAmount('')).toBeNull();
    expect(formatQuantity(1, 'unidad')).toBe('1 unidad');
    expect(formatQuantity(12.5, 'm²')).toBe('12,50 m²');
    expect(formatQuantity(2, 'unidad')).toBe('2 unidades');
  });
});
