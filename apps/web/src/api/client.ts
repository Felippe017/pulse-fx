import type { IndicatorWithLatest, IndicatorDetail, FavoriteToggleResponse, SyncResponse } from '@pulse-fx/shared';

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  getIndicators: () =>
    fetchJSON<IndicatorWithLatest[]>('/indicators'),

  getIndicatorDetail: (id: number, params?: { days?: number; months?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.days) searchParams.set('days', String(params.days));
    if (params?.months) searchParams.set('months', String(params.months));
    const qs = searchParams.toString();
    return fetchJSON<IndicatorDetail>(`/indicators/${id}${qs ? `?${qs}` : ''}`);
  },

  toggleFavorite: (indicatorId: number) =>
    fetchJSON<FavoriteToggleResponse>(`/favorites/${indicatorId}`, { method: 'POST' }),

  sync: (adminKey: string, force = false) =>
    fetchJSON<SyncResponse>(`/sync${force ? '?force=true' : ''}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Key': adminKey,
      },
    }),
};
