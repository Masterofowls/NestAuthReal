import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { passkey } from '@better-auth/passkey';
import { admin, bearer, lastLoginMethod, jwt } from 'better-auth/plugins';
import { deviceAuthorization } from 'better-auth/plugins';
import { i18n } from '@better-auth/i18n';
import { electron } from '@better-auth/electron';
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
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders,
  plugins: [
    electron(),
    jwt({
      jwks: {
        keyPairConfig: { alg: 'EdDSA' },
      },
      jwt: {
        expirationTime: '1h',
      },
    }),
    passkey({
      rpID: process.env.PASSKEY_RP_ID ?? 'localhost',
      rpName: process.env.PASSKEY_RP_NAME ?? 'NestAuth',
    }),
    admin(),
    bearer(),
    deviceAuthorization({
      verificationUri: '/device',
      // schema: {} required to satisfy Zod v4 — field is non-optional in
      // the plugin's z.custom() validator; value is merged with the plugin's
      // built-in deviceCode table schema via mergeSchema() internally.
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
  ],
});
