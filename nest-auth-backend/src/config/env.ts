import { z } from 'zod';

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess(
    (value) => (value === '' ? undefined : value),
    schema.optional(),
  );

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  AUTH_TRUSTED_ORIGINS: z.string().default('http://localhost:3001'),
  PASSKEY_RP_ID: z.string().default('localhost'),
  PASSKEY_RP_NAME: z.string().default('NestAuth'),
  GOOGLE_CLIENT_ID: emptyToUndefined(z.string()),
  GOOGLE_CLIENT_SECRET: emptyToUndefined(z.string()),
  GITHUB_CLIENT_ID: emptyToUndefined(z.string()),
  GITHUB_CLIENT_SECRET: emptyToUndefined(z.string()),
  RESEND_API_KEY: emptyToUndefined(z.string()),
  EMAIL_FROM: emptyToUndefined(z.string().email()),
});

export const validateEnv = (config: Record<string, unknown>) => {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(
      JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
    );
  }
  return parsed.data;
};

export const parseTrustedOrigins = (value: string): string[] => {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};
