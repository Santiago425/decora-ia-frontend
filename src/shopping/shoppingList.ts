import type { BudgetStatus, ShoppingList } from '../types/shopping';
import { formatCurrency } from '../utils/format';

export const shoppingPath = (projectId: string) => `/projects/${projectId}/shopping-list`;

export function budgetMessage(list: Pick<ShoppingList, 'budget_status' | 'budget_remaining'>): string {
  const remaining = Math.abs(list.budget_remaining ?? 0);
  const messages: Record<BudgetStatus, string> = {
    none: 'Fija un presupuesto para saber si tu diseño cabe en él.',
    under: `Vas bien: te quedan ${formatCurrency(remaining)}.`,
    near: `Estás cerca del límite: solo te quedan ${formatCurrency(remaining)}.`,
    over: `Te pasaste por ${formatCurrency(remaining)}. Prueba con piezas más económicas.`,
  };
  return messages[list.budget_status];
}

/** Share of the budget already used, clamped for the meter (0 to 100). */
export function budgetPercent(ratio: number | null): number {
  if (ratio === null || !Number.isFinite(ratio)) return 0;
  return Math.min(100, Math.max(0, Math.round(ratio * 100)));
}

export function purchasedKeys(list: ShoppingList): string[] {
  return list.sections.flatMap((section) => section.lines.filter((line) => line.purchased).map((line) => line.key));
}

export function togglePurchased(list: ShoppingList, key: string): string[] {
  const keys = purchasedKeys(list);
  return keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key];
}

export function parseAmount(text: string): number | null {
  const digits = text.replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
}

export function formatQuantity(quantity: number, unit: string): string {
  const value = Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(2).replace('.', ',');
  return `${value} ${quantity === 1 || !/^[a-záéíóúñ]+$/i.test(unit) ? unit : plural(unit)}`;
}

const plural = (word: string) => (/[aeiouáéó]$/i.test(word) ? `${word}s` : `${word}es`);
