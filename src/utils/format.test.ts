import { describe, expect, test } from 'vitest';
import { formatRelativeTime, greeting } from './format';

describe('format', () => {
  test('greeting follows the time of day', () => {
    expect(greeting(8)).toBe('Buenos días');
    expect(greeting(15)).toBe('Buenas tardes');
    expect(greeting(22)).toBe('Buenas noches');
  });

  test('relative time', () => {
    const now = new Date('2026-10-31T12:00:00Z').getTime();
    expect(formatRelativeTime('2026-10-26T12:00:00Z', now)).toMatch(/5/);
  });
});
