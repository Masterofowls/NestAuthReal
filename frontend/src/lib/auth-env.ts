const withDefault = (value: string | undefined, fallback: string): string => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
};

export const authClientEnv = {
  authBaseUrl: withDefault(
    process.env.NEXT_PUBLIC_AUTH_BASE_URL,
    'http://localhost:3000',
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
