import { Router, Request, Response } from 'express';
import { favoriteRepository } from '../repositories/favorite.repository';

const router = Router();

/**
 * GET /api/favorites
 * Lista IDs dos indicadores favoritados.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const favoriteIds = await favoriteRepository.findAll();
    res.json({ favoriteIds });
  } catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

/**
 * POST /api/favorites/:indicatorId
 * Toggle favorito: adiciona se não existe, remove se existe.
 */
router.post('/:indicatorId', async (req: Request, res: Response) => {
  try {
    const indicatorId = parseInt(req.params.indicatorId, 10);
    if (isNaN(indicatorId)) {
      res.status(400).json({ error: 'Invalid indicator ID' });
      return;
    }

    const isFavorite = await favoriteRepository.toggle(indicatorId);
    res.json({ indicatorId, isFavorite });
  } catch (err) {
    console.error('Error toggling favorite:', err);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

export default router;
