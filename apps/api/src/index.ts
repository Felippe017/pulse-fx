import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { runMigrations } from './database/connection';
import { syncService } from './services/sync.service';
import indicatorsRoutes from './routes/indicators.routes';
import favoritesRoutes from './routes/favorites.routes';
import syncRoutes from './routes/sync.routes';
import { errorHandler } from './middleware/error-handler';

export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/indicators', indicatorsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/sync', syncRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Bootstrap
async function bootstrap() {
  try {
    console.log('🚀 Starting Pulse FX API...');

    // Run migrations
    await runMigrations();

    // Initial sync
    console.log('🔄 Running initial data sync...');
    const results = await syncService.syncAll();
    const successCount = results.filter((r) => r.status === 'success').length;
    console.log(`✅ Initial sync complete: ${successCount}/${results.length} indicators synced`);

    // Start server
    app.listen(env.API_PORT, () => {
      console.log(`🌐 Pulse FX API running on http://localhost:${env.API_PORT}`);
    });
  } catch (err) {
    console.error('💥 Failed to start:', err);
    process.exit(1);
  }
}

// Only start if not in test mode
if (env.NODE_ENV !== 'test') {
  bootstrap();
}
