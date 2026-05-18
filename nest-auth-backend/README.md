# Backend

NestJS API for Better Auth with passkeys, OAuth, JWT, bearer auth, admin,
device authorization, and i18n.

## Stack

- NestJS 11
- Better Auth v1.6.11
- `@thallesp/nestjs-better-auth` adapter
- Drizzle ORM + PostgreSQL
- `@better-auth/passkey`

## Auth Server Wiring

Primary auth config lives in `lib/auth.ts`.

Better Auth is configured with:

- `baseURL: BETTER_AUTH_URL`
- `basePath: '/api/auth'`
- `trustedOrigins` parsed from `AUTH_TRUSTED_ORIGINS`
- Drizzle adapter and DB schema in `src/db/schema.ts`

Mounted route base is `/api/auth`.

## Active Plugins (Working)

`lib/auth.ts` plugin chain:

- `electron()`
- `jwt({ jwks: { keyPairConfig: { alg: 'EdDSA' } }, jwt: { expirationTime: '1h' } })`
- `passkey({ rpID: PASSKEY_RP_ID, rpName: PASSKEY_RP_NAME })`
- `admin()`
- `bearer()`
- `deviceAuthorization({ verificationUri: '/device', schema: {} })`
- `i18n({ translations: { ru: ... } })`
- `lastLoginMethod({ storeInDatabase: true })`

Important project invariant:

- Keep `deviceAuthorization({ schema: {} })` as-is. This is required in this
  setup and should not be removed.

## OAuth Logic

- Provider callbacks are generated from `BETTER_AUTH_URL`:
  - `/api/auth/callback/google`
  - `/api/auth/callback/github`
- Google/GitHub provider blocks are enabled only if both env vars exist.

## Passkey Logic

- Passkey endpoints are registered under `/api/auth/passkey/*`.
- Frontend passkey registration and sign-in are supported and working.
- `PASSKEY_RP_ID` must match the frontend host where WebAuthn is executed.

Current production value:

- `PASSKEY_RP_ID=frontend-five-gold-zmyppyq06g.vercel.app`

Do not set RP ID to backend host.

## Environment

Copy and fill `.env`:

```powershell
Copy-Item 'C:\Users\mrdan\NestAuth\nest-auth-backend\.env.example' 'C:\Users\mrdan\NestAuth\nest-auth-backend\.env'
```

Required:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET` (32+ chars)
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

## Database and Schema

Drizzle config: `drizzle.config.ts`

Auth schema tables include:

- `user`
- `session`
- `account`
- `verification`
- `passkey`
- `jwks`

Typical workflow:

```powershell
npx drizzle-kit generate
npx drizzle-kit push
```

## Scripts

```powershell
npm run start
npm run start:dev
npm run start:prod
npm run build
npm run lint
npm run test
npm run test:e2e
```

## Local Development

```powershell
Set-Location 'C:\Users\mrdan\NestAuth\nest-auth-backend'
npm run start:dev
```

Default local API URL: `http://localhost:3000`.

## Deploy (Fly.io)

```powershell
Set-Location 'C:\Users\mrdan\NestAuth\nest-auth-backend'
fly deploy
```

Current production backend:

- `https://nest-auth-backend.fly.dev`

## Smoke Checks

```powershell
# Passkey route should return an auth error (401/4xx), not 404
curl.exe -i "https://nest-auth-backend.fly.dev/api/auth/passkey/generate-register-options"

# OAuth callback route exists under basePath
curl.exe -i "https://nest-auth-backend.fly.dev/api/auth/callback/google"
```
