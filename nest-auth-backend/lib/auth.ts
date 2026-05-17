import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { passkey } from '@better-auth/passkey';
import { admin } from 'better-auth/plugins/admin';
import { db } from './db';
import * as schema from '../src/db/schema';
import { parseTrustedOrigins } from '../src/config/env';

const authBaseUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
const trustedOrigins = parseTrustedOrigins(
  process.env.AUTH_TRUSTED_ORIGINS ?? 'http://localhost:3001',
);

const providerCallbackUrl = (
  provider: 'google' | 'github',
): string => {
  return new URL(`/api/auth/callback/${provider}`, authBaseUrl).toString();
};

const socialProviders: Record<string, { clientId: string; clientSecret: string; redirectURI: string }> = {};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectURI: providerCallbackUrl('google'),
  };
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    redirectURI: providerCallbackUrl('github'),
  };
}

export const auth = betterAuth({
  baseURL: authBaseUrl,
  trustedOrigins,
  basePath: '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  socialProviders,
  plugins: [
    passkey({
      rpID: process.env.PASSKEY_RP_ID ?? 'localhost',
      rpName: process.env.PASSKEY_RP_NAME ?? 'NestAuth',
    }),
    admin(),
  ],
});
