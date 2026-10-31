import { describe, expect, test, vi } from 'vitest';
import { notificationCenter } from './notificationCenter';

describe('notificationCenter', () => {
  test('notifies every subscriber until it unsubscribes', () => {
    const first = vi.fn();
    const second = vi.fn();
    const unsubscribe = notificationCenter.subscribe(first);
    notificationCenter.subscribe(second);

    notificationCenter.notify('Proyecto guardado', 'success');
    unsubscribe();
    notificationCenter.notify('Otro aviso');

    expect(first).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledWith(expect.objectContaining({ message: 'Proyecto guardado', tone: 'success' }));
    expect(second).toHaveBeenCalledTimes(2);
  });
});
