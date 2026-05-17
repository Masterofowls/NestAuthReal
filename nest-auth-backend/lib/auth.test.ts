/**
 * Test-only auth instance — includes testUtils plugin for integration and E2E tests.
 * Keep this file out of production builds; it MUST NOT be imported from auth.ts.
 *
 * Usage in test files:
 *   import { testAuth } from '../lib/auth.test';
 *   const ctx = await testAuth.$context;
 *   const test = ctx.test;
 */
import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { passkey } from '@better-auth/passkey';
import { admin, bearer, lastLoginMethod, jwt, testUtils } from 'better-auth/plugins';
import { deviceAuthorization } from 'better-auth/plugins';
import { i18n } from '@better-auth/i18n';
import { db } from './db';
import * as schema from '../src/db/schema';
import { parseTrustedOrigins } from '../src/config/env';

const authBaseUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
const trustedOrigins = parseTrustedOrigins(
  process.env.AUTH_TRUSTED_ORIGINS ?? 'http://localhost:3001',
);

const socialProviders: Record<string, { clientId: string; clientSecret: string; redirectURI: string }> = {};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const baseUrl = authBaseUrl;
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectURI: new URL(`/api/auth/callback/google`, baseUrl).toString(),
  };
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  const baseUrl = authBaseUrl;
  socialProviders.github = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    redirectURI: new URL(`/api/auth/callback/github`, baseUrl).toString(),
  };
}

/** Use this in tests, never in production code. */
export const testAuth = betterAuth({
  baseURL: authBaseUrl,
  trustedOrigins,
  basePath: '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders,
  plugins: [
    jwt({
      jwks: { keyPairConfig: { alg: 'EdDSA' } },
      jwt: { expirationTime: '1h' },
    }),
    passkey({
      rpID: process.env.PASSKEY_RP_ID ?? 'localhost',
      rpName: process.env.PASSKEY_RP_NAME ?? 'NestAuth',
    }),
    admin(),
    bearer(),
    deviceAuthorization({
      verificationUri: '/device',
      schema: {},
    }),
    i18n({
      translations: {
        ru: {
          USER_NOT_FOUND: 'Пользователь не найден',
          INVALID_EMAIL_OR_PASSWORD: 'Неверный email или пароль',
          INVALID_PASSWORD: 'Неверный пароль',
          CREDENTIAL_ACCOUNT_NOT_FOUND: 'Учётная запись не найдена',
          EMAIL_NOT_VERIFIED: 'Email не подтверждён',
          SESSION_EXPIRED: 'Сессия истекла',
          USER_ALREADY_EXISTS: 'Пользователь уже существует',
          EMAIL_ALREADY_IN_USE: 'Email уже используется',
          INVALID_TOKEN: 'Недействительный токен',
          TOKEN_EXPIRED: 'Срок действия токена истёк',
          UNAUTHORIZED: 'Не авторизован',
          FORBIDDEN: 'Доступ запрещён',
          TOO_MANY_REQUESTS: 'Слишком много запросов',
          INTERNAL_SERVER_ERROR: 'Внутренняя ошибка сервера',
        },
      },
    }),
    lastLoginMethod({ storeInDatabase: true }),
    testUtils({ captureOTP: true }),
  ],
});
