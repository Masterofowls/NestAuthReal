# Frontend

Next.js frontend for the NestAuth stack. This app renders the auth UI and
drives all browser-side Better Auth flows (email/password, OAuth, passkeys,
device authorization helpers, and session state).

## Stack

- Next.js 16
- React 19
- Better Auth React client
- `@better-auth/passkey` client plugin
- `@better-auth/electron` proxy client plugin

## Auth Client Wiring

The auth client is configured in `src/lib/auth-client.ts` with:

- `passkeyClient()`
- `adminClient()`
- `deviceAuthorizationClient()`
- `lastLoginMethodClient()`
- `jwtClient()`
- `electronProxyClient({ protocol: { scheme: 'com.example.nestauth' } })`

The key behavior is in `src/lib/auth-env.ts`:

- `baseURL` uses `NEXT_PUBLIC_APP_URL` (frontend origin)
- `basePath` uses `NEXT_PUBLIC_AUTH_BASE_PATH` (default `/api/auth`)

This makes auth calls same-origin from the browser, then Next.js rewrites proxy
them to the backend.

## Next.js Rewrite Proxy

`next.config.ts` rewrites:

- `source: ${NEXT_PUBLIC_AUTH_BASE_PATH}/:path*`
- `destination: ${NEXT_PUBLIC_AUTH_BASE_URL}${NEXT_PUBLIC_AUTH_BASE_PATH}/:path*`

Example production mapping:

- Browser calls:
	`https://frontend-five-gold-zmyppyq06g.vercel.app/api/auth/...`
- Next.js proxies to:
	`https://nest-auth-backend.fly.dev/api/auth/...`

## Working UI Flows

`src/app/page.tsx` currently supports:

- Email sign-in: `signIn.email({ email, password })`
- Email sign-up: `authClient.signUp.email({ email, password, name })`
- Google OAuth: `signIn.social({ provider: 'google', callbackURL })`
- GitHub OAuth: `signIn.social({ provider: 'github', callbackURL })`
- Passkey sign-in: `authClient.signIn.passkey()`
- Add passkey (authenticated):
	`authClient.passkey.addPasskey({ name, authenticatorAttachment: 'platform' })`
- Device verification entry: navigate to `/device`
- Sign-out: `signOut()`

The UI also shows `authClient.getLastUsedLoginMethod()` and runs
`authClient.ensureElectronRedirect()` for desktop bridge support.

## Environment

Copy `.env.example`:

```powershell
Copy-Item 'C:\Users\mrdan\NestAuth\frontend\.env.example' 'C:\Users\mrdan\NestAuth\frontend\.env'
```

Variables:

- `NEXT_PUBLIC_AUTH_BASE_URL`: backend public URL
- `NEXT_PUBLIC_APP_URL`: frontend public URL
- `NEXT_PUBLIC_AUTH_BASE_PATH`: Better Auth base path (`/api/auth`)

Production values currently used:

- `NEXT_PUBLIC_AUTH_BASE_URL=https://nest-auth-backend.fly.dev`
- `NEXT_PUBLIC_APP_URL=https://frontend-five-gold-zmyppyq06g.vercel.app`
- `NEXT_PUBLIC_AUTH_BASE_PATH=/api/auth`

## Local Development

1. Start backend at `http://localhost:3000`.
2. Start frontend:

```powershell
Set-Location 'C:\Users\mrdan\NestAuth\frontend'
npm run dev
```

3. Open `http://localhost:3001` (or active Next.js port).

## Scripts

```powershell
npm run dev
npm run lint
npm run build
npm run start
```

## Deployment (Vercel)

```powershell
Set-Location 'C:\Users\mrdan\NestAuth\frontend'
vercel deploy --prod
```

Set all three `NEXT_PUBLIC_*` auth variables in Vercel before deploy.
