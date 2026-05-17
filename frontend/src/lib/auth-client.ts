import { createAuthClient } from 'better-auth/react';
import { passkeyClient } from '@better-auth/passkey/client';
import { adminClient } from 'better-auth/client/plugins';
import { authClientEnv } from './auth-env';

export const authClient = createAuthClient({
  baseURL: authClientEnv.authBaseUrl,
  basePath: authClientEnv.authBasePath,
  plugins: [passkeyClient(), adminClient()],
});

export const { signIn, signOut, signUp, useSession } = authClient;
