import { describe, expect, it } from 'vitest';
import { navFor } from './navigation';

describe('navFor', () => {
  it('keeps the documentation for administrators only', () => {
    expect(navFor('user').map((item) => item.to)).not.toContain('/docs');
    expect(navFor('admin').map((item) => item.to)).toContain('/docs');
  });
});
