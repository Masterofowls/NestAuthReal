# NestAuth

Full-stack authentication starter using Better Auth, passkeys (WebAuthn),
NestJS, Next.js, and Drizzle/PostgreSQL.

## Overview

This workspace contains:

- `frontend`: Next.js 16 app (UI and browser auth client)
- `nest-auth-backend`: NestJS 11 API (Better Auth server and DB integration)

Auth supports:

- **Email/password** sign-in and sign-up (no email verification required)
- **OAuth** providers — Google and GitHub (enabled when credentials are set)
- **Passkeys** (WebAuthn) via `@better-auth/passkey`
- **JWT** token issuance via the `jwt` plugin (EdDSA/Ed25519, 1 h expiry)
- **Admin** controls via the `admin` plugin
- **Bearer** token auth via the `bearer` plugin
- **Device Authorization** flow via the `deviceAuthorization` plugin
- **i18n** error messages (Russian locale included)
- **Last login method** tracking stored in the database

## Architecture

- Frontend uses `createAuthClient` and calls auth routes through
  `NEXT_PUBLIC_AUTH_BASE_URL` + `NEXT_PUBLIC_AUTH_BASE_PATH`.
- Backend exposes Better Auth under `/api/auth` via
  `@thallesp/nestjs-better-auth`.
- Backend CORS and Better Auth trusted origins are both derived from
  `AUTH_TRUSTED_ORIGINS`.
- Passkey relying-party settings are env-driven:
  `PASSKEY_RP_ID` and `PASSKEY_RP_NAME`.
- JWT JWKS key pairs are stored in the `jwks` database table and rotated
  automatically by the `jwt` plugin.

## Quick Start

### 1. Install dependencies

Run in each app:

```powershell
Set-Location 'C:\Users\mrdan\NestAuth\nest-auth-backend'
npm install

Set-Location 'C:\Users\mrdan\NestAuth\frontend'
npm install
```

### 2. Configure environment

```powershell
Copy-Item 'C:\Users\mrdan\NestAuth\nest-auth-backend\.env.example' 'C:\Users\mrdan\NestAuth\nest-auth-backend\.env'
Copy-Item 'C:\Users\mrdan\NestAuth\frontend\.env.example' 'C:\Users\mrdan\NestAuth\frontend\.env'
```

Fill required backend secrets (`DATABASE_URL`, `BETTER_AUTH_SECRET`) and
provider credentials if using social login.

### 3. Prepare database

```powershell
Set-Location 'C:\Users\mrdan\NestAuth\nest-auth-backend'
npx drizzle-kit generate
npx drizzle-kit push
```

This creates all required tables:
`account`, `session`, `user`, `verification`, `passkey`, `jwks`, `deviceCode`.

### 4. Run backend

```powershell
Set-Location 'C:\Users\mrdan\NestAuth\nest-auth-backend'
npm run start:dev
```

### 5. Run frontend

```powershell
Set-Location 'C:\Users\mrdan\NestAuth\frontend'
npm run dev
```

Open `http://localhost:3001` (or your active Next.js dev port).

## Plugins

### Backend (`nest-auth-backend/lib/auth.ts`)

| Plugin | Import | Notes |
|---|---|---|
| `jwt` | `better-auth/plugins` | EdDSA/Ed25519 key pairs, 1 h expiry, JWKS table |
| `passkey` | `@better-auth/passkey` | RP ID/name from env |
| `admin` | `better-auth/plugins` | User ban, role management |
| `bearer` | `better-auth/plugins` | `Authorization: Bearer <token>` support |
| `deviceAuthorization` | `better-auth/plugins` | Device code flow, verification at `/device` |
| `i18n` | `@better-auth/i18n` | Russian (`ru`) error message translations |
| `lastLoginMethod` | `better-auth/plugins` | Stores last used auth method on the `user` row |

### Frontend (`frontend/src/lib/auth-client.ts`)

| Plugin | Import |
|---|---|
| `passkeyClient` | `@better-auth/passkey/client` |
| `adminClient` | `better-auth/client/plugins` |
| `deviceAuthorizationClient` | `better-auth/client/plugins` |
| `lastLoginMethodClient` | `better-auth/client/plugins` |
| `jwtClient` | `better-auth/client/plugins` |

## Testing

