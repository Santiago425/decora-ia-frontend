export type BudgetStatus = 'none' | 'under' | 'near' | 'over';

export interface ShoppingLine {
  key: string;
  title: string;
  detail: string;
  unit: string;
  quantity: number;
  unit_price: number;
  total: number;
  purchased: boolean;
}

export interface ShoppingSection {
  key: string;
  title: string;
  total: number;
  purchased_total: number;
  lines: ShoppingLine[];
}

export interface ShoppingList {
  project_id: string;
  project_name: string;
  currency: string;
  include_redesign: boolean;
  has_redesign: boolean;
  sections: ShoppingSection[];
  total: number;
  purchased_total: number;
  pending_total: number;
  item_count: number;
  purchased_count: number;
  budget_limit: number | null;
  budget_remaining: number | null;
  budget_used_ratio: number | null;
  budget_status: BudgetStatus;
}

export type ShoppingExportFormat = 'csv' | 'json';
