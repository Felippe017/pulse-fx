import request from 'supertest';
import { app } from '../index';

// Mock the repositories and services to avoid DB dependency
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
    findAllWithLatest: jest.fn().mockResolvedValue([
      {
        id: 1,
        source: 'bcb-ptax',
        externalId: 'USD',
        name: 'Dólar PTAX (Venda)',
        description: 'Taxa de câmbio USD/BRL',
        frequency: 'daily',
        unit: 'BRL',
        latestValue: 5.45,
        latestDate: '2024-01-15',
        previousValue: 5.40,
        isFavorite: false,
      },
      {
        id: 2,
        source: 'fred',
        externalId: 'FEDFUNDS',
        name: 'Fed Funds Rate',
        description: 'Taxa de juros dos EUA',
        frequency: 'monthly',
        unit: '%',
        latestValue: 5.33,
        latestDate: '2024-01-01',
        previousValue: 5.33,
        isFavorite: true,
      },
    ]),
    findByIdWithLatest: jest.fn().mockImplementation(async (id: number) => {
      if (id === 1) {
        return {
          id: 1,
          source: 'bcb-ptax',
          externalId: 'USD',
          name: 'Dólar PTAX (Venda)',
          description: 'Taxa de câmbio USD/BRL',
          frequency: 'daily',
          unit: 'BRL',
          latestValue: 5.45,
          latestDate: '2024-01-15',
          previousValue: 5.40,
          isFavorite: false,
        };
      }
      return null;
    }),
  },
}));

jest.mock('../repositories/observation.repository', () => ({
  observationRepository: {
    findByIndicatorAndDateRange: jest.fn().mockResolvedValue([
      { id: 1, indicatorId: 1, date: '2024-01-12', value: 5.40 },
      { id: 2, indicatorId: 1, date: '2024-01-15', value: 5.45 },
    ]),
  },
}));

jest.mock('../services/sync.service', () => ({
  syncService: {
    syncAll: jest.fn().mockResolvedValue([]),
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

describe('GET /api/indicators', () => {
  it('should return list of indicators with variation', async () => {
    const response = await request(app).get('/api/indicators');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body[0]).toMatchObject({
      id: 1,
      name: 'Dólar PTAX (Venda)',
      latestValue: 5.45,
    });
    // Variation: (5.45 - 5.40) / 5.40 * 100 ≈ 0.9259%
    expect(response.body[0].variationPercent).toBeCloseTo(0.9259, 2);
  });

  it('should return variation as 0 when values are equal', async () => {
    const response = await request(app).get('/api/indicators');

    expect(response.body[1].variationPercent).toBe(0);
  });
});

describe('GET /api/indicators/:id', () => {
  it('should return indicator detail with observations', async () => {
    const response = await request(app).get('/api/indicators/1');

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Dólar PTAX (Venda)');
    expect(response.body.observations).toHaveLength(2);
    expect(response.body.limitations).toBeDefined();
    expect(response.body.limitations.length).toBeGreaterThan(0);
  });

  it('should return 404 for non-existent indicator', async () => {
    const response = await request(app).get('/api/indicators/999');

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Indicator not found');
  });

  it('should return 400 for invalid ID', async () => {
    const response = await request(app).get('/api/indicators/abc');

    expect(response.status).toBe(400);
  });
});

describe('GET /api/health', () => {
  it('should return health check', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });
});
