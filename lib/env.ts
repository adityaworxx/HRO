import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_DATA_SOURCE: z.enum(['mock', 'http', 'supabase']).default('mock'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000/api'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
});

const parsedEnv = envSchema.safeParse({
  NEXT_PUBLIC_DATA_SOURCE: process.env.NEXT_PUBLIC_DATA_SOURCE,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Environment configuration error in HRO application.');
}

export const env = parsedEnv.data;