A separate test-only auth instance lives at
`nest-auth-backend/lib/auth.test.ts`. It mirrors the production config but
includes `testUtils({ captureOTP: true })` for integration and E2E tests.

```ts
import { testAuth } from '../lib/auth.test';

const ctx = await testAuth.$context;
const user = await ctx.test.createUser({ email: 'test@example.com', password: 'password123' });
const headers = await ctx.test.getAuthHeaders({ userId: user.id });
```

**Never import `auth.test.ts` from production code.**

## Mobile Integration

The NestAuth backend works out of the box with mobile clients. No backend
changes are needed — the existing `BETTER_AUTH_URL` and `AUTH_TRUSTED_ORIGINS`
env vars drive everything.

---

### Expo (React Native / iOS / Android / Web)

> Requires Expo SDK 53+ (SDK 55 recommended). New Architecture must be enabled.
> Older Expo SDK versions (legacy architecture) are not supported.

#### 1. Add your app scheme

In `app.json` inside your Expo project:

```json
{
  "expo": {
    "scheme": "myapp"
  }
}
```

#### 2. Add the Expo plugin to the NestAuth backend

```powershell
Set-Location 'C:\Users\mrdan\NestAuth\nest-auth-backend'
npm install @better-auth/expo
```

Add `expo()` to the plugins array in `nest-auth-backend/lib/auth.ts`:

```ts
import { expo } from '@better-auth/expo';

export const auth = betterAuth({
  // ...existing config...
  plugins: [
    expo(),           // add this
    // ...other plugins
  ],
});
```

#### 3. Add the Expo scheme to trusted origins

In `nest-auth-backend/.env` (or backend env vars), append your scheme and, for
development, the Expo dev URL pattern:

```dotenv
# Production scheme
AUTH_TRUSTED_ORIGINS=http://localhost:3001,myapp://

# Development — also allow the Expo Go exp:// scheme
# AUTH_TRUSTED_ORIGINS=http://localhost:3001,myapp://,exp://**
```

#### 4. Install Expo client dependencies

In your Expo app directory:

```powershell
npm install better-auth @better-auth/expo
npm install expo-network expo-secure-store
# Required for social OAuth (Google, GitHub, etc.)
npm install expo-linking expo-web-browser expo-constants
```

#### 5. Create the auth client

`lib/auth-client.ts` in your Expo app:

```ts
import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  baseURL: 'https://your-nestauth-backend.fly.dev', // BETTER_AUTH_URL
  basePath: '/api/auth',
  plugins: [
    expoClient({
      scheme: 'myapp',
      storagePrefix: 'myapp',
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;
```

#### 6. Authenticate users

```tsx
// Sign in
await authClient.signIn.email({ email, password });

// Sign up
await authClient.signUp.email({ email, password, name });

// Social login (opens browser, deep-links back via scheme)
await authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' });

// Session hook
const { data: session } = authClient.useSession();
```

#### 7. Authenticated API requests

```ts
const cookies = authClient.getCookie();
const response = await fetch('https://your-nestauth-backend.fly.dev/api/secure', {
  headers: { Cookie: cookies },
  credentials: 'omit', // important — don't let fetch override the cookie header
});
```

#### Metro bundler note

Package exports are enabled by default from Expo SDK 53+. If you have a custom
`metro.config.js`, make sure `unstable_enablePackageExports` is not set to
`false`.

---

### Lynx (Android / iOS / Web — native rendering)

