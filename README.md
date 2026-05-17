# NestAuth

Full-stack authentication starter using Better Auth, passkeys (WebAuthn),
NestJS, Next.js, and Drizzle/PostgreSQL.

## Overview

This workspace contains:

- `frontend`: Next.js 16 app (UI and browser auth client)
- `nest-auth-backend`: NestJS 11 API (Better Auth server and DB integration)

Auth supports:

- Email/session model from Better Auth core
- OAuth providers (Google, GitHub) when credentials are provided
- Passkeys via `@better-auth/passkey`

## Architecture

- Frontend uses `createAuthClient` and calls auth routes through
  `NEXT_PUBLIC_AUTH_BASE_URL` + `NEXT_PUBLIC_AUTH_BASE_PATH`.
- Backend exposes Better Auth under `/api/auth` via
  `@thallesp/nestjs-better-auth`.
- Backend CORS and Better Auth trusted origins are both derived from
  `AUTH_TRUSTED_ORIGINS`.
- Passkey relying-party settings are env-driven:
  `PASSKEY_RP_ID` and `PASSKEY_RP_NAME`.

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

- Passkey sign-in generally requires HTTPS in production. Localhost is allowed
  for development by browsers.
- If `next build` reports Google Fonts network warnings, verify network/DNS
  reachability to `fonts.googleapis.com`.
- If OAuth buttons do nothing, confirm provider keys are present in backend env.
- Ensure `BETTER_AUTH_URL` points to the backend public URL in deployed
  environments.
