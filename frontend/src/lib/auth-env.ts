const withDefault = (value: string | undefined, fallback: string): string => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

export const authClientEnv = {
  // Point the auth client at the frontend (same origin) so requests go
  // through Next.js rewrites → backend proxy, avoiding CORS entirely.
  authBaseUrl: withDefault(
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3001',
  ),
  appUrl: withDefault(process.env.NEXT_PUBLIC_APP_URL, 'http://localhost:3001'),
  authBasePath: withDefault(
    process.env.NEXT_PUBLIC_AUTH_BASE_PATH,
    '/api/auth',
  ),
};

export const createOAuthCallbackURL = (): string => {
  return new URL('/', authClientEnv.appUrl).toString();
};
