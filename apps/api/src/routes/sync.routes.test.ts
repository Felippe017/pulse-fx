import request from 'supertest';
import { app } from '../index';

jest.mock('../database/connection', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    on: jest.fn(),
  },
  runMigrations: jest.fn(),
}));

jest.mock('../repositories/indicator.repository', () => ({
  indicatorRepository: {
    findAllWithLatest: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../repositories/observation.repository', () => ({
  observationRepository: {},
}));

jest.mock('../services/sync.service', () => ({
  syncService: {
    syncAll: jest.fn().mockResolvedValue([
      { indicatorId: 1, name: 'Test', observationsUpserted: 10, status: 'success' },
    ]),
  },
}));

jest.mock('../config/env', () => ({
  env: {
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    FRED_API_KEY: 'test-key',
    API_PORT: 3001,
    SYNC_TTL_MINUTES: 60,
    ADMIN_KEY: 'test-admin-key',
    NODE_ENV: 'test',
  },
}));

const { syncService } = require('../services/sync.service');

describe('POST /api/sync', () => {
  it('should reject without admin key', async () => {
    const response = await request(app).post('/api/sync');

    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Unauthorized');
  });

  it('should reject with wrong admin key', async () => {
    const response = await request(app)
      .post('/api/sync')
      .set('X-Admin-Key', 'wrong-key');

    expect(response.status).toBe(401);
  });

  it('should sync with correct admin key', async () => {
    const response = await request(app)
      .post('/api/sync')
      .set('X-Admin-Key', 'test-admin-key');

    expect(response.status).toBe(200);
    expect(response.body.results).toHaveLength(1);
    expect(response.body.syncedAt).toBeDefined();
    expect(syncService.syncAll).toHaveBeenCalledWith(false);
  });

  it('should pass force=true query param', async () => {
    await request(app)
      .post('/api/sync?force=true')
      .set('X-Admin-Key', 'test-admin-key');

    expect(syncService.syncAll).toHaveBeenCalledWith(true);
  });
});
