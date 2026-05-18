import { createAuthClient } from 'better-auth/client';
import { electronClient } from '@better-auth/electron/client';
import { storage } from '@better-auth/electron/storage';

/**
 * Auth client for the Electron main process.
 *
 * Both baseURL and signInURL point at the frontend so every auth request
 * travels through the same Next.js /api/auth rewrite proxy the browser
 * frontend uses — no separate backend URL is needed.
 *
 * IMPORTANT: Never expose this client directly to the renderer process.
 * Use the IPC bridges set up by setupMain() / setupRenderer() instead.
 */
const AUTH_URL = process.env['BETTER_AUTH_URL'] ?? 'http://localhost:3001';

export const authClient = createAuthClient({
  baseURL: AUTH_URL,
  basePath: '/api/auth',
  plugins: [
    electronClient({
      // Same origin as baseURL — the Next.js page that calls
      // ensureElectronRedirect() after sign-in completes.
      signInURL: AUTH_URL,
      protocol: {
        // Must match trustedOrigins in the backend and electronProxyClient.
        scheme: 'com.example.nestauth',
      },
      // Persisted token storage in the Electron userData directory.
      storage: storage(),
    }),
  ],
});
