import { createAuthClient } from 'better-auth/client';
import { electronClient } from '@better-auth/electron/client';
import { storage } from '@better-auth/electron/storage';

/**
 * Auth client for the Electron main process.
 *
 * baseURL   → NestAuth backend  (http://localhost:3000)
 * signInURL → Next.js frontend  (http://localhost:3001)
 *
 * IMPORTANT: Never expose this client directly to the renderer process.
 * Use the IPC bridges set up by setupMain() / setupRenderer() instead.
 */
export const authClient = createAuthClient({
  baseURL: process.env['BETTER_AUTH_BACKEND_URL'] ?? 'http://localhost:3000',
  basePath: '/api/auth',
  plugins: [
    electronClient({
      // The Next.js page that calls ensureElectronRedirect()
      signInURL:
        process.env['BETTER_AUTH_SIGN_IN_URL'] ?? 'http://localhost:3001',
      protocol: {
        // Must match trustedOrigins in the backend and electronProxyClient
        scheme: 'com.example.nestauth',
      },
      // Default conf-based storage persisted in userData directory
      storage: storage(),
    }),
  ],
});
