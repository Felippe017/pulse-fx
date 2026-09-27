import { pool } from '../database/connection';

export class FavoriteRepository {
  /**
   * Toggle favorito: se já existe, remove; se não, adiciona.
   * Retorna o novo estado (true = favoritado).
   */
  async toggle(indicatorId: number): Promise<boolean> {
    const { rows } = await pool.query(
      'SELECT id FROM favorites WHERE indicator_id = $1',
      [indicatorId],
    );

    if (rows.length > 0) {
      await pool.query('DELETE FROM favorites WHERE indicator_id = $1', [indicatorId]);
      return false;
    }

    await pool.query(
      'INSERT INTO favorites (indicator_id) VALUES ($1)',
      [indicatorId],
    );
    return true;
  }

  /**
   * Lista IDs dos indicadores favoritados.
   */
  async findAll(): Promise<number[]> {
    const { rows } = await pool.query(
      'SELECT indicator_id FROM favorites ORDER BY created_at DESC',
    );
    return rows.map((r) => r.indicator_id);
  }
}

export const favoriteRepository = new FavoriteRepository();
