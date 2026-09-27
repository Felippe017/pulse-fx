import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().default('postgresql://pulsefx:pulsefx_secret@localhost:5432/pulsefx'),
  FRED_API_KEY: z.string().min(1, 'FRED_API_KEY is required'),
  API_PORT: z.coerce.number().default(3001),
  SYNC_TTL_MINUTES: z.coerce.number().default(60),
  ADMIN_KEY: z.string().default('pulse-fx-admin-key'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

function loadEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();
export type Env = z.infer<typeof envSchema>;
