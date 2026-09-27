// ─── Indicator ──────────────────────────────────────────────

export type IndicatorFrequency = 'daily' | 'monthly';
export type IndicatorSource = 'bcb-ptax' | 'bcb-sgs' | 'fred';

export interface Indicator {
  id: number;
  source: IndicatorSource;
  externalId: string;
  name: string;
  description: string;
  frequency: IndicatorFrequency;
  unit: string;
}

// ─── Observation ────────────────────────────────────────────

export interface Observation {
  id: number;
  indicatorId: number;
  date: string;       // ISO date string (YYYY-MM-DD)
  value: number;
}

// ─── API Response DTOs ──────────────────────────────────────

export interface IndicatorWithLatest extends Indicator {
  latestValue: number | null;
  latestDate: string | null;
  variationPercent: number | null;
  previousValue: number | null;
  isFavorite: boolean;
}

export interface IndicatorDetail extends IndicatorWithLatest {
  observations: Observation[];
  limitations: string;
}

export interface FavoriteToggleResponse {
  indicatorId: number;
  isFavorite: boolean;
}

// ─── Sync ───────────────────────────────────────────────────

export interface SyncResult {
  indicatorId: number;
  name: string;
  observationsUpserted: number;
  status: 'success' | 'error';
  error?: string;
}

export interface SyncResponse {
  results: SyncResult[];
  syncedAt: string;
}
