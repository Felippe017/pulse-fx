import { pool } from '../database/connection';
import type { Indicator } from '@pulse-fx/shared';

export class IndicatorRepository {
  async findAll(): Promise<Indicator[]> {
    const { rows } = await pool.query(
      `SELECT id, source, external_id AS "externalId", name, description,
              frequency, unit
       FROM indicators ORDER BY id`,
    );
    return rows;
  }

  async findById(id: number): Promise<Indicator | null> {
    const { rows } = await pool.query(
      `SELECT id, source, external_id AS "externalId", name, description,
              frequency, unit
       FROM indicators WHERE id = $1`,
      [id],
    );
    return rows[0] ?? null;
  }

  /**
   * Retorna todos os indicadores com:
   * - último valor e data
   * - valor anterior (para cálculo de variação)
   * - status de favorito
   *
   * Para séries diárias: valor anterior = penúltimo registro
   * Para séries mensais: valor anterior = penúltimo registro
   */
  async findAllWithLatest(): Promise<Array<Indicator & {
    latestValue: number | null;
    latestDate: string | null;
    previousValue: number | null;
    isFavorite: boolean;
  }>> {
    const { rows } = await pool.query(`
      SELECT
        i.id,
        i.source,
        i.external_id AS "externalId",
        i.name,
        i.description,
        i.frequency,
        i.unit,
        latest.value AS "latestValue",
        latest.date AS "latestDate",
        prev.value AS "previousValue",
        (f.id IS NOT NULL) AS "isFavorite"
      FROM indicators i
      LEFT JOIN LATERAL (
        SELECT o.value, o.date
        FROM observations o
        WHERE o.indicator_id = i.id
        ORDER BY o.date DESC
        LIMIT 1
      ) latest ON true
      LEFT JOIN LATERAL (
        SELECT o.value
        FROM observations o
        WHERE o.indicator_id = i.id
          AND o.date < latest.date
        ORDER BY o.date DESC
        LIMIT 1
      ) prev ON true
      LEFT JOIN favorites f ON f.indicator_id = i.id
      ORDER BY i.id
    `);

    return rows.map((r) => ({
      ...r,
      latestValue: r.latestValue ? Number(r.latestValue) : null,
      latestDate: r.latestDate ? r.latestDate.toISOString().split('T')[0] : null,
      previousValue: r.previousValue ? Number(r.previousValue) : null,
      isFavorite: Boolean(r.isFavorite),
    }));
  }

  async findByIdWithLatest(id: number): Promise<(Indicator & {
    latestValue: number | null;
    latestDate: string | null;
    previousValue: number | null;
    isFavorite: boolean;
  }) | null> {
    const { rows } = await pool.query(`
      SELECT
        i.id,
        i.source,
        i.external_id AS "externalId",
        i.name,
        i.description,
        i.frequency,
        i.unit,
        latest.value AS "latestValue",
        latest.date AS "latestDate",
        prev.value AS "previousValue",
        (f.id IS NOT NULL) AS "isFavorite"
      FROM indicators i
      LEFT JOIN LATERAL (
        SELECT o.value, o.date
        FROM observations o
        WHERE o.indicator_id = i.id
        ORDER BY o.date DESC
        LIMIT 1
      ) latest ON true
      LEFT JOIN LATERAL (
        SELECT o.value
        FROM observations o
        WHERE o.indicator_id = i.id
          AND o.date < latest.date
        ORDER BY o.date DESC
        LIMIT 1
      ) prev ON true
      LEFT JOIN favorites f ON f.indicator_id = i.id
      WHERE i.id = $1
    `, [id]);

    if (rows.length === 0) return null;

    const r = rows[0];
    return {
      ...r,
      latestValue: r.latestValue ? Number(r.latestValue) : null,
      latestDate: r.latestDate ? r.latestDate.toISOString().split('T')[0] : null,
      previousValue: r.previousValue ? Number(r.previousValue) : null,
      isFavorite: Boolean(r.isFavorite),
    };
  }
}

export const indicatorRepository = new IndicatorRepository();
