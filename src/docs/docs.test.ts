import { describe, expect, it } from 'vitest';
import { PATTERNS } from './patterns';
import { SOLID } from './solid';

describe('documentation data', () => {
  it('gives every pattern a unique id so its card can be linked', () => {
    const ids = PATTERNS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('links every SOLID principle to patterns that exist', () => {
    const ids = new Set(PATTERNS.map((p) => p.id));
    for (const principle of SOLID) {
      expect(principle.patterns.length).toBeGreaterThan(0);
      principle.patterns.forEach((id) => expect(ids).toContain(id));
    }
  });
});
