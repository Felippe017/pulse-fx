import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { IndicatorWithLatest } from '@pulse-fx/shared';

export function useIndicators() {
  const [indicators, setIndicators] = useState<IndicatorWithLatest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIndicators = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getIndicators();
      setIndicators(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar indicadores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIndicators();
  }, [fetchIndicators]);

  const toggleFavorite = async (indicatorId: number) => {
    try {
      const result = await api.toggleFavorite(indicatorId);
      setIndicators((prev) =>
        prev.map((ind) =>
          ind.id === indicatorId ? { ...ind, isFavorite: result.isFavorite } : ind,
        ),
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  return { indicators, loading, error, refetch: fetchIndicators, toggleFavorite };
}
