import { useEffect, useState } from 'react';
import type { Page } from '../types/admin';

const DEBOUNCE_MS = 250;

/**
 * Loads one page whenever the filters change, waiting a moment so typing in a search box
 * does not fire a request per key. Old answers that arrive late are ignored.
 */
export function usePagedQuery<T, F extends { page: number }>(
  filters: F,
  load: (filters: F) => Promise<Page<T>>,
  onError: (error: unknown) => void,
) {
  const [data, setData] = useState<Page<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify(filters);

  useEffect(() => {
    let current = true;
    setLoading(true);
    const timer = setTimeout(() => {
      load(JSON.parse(key) as F)
        .then((page) => current && setData(page))
        .catch((error: unknown) => current && onError(error))
        .finally(() => current && setLoading(false));
    }, DEBOUNCE_MS);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [key, load, onError]);

  return { data, setData, loading };
}
