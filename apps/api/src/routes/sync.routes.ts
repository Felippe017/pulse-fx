import { Router, Request, Response } from 'express';
import { syncService } from '../services/sync.service';
import { env } from '../config/env';

const router = Router();

/**
 * POST /api/sync
 * Trigger manual de sincronização.
 * Protegido por header X-Admin-Key.
 * Query param: force=true para ignorar TTL.
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== env.ADMIN_KEY) {
      res.status(401).json({ error: 'Unauthorized: invalid admin key' });
      return;
    }

    const force = req.query.force === 'true';
    const results = await syncService.syncAll(force);

    res.json({
      results,
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error during sync:', err);
    res.status(500).json({ error: 'Sync failed' });
  }
});

export default router;
