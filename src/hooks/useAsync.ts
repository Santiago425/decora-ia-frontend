import { useCallback, useEffect, useState } from 'react';

export function useAsync<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const run = useCallback(() => {
    setLoading(true);
    setError('');
    loader()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [loader]);

  useEffect(run, [run]);

  return { data, error, loading, retry: run };
}
