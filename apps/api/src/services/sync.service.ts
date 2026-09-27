import { pool } from '../database/connection';
import { env } from '../config/env';
import { getDaysAgo, getMonthsAgo } from '../domain/date-utils';
import { indicatorRepository } from '../repositories/indicator.repository';
import { observationRepository } from '../repositories/observation.repository';
import { bcbPtaxService } from './bcb-ptax.service';
import { bcbSgsService } from './bcb-sgs.service';
import { fredService } from './fred.service';
import type { SyncResult } from '@pulse-fx/shared';

/**
 * Orquestrador de sincronização.
 * Política de TTL: só sincroniza se o último sync foi há mais de SYNC_TTL_MINUTES.
 * Janela de busca:
 *   - Séries diárias: últimos 90 dias
 *   - Séries mensais: últimos 24 meses
 */
export class SyncService {
  /**
   * Sincroniza todos os indicadores, respeitando TTL.
   * @param force Se true, ignora TTL.
   */
  async syncAll(force = false): Promise<SyncResult[]> {
    const indicators = await indicatorRepository.findAll();
    const results: SyncResult[] = [];

    for (const indicator of indicators) {
      try {
        const shouldSync = force || await this.shouldSync(indicator.id);
        if (!shouldSync) {
          console.log(`⏭ Skipping ${indicator.name} (within TTL)`);
          continue;
        }

        console.log(`🔄 Syncing ${indicator.name}...`);
        const observations = await this.fetchObservations(
          indicator.source,
          indicator.externalId,
          indicator.frequency,
        );

        const count = await observationRepository.upsertBatch(indicator.id, observations);
        await this.logSync(indicator.id, 'success', count);

        results.push({
          indicatorId: indicator.id,
          name: indicator.name,
          observationsUpserted: count,
          status: 'success',
        });

        console.log(`  ✅ ${indicator.name}: ${count} observations upserted`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await this.logSync(indicator.id, 'error', 0, message);

        results.push({
          indicatorId: indicator.id,
          name: indicator.name,
          observationsUpserted: 0,
          status: 'error',
          error: message,
        });

        console.error(`  ❌ ${indicator.name}: ${message}`);
      }
    }

    return results;
  }

  /**
   * Busca observações de acordo com a fonte e tipo.
   */
  private async fetchObservations(
    source: string,
    externalId: string,
    frequency: string,
  ): Promise<Array<{ date: string; value: number }>> {
    const now = new Date();
    const startDate = frequency === 'daily'
      ? getDaysAgo(now, 90)
      : getMonthsAgo(now, 24);

    switch (source) {
      case 'bcb-ptax':
        if (externalId === 'USD') {
          return bcbPtaxService.fetchDollarQuotes(startDate, now);
        }
        return bcbPtaxService.fetchCurrencyQuotes(externalId, startDate, now);

      case 'bcb-sgs':
        return bcbSgsService.fetchSeries(externalId, startDate, now);

      case 'fred':
        return fredService.fetchSeries(externalId, startDate, now);

      default:
        throw new Error(`Unknown source: ${source}`);
    }
  }

  /**
   * Verifica se um indicador precisa de sync (TTL expirado).
   */
  private async shouldSync(indicatorId: number): Promise<boolean> {
    const { rows } = await pool.query(
      `SELECT synced_at FROM sync_log
       WHERE indicator_id = $1 AND status = 'success'
       ORDER BY synced_at DESC LIMIT 1`,
      [indicatorId],
    );

    if (rows.length === 0) return true;

    const lastSync = new Date(rows[0].synced_at);
    const elapsed = Date.now() - lastSync.getTime();
    const ttlMs = env.SYNC_TTL_MINUTES * 60 * 1000;

    return elapsed > ttlMs;
  }

  /**
   * Registra uma sincronização no log.
   */
  private async logSync(
    indicatorId: number,
    status: string,
    count: number,
    errorMessage?: string,
  ): Promise<void> {
    await pool.query(
      `INSERT INTO sync_log (indicator_id, status, observations_count, error_message)
       VALUES ($1, $2, $3, $4)`,
      [indicatorId, status, count, errorMessage ?? null],
    );
  }
}

export const syncService = new SyncService();
