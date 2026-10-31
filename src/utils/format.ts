import { config } from '../config';

export function formatCurrency(value: number | string, { compact = false } = {}): string {
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? 'compact' : 'standard',
  }).format(Number(value));
}

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

export function formatRelativeTime(date: string | Date, now = Date.now()): string {
  const seconds = Math.round((new Date(date).getTime() - now) / 1000);
  const formatter = new Intl.RelativeTimeFormat(config.locale, { numeric: 'auto' });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit);
  }
  return formatter.format(0, 'minute');
}

export function greeting(hour = new Date().getHours()): string {
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
