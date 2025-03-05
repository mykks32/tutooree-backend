import { z } from 'zod';

const configSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(1),
  NODE_ENV: z
    .union([
      z.literal('production'),
      z.literal('development'),
    ])
    .default('development'),
});

export type Config = z.infer<typeof configSchema>;

const config = configSchema.parse(process.env);

export default config;
