import { setupRenderer } from '@better-auth/electron/preload';

// Sets up the @better-auth/electron IPC bridges:
// window.getUser, window.requestAuth, window.signOut, window.authenticate,
// window.onAuthenticated, window.onAuthError, window.onUserUpdated
//
// window.requestAuth() opens the frontend PKCE sign-in URL (signInURL +
// code_challenge + state). All auth methods — email, OAuth, passkey — flow
// through the frontend, completing via ensureElectronRedirect() on that page.
setupRenderer();
