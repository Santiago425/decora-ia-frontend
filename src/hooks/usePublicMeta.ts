import { useCallback } from 'react';
import { metaService } from '../services/metaService';
import { useAsync } from './useAsync';

export function usePublicMeta() {
  return useAsync(useCallback(() => metaService.publicMeta(), []));
}
