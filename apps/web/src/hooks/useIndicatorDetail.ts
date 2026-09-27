import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { IndicatorDetail } from '@pulse-fx/shared';

interface UseIndicatorDetailOptions {
  days?: number;
  months?: number;
}

export function useIndicatorDetail(id: number, options?: UseIndicatorDetailOptions) {
  const [detail, setDetail] = useState<IndicatorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getIndicatorDetail(id, options);
      setDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes');
    } finally {
      setLoading(false);
    }
  }, [id, options?.days, options?.months]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { detail, loading, error, refetch: fetchDetail };
}
