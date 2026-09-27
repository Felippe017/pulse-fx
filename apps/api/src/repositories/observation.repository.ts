import { pool } from '../database/connection';
import type { Observation } from '@pulse-fx/shared';

export class ObservationRepository {
  /**
   * Upsert em batch — insere observações novas, atualiza valor se já existir.
   */
  async upsertBatch(
    indicatorId: number,
    observations: Array<{ date: string; value: number }>,
  ): Promise<number> {
    if (observations.length === 0) return 0;

    const values: string[] = [];
    const params: (number | string)[] = [];
    let paramIndex = 1;

    for (const obs of observations) {
      values.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2})`);
      params.push(indicatorId, obs.date, obs.value);
      paramIndex += 3;
    }

    const query = `
      INSERT INTO observations (indicator_id, date, value)
      VALUES ${values.join(', ')}
      ON CONFLICT (indicator_id, date) DO UPDATE SET value = EXCLUDED.value
    `;

    const result = await pool.query(query, params);
    return result.rowCount ?? 0;
  }

  /**
   * Busca série temporal de um indicador dentro de uma janela de datas.
   */
  async findByIndicatorAndDateRange(
    indicatorId: number,
    startDate: string,
    endDate: string,
  ): Promise<Observation[]> {
    const { rows } = await pool.query(
      `SELECT id, indicator_id AS "indicatorId", date, value
       FROM observations
       WHERE indicator_id = $1 AND date >= $2 AND date <= $3
       ORDER BY date ASC`,
      [indicatorId, startDate, endDate],
    );

    return rows.map((r) => ({
      ...r,
      date: r.date.toISOString().split('T')[0],
      value: Number(r.value),
    }));
  }

  /**
   * Busca as N últimas observações de um indicador.
   */
  async findLatest(indicatorId: number, limit: number): Promise<Observation[]> {
    const { rows } = await pool.query(
      `SELECT id, indicator_id AS "indicatorId", date, value
       FROM observations
       WHERE indicator_id = $1
       ORDER BY date DESC
       LIMIT $2`,
      [indicatorId, limit],
    );

    return rows
      .map((r) => ({
        ...r,
        date: r.date.toISOString().split('T')[0],
        value: Number(r.value),
      }))
      .reverse();
  }
}

export const observationRepository = new ObservationRepository();