> [Lynx](https://lynxjs.org/) is a cross-platform framework with native rendering.
> No backend changes are required.

#### 1. Install dependencies

In your Lynx app directory:

```powershell
npm install better-auth @lynx-js/react
```

#### 2. Create the auth client

```ts
// lib/auth-client.ts
import { createAuthClient } from 'better-auth/lynx';

export const authClient = createAuthClient({
  baseURL: 'https://your-nestauth-backend.fly.dev', // BETTER_AUTH_URL
  basePath: '/api/auth',
});
```

#### 3. Authenticate users

```ts
import { authClient } from './lib/auth-client';

// Sign in
await authClient.signIn.email({ email: 'user@example.com', password: 'password' });

// Sign up
await authClient.signUp.email({ email: 'user@example.com', password: 'password', name: 'Alice' });

// Sign out
await authClient.signOut();
```

#### 4. Session hook

```tsx
import { authClient } from '../lib/auth-client';

export function User() {
  const { data: session, isPending, error } = authClient.useSession();

  if (isPending) return <text>Loading...</text>;
  if (error) return <text>Error: {error.message}</text>;
  return <text>Welcome, {session?.user.name}</text>;
}
```

#### 5. Reactive store (optimized re-renders)

```ts
import { useStore } from 'better-auth/lynx';
import { authClient } from '../lib/auth-client';

export function SessionInfo() {
  // Only re-render when name or email change
  const session = useStore(authClient.$store.session, {
    keys: ['user.name', 'user.email'],
  });
  return <text>{session?.user.name}</text>;
}
```

#### 6. Add plugins (same as any other client)

```ts
import { createAuthClient } from 'better-auth/lynx';
import { jwtClient, adminClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: 'https://your-nestauth-backend.fly.dev',
  basePath: '/api/auth',
  plugins: [jwtClient(), adminClient()],
});
```

---

### Trusted origins checklist for mobile

Update `AUTH_TRUSTED_ORIGINS` in the backend env to include all client origins:

| Client | Entry to add |
|---|---|
| Next.js (local) | `http://localhost:3001` |
| Expo production | `myapp://` |
| Expo development | `exp://**` |
| Lynx web | `http://localhost:3000` |
| Deployed frontend | `https://your-app.vercel.app` |

---

## Electron Integration

Electron apps authenticate through the **system browser** — the NestAuth Next.js
frontend acts as the web-side proxy, and the Electron main process handles
deep-link callbacks. Three pieces need to be wired together:

```
NestAuth backend  ←→  Next.js frontend (proxy)  ←→  Electron app
```

> Supported: two major versions behind the latest stable Electron release.

### 1. Install packages

In the NestAuth backend **and** in your Electron project:

```powershell
npm install better-auth @better-auth/electron
```

In the NestAuth Next.js frontend:

```powershell
# (already installed — just needs the proxy plugin configured)
npm install better-auth @better-auth/electron
```

Optional — use the built-in `conf`-based storage in Electron instead of a
custom implementation:

```powershell
# run inside your Electron project
npm install conf
```

### 2. Add the `electron()` plugin to the NestAuth backend

`nest-auth-backend/lib/auth.ts`:

```ts
import { electron } from '@better-auth/electron';

export const auth = betterAuth({
  // ...existing config...
  trustedOrigins: [
    // ...existing origins...
    'com.example.app:/', // Electron protocol scheme
  ],
  plugins: [
    electron(), // add this
    // ...other plugins
  ],
});
```

Add the protocol scheme to `AUTH_TRUSTED_ORIGINS` in `.env`:

```dotenv
AUTH_TRUSTED_ORIGINS=http://localhost:3001,com.example.app:/
```

### 3. Add the proxy plugin to the Next.js frontend

`frontend/src/lib/auth-client.ts`:

```ts
import { createAuthClient } from 'better-auth/react';
import { electronProxyClient } from '@better-auth/electron/proxy';
// ...other imports...

export const authClient = createAuthClient({
  baseURL: authClientEnv.authBaseUrl,
  basePath: authClientEnv.authBasePath,
  plugins: [
    electronProxyClient({
      protocol: { scheme: 'com.example.app' },
    }),
    // ...other plugins
  ],
});
```

Add `ensureElectronRedirect()` to your sign-in page so authenticated users are
redirected back into the Electron app. Preserve PKCE parameters via
`fetchOptions.query`:

```tsx
// frontend/src/app/sign-in/page.tsx (or wherever sign-in lives)
'use client';
import { useEffect, use } from 'react';
import { authClient } from '@/lib/auth-client';

export default function SignIn({ searchParams }) {
  const query = use(searchParams);

  useEffect(() => {
    const id = authClient.ensureElectronRedirect();
    return () => clearTimeout(id);
  }, []);

  return (
    <button onClick={() =>
      authClient.signIn.social({ provider: 'google', fetchOptions: { query } })
    }>
      Sign in with Google
    </button>
  );
}
```

### 4. Create the Electron auth client (main process)

`electron/lib/auth-client.ts`:

```ts
import { createAuthClient } from 'better-auth/client';
import { electronClient } from '@better-auth/electron/client';
import { storage } from '@better-auth/electron/storage'; // conf-based storage

export const authClient = createAuthClient({
  baseURL: 'https://your-nestauth-frontend.vercel.app', // Next.js frontend URL
  plugins: [
    electronClient({
      signInURL: 'https://your-nestauth-frontend.vercel.app/sign-in',
      protocol: { scheme: 'com.example.app' },
      storage: storage(), // or provide { getItem, setItem }
    }),
  ],
});
```

> **Security**: never expose `authClient` directly to the renderer process.
> Always use IPC bridges.

### 5. Register the protocol scheme

In your Electron build config (`forge.config.js` / `electron-builder.yml`):

```js
// forge.config.js
module.exports = {
  packagerConfig: {
    protocols: [{ name: 'MyApp Protocol', schemes: ['com.example.app'] }],
  },
};
```

### 6. Set up the main process

`electron/main.ts` — call `setupMain()` **before** the app is ready:

```ts
import { authClient } from './lib/auth-client';

authClient.setupMain(); // registers protocol handler, IPC bridges, CSP

app.whenReady().then(() => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      nodeIntegration: false,   // required
      contextIsolation: true,   // required
    },
  });
  win.loadURL('...');
});
```

### 7. Set up the preload script

`electron/preload.ts`:

```ts
import { setupRenderer } from '@better-auth/electron/preload';

setupRenderer(); // exposes safe IPC bridges to the renderer
```

Expose TypeScript types for the bridges in `electron/preload.d.ts`:

```ts
import type { authClient } from './lib/auth-client';

declare global {
  type Bridges = typeof authClient.$Infer.Bridges;
  interface Window extends Bridges {}
}
```

If using `electron-vite`, make sure `@better-auth/electron` is bundled into the
preload (not externalized):

```ts
// electron.vite.config.ts
export default defineConfig({
  preload: {
    build: {
      externalizeDeps: { exclude: ['@better-auth/electron'] },
    },
  },
});
```

### 8. Use auth in the renderer process

The preload bridges are available on `window`:

```tsx
// electron/App.tsx
import { useEffect } from 'react';

function Auth() {
  useEffect(() => {
    const unsub1 = window.onAuthenticated((user) => {
      console.log('Signed in:', user);
    });
    const unsub2 = window.onAuthError((ctx) => {
      console.error('Auth error:', ctx.message);
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  return (
    <>
      {/* Opens system browser → Next.js sign-in page → deep-links back */}
      <button onClick={() => window.requestAuth()}>Sign in</button>
      <button onClick={() => window.requestAuth({ provider: 'google' })}>
        Sign in with Google
      </button>
      <button onClick={() => window.signOut()}>Sign out</button>
    </>
  );
}
```

Subscribe to user updates:

```tsx
useEffect(() => {
  const unsub = window.onUserUpdated((user) => console.log('User:', user));
  return () => unsub();
}, []);
```

### 9. Manual token exchange (fallback)

If deep links don't work on some Linux environments:

```tsx
// Renderer — let user paste the 32-char code manually
<input
  maxLength={32}
  onChange={(e) => {
    if (e.target.value.length === 32) {
      // requestAuth() must have been called first
      window.authenticate({ token: e.target.value });
    }
  }}
/>
```

The auth code is also available on the web side via
`authClient.electron.getAuthorizationCode()`.

---

### Electron + trusted origins summary

| Origin | Add to `AUTH_TRUSTED_ORIGINS` |
|---|---|
| Electron production scheme | `com.example.app:/` |
| Electron development | `com.example.app:/` (same) |

---

## Universal Cross-Platform Auth (Web + Mobile + Desktop)

All three platforms — **Next.js**, **Expo**, and **Electron** — share a single
OAuth credential set. No separate Google App, GitHub App, or OAuth client per
platform is needed.

### How it works

```
┌─────────────────────────────────────────────────────┐
│  Google / GitHub OAuth App                          │
│  Redirect URI: https://your-backend.fly.dev/        │
│                api/auth/callback/google             │
└──────────────────────────┬──────────────────────────┘
                           │ (one credential for all platforms)
           ┌───────────────▼───────────────┐
           │     NestAuth Backend          │
           │  better-auth + expo() +       │
           │  electron() plugins           │
           └───────┬───────────┬───────────┘
                   │           │
       ┌───────────▼─┐     ┌───▼─────────────────────┐
       │  Next.js    │     │  Mobile / Desktop        │
       │  (web)      │     │  deep-link redirect      │
       └─────────────┘     │  myapp://  (Expo)        │
                           │  com.example.app:// (Electron)│
                           └──────────────────────────┘
```

**The backend is the only OAuth redirect target.** After it processes the
callback, it redirects to the `callbackURL` the client originally passed —
which is a deep-link scheme for mobile/desktop, or a normal path for web. The
app scheme URLs never appear in your Google/GitHub OAuth configuration.

---

### Step 1 — One OAuth credential, registered once

#### Google

1. Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** of type **Web application**
3. Under **Authorized redirect URIs** add only:
   ```
   https://your-nestauth-backend.fly.dev/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google   ← local dev
   ```
4. Copy the client ID and secret — use them for **all** platforms

#### GitHub

1. Go to [GitHub → Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Create **one** OAuth App
3. **Authorization callback URL**:
   ```
   https://your-nestauth-backend.fly.dev/api/auth/callback/github
   ```
4. Copy the client ID and secret — use them for **all** platforms

> **You do not add `myapp://` or `com.example.app://` to Google/GitHub.**
> Those deep links are handled entirely by Better Auth after it processes
> the OAuth callback.

---

### Step 2 — Backend: one config, all plugins

`nest-auth-backend/lib/auth.ts`:

```ts
import { betterAuth } from 'better-auth';
import { expo } from '@better-auth/expo';
import { electron } from '@better-auth/electron';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: '/api/auth',
  secret: process.env.BETTER_AUTH_SECRET,

  // All platform schemes in one list
  trustedOrigins: process.env.AUTH_TRUSTED_ORIGINS?.split(',') ?? [],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,     // same for all platforms
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  plugins: [
    expo(),       // handles Expo deep-link callbacks
    electron(),   // handles Electron deep-link callbacks
    // ...jwt, passkey, admin, etc.
  ],
});
```

`nest-auth-backend/.env`:

```dotenv
BETTER_AUTH_URL=https://your-nestauth-backend.fly.dev
BETTER_AUTH_SECRET=your-32-char-secret

# All client origins — web, Expo scheme, Electron scheme
AUTH_TRUSTED_ORIGINS=http://localhost:3001,https://your-app.vercel.app,myapp://,com.example.app:/

GOOGLE_CLIENT_ID=…      # same value used by all clients
GOOGLE_CLIENT_SECRET=…
GITHUB_CLIENT_ID=…
GITHUB_CLIENT_SECRET=…
```

---

### Step 3 — Web client (Next.js) — no changes needed

The existing `frontend/src/lib/auth-client.ts` already works for web. Add
the `electronProxyClient` only if users can also open the web app from Electron
(optional):

```ts
// Already set up — nothing extra needed for web-only users
export const authClient = createAuthClient({
  baseURL: authClientEnv.authBaseUrl,
  basePath: authClientEnv.authBasePath,
  plugins: [
    passkeyClient(),
    adminClient(),
    // Add this only if the Next.js frontend serves as the Electron sign-in proxy:
    // electronProxyClient({ protocol: { scheme: 'com.example.app' } }),
  ],
});
```

---

### Step 4 — Expo client — points at the backend directly

`expo-app/lib/auth-client.ts`:

```ts
import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  // ← points directly at the NestAuth BACKEND, not the Next.js frontend
  baseURL: 'https://your-nestauth-backend.fly.dev',
  basePath: '/api/auth',
  plugins: [
    expoClient({
      scheme: 'myapp',
      storagePrefix: 'myapp',
      storage: SecureStore,
    }),
  ],
});
```

Sign in — the `callbackURL` deep link is injected automatically by `expoClient`:

```ts
// email/password
await authClient.signIn.email({ email, password });

// OAuth — opens system browser, Google redirects to backend,
// backend deep-links back to myapp://
await authClient.signIn.social({ provider: 'google' });
await authClient.signIn.social({ provider: 'github' });
```

---

### Step 5 — Electron client — also points at the backend

`electron/lib/auth-client.ts`:

```ts
import { createAuthClient } from 'better-auth/client';
import { electronClient } from '@better-auth/electron/client';
import { storage } from '@better-auth/electron/storage';

export const authClient = createAuthClient({
  // ← points at the NestAuth backend
  // If using the Next.js frontend as sign-in UI, set signInURL to the frontend
  baseURL: 'https://your-nestauth-backend.fly.dev',
  plugins: [
    electronClient({
      signInURL: 'https://your-app.vercel.app/sign-in', // Next.js sign-in page
      protocol: { scheme: 'com.example.app' },
      storage: storage(),
    }),
  ],
});
```

The OAuth flow for Electron:
1. `window.requestAuth()` opens system browser → Next.js sign-in page
2. User clicks Google → browser navigates to backend OAuth initiation
3. Google redirects to backend callback URL (`/api/auth/callback/google`)
4. Backend exchanges code, creates session, redirects to `com.example.app://`
5. Electron intercepts the deep link, extracts the code, finalises the session

---

### Step 6 — OAuth redirect chain illustrated

```
Expo/Electron app
  │
  ▼  signIn.social({ provider: 'google' })
  │
  ▼  GET /api/auth/signin/google?callbackURL=myapp%3A%2F%2F…
  │      (NestAuth backend — expo/electron plugin injects callbackURL)
  │
  ▼  302 → accounts.google.com/o/oauth2/auth?…
  │             redirect_uri=https://your-backend.fly.dev/api/auth/callback/google
  │
  ▼  User approves → Google POSTs code to backend redirect_uri
  │
  ▼  Backend exchanges code, creates session
  │
  ▼  302 → myapp://auth/callback?code=…   (Expo)
       OR   com.example.app://auth/callback?code=…  (Electron)
  │
  ▼  App deep-link handler exchanges code for session cookie
```

---

### Combined trusted origins reference

Update `AUTH_TRUSTED_ORIGINS` in the backend `.env` / Fly secrets to cover
every active client:

| Platform | Entry |
|---|---|
| Next.js local dev | `http://localhost:3001` |
| Next.js deployed | `https://your-app.vercel.app` |
| Expo production | `myapp://` |
| Expo dev (Expo Go) | `exp://**` |
| Electron | `com.example.app:/` |

```dotenv
AUTH_TRUSTED_ORIGINS=http://localhost:3001,https://your-app.vercel.app,myapp://,exp://**,com.example.app:/
```

---

### What you never need to do

- ❌ Register `myapp://` or `com.example.app://` as OAuth redirect URIs in Google/GitHub
- ❌ Create a second Google OAuth client ID for mobile
- ❌ Create a separate GitHub OAuth App for Electron
- ❌ Duplicate `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` per platform
- ❌ Run a separate auth server per platform

## V1 Auth Standard (Applied)

These keys are the stable contract for reusing this auth system in future
projects.

### Backend keys

Required:

- `PORT`
- `NODE_ENV`
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `AUTH_TRUSTED_ORIGINS`
- `PASSKEY_RP_ID`
- `PASSKEY_RP_NAME`

Optional:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`

### Frontend keys

- `NEXT_PUBLIC_AUTH_BASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_AUTH_BASE_PATH`

## Deployment

### Backend (Fly.io)

1. Ensure a valid `fly.toml` exists in `nest-auth-backend`.
2. Set Fly secrets for backend env keys.
3. Deploy:

```powershell
Set-Location 'C:\Users\mrdan\NestAuth\nest-auth-backend'
fly deploy
```

### Frontend (Vercel)

1. Import `frontend` as a Vercel project (or use existing `.vercel/project.json`).
2. Configure frontend env vars in Vercel.
3. Deploy:

```powershell
Set-Location 'C:\Users\mrdan\NestAuth\frontend'
vercel deploy --prod
```

## Troubleshooting

- Passkey sign-in requires HTTPS in production. Localhost is allowed
  for development by browsers.
- If `next build` reports Google Fonts network warnings, verify network/DNS
  reachability to `fonts.googleapis.com`.
- If OAuth buttons do nothing, confirm provider keys are present in backend env.
- Ensure `BETTER_AUTH_URL` points to the backend public URL in deployed
  environments.
- The `deviceAuthorization` plugin requires `schema: {}` in its options to
  satisfy a Zod v4 compatibility constraint. Do not remove it.
- JWT key pairs are generated automatically on first use and stored in the
  `jwks` table. No manual key generation is needed.
