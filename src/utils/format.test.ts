import { describe, expect, test } from 'vitest';
import { formatMeters, formatRelativeTime, greeting } from './format';

describe('format', () => {
  test('greeting follows the time of day', () => {
    expect(greeting(8)).toBe('Buenos días');
    expect(greeting(15)).toBe('Buenas tardes');
    expect(greeting(22)).toBe('Buenas noches');
  });

  test('meters keep at most two decimals', () => {
    expect(formatMeters(1.256)).toMatch(/^1[.,]26 m$/);
    expect(formatMeters(3)).toBe('3 m');
  });

  test('relative time', () => {
    const now = new Date('2026-10-31T12:00:00Z').getTime();
    expect(formatRelativeTime('2026-10-26T12:00:00Z', now)).toMatch(/5/);
  });
});
