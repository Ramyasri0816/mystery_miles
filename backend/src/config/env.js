import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env only as fallback; existing environment variables set by hosting platform are preserved
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: isProduction
    ? z
        .string({
          required_error: 'MONGODB_URI environment variable is required in production'
        })
        .min(1, 'MONGODB_URI cannot be empty')
    : z.string().default('mongodb://127.0.0.1:27017/mysterymiles'),
  JWT_SECRET: isProduction
    ? z
        .string({
          required_error: 'JWT_SECRET environment variable is required in production'
        })
        .min(16, 'JWT_SECRET must be at least 16 characters in production')
    : z.string().default('mysterymiles_default_dev_secret_key_change_in_production_min32chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:5173')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export default env;
