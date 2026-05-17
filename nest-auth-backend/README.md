# Backend

NestJS API for Better Auth + passkey authentication.

## Stack

- NestJS 11
- Better Auth + `@thallesp/nestjs-better-auth`
- Drizzle ORM + PostgreSQL
- Passkeys via `@better-auth/passkey`

## Environment

Copy and fill `.env`:

```powershell
Copy-Item 'C:\Users\mrdan\NestAuth\nest-auth-backend\.env.example' 'C:\Users\mrdan\NestAuth\nest-auth-backend\.env'
```

Required values:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET` (32+ chars)
- `BETTER_AUTH_URL`
- `AUTH_TRUSTED_ORIGINS`
- `PASSKEY_RP_ID`
- `PASSKEY_RP_NAME`

Optional OAuth values:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

OAuth providers are enabled only when both ID and secret are present.

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

## Database and Schema

Drizzle config is in `drizzle.config.ts` and schema in `src/db/schema.ts`.

Typical workflow:

```powershell
npx drizzle-kit generate
npx drizzle-kit push
```

Better Auth schema generation helper:

```powershell
npx @better-auth/cli@latest generate
```

## Auth Behavior

- Better Auth base URL comes from `BETTER_AUTH_URL`.
- Trusted origins come from `AUTH_TRUSTED_ORIGINS` (comma-separated).
- CORS uses the same trusted-origins list.
- Passkey RP settings come from `PASSKEY_RP_ID` and `PASSKEY_RP_NAME`.

## Local Development

```powershell
Set-Location 'C:\Users\mrdan\NestAuth\nest-auth-backend'
npm run start:dev
```

API default: `http://localhost:3000`.

## Deploy (Fly.io)

```powershell
Set-Location 'C:\Users\mrdan\NestAuth\nest-auth-backend'
fly deploy
```

Ensure all required env vars are set as Fly secrets.

## Known Development Notes

- Current lint setup reports some existing issues in test/DB modules unrelated
  to auth runtime.
- `npm run build` is the reliable check for backend compile health.
