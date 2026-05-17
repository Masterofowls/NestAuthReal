import { contextBridge, ipcRenderer } from 'electron';
import { setupRenderer } from '@better-auth/electron/preload';

// Sets up the @better-auth/electron IPC bridges:
// getUser, signOut, authenticate, onAuthenticated, onAuthError, onUserUpdated
setupRenderer();

// Custom bridge: renderer triggers main to open the sign-in URL in a browser.
contextBridge.exposeInMainWorld(
  'requestAuth',
  (opts?: { provider?: string }) =>
    ipcRenderer.invoke('better-auth:request-auth', opts),
);
