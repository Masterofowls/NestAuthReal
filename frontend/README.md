# Frontend

Next.js frontend for the NestAuth stack. It renders login UI and uses the
Better Auth browser client for social and passkey flows.

## Stack

- Next.js 16
- React 19
- Better Auth React client
- Passkey client plugin

## Environment

Copy `.env.example` to `.env` and adjust values:

```powershell
Copy-Item 'C:\Users\mrdan\NestAuth\frontend\.env.example' 'C:\Users\mrdan\NestAuth\frontend\.env'
```

Variables:

- `NEXT_PUBLIC_AUTH_BASE_URL` auth server URL (backend)
- `NEXT_PUBLIC_APP_URL` frontend public URL used for callback URL generation
- `NEXT_PUBLIC_AUTH_BASE_PATH` auth route base path (default `/api/auth`)

## Scripts

```powershell
npm run dev
npm run lint
npm run build
npm run start
```

## Local Development

1. Start backend first on `http://localhost:3000`.
2. Start frontend:

```powershell
Set-Location 'C:\Users\mrdan\NestAuth\frontend'
npm run dev
```

3. Open your app URL (usually `http://localhost:3001`).

## Auth Flow Notes

- OAuth callback URL is derived from `NEXT_PUBLIC_APP_URL`.
- Auth client base URL/path is derived from env and not hardcoded.
- Rewrites proxy `NEXT_PUBLIC_AUTH_BASE_PATH` to backend auth routes.

## Build Notes

- `next build` can emit warnings if Google Fonts are unreachable on current
	network/DNS.
- Type checks are strict; run `npx tsc --noEmit` to verify TS errors quickly.

## Deploy (Vercel)

```powershell
Set-Location 'C:\Users\mrdan\NestAuth\frontend'
vercel deploy --prod
```

Set the same env vars in Vercel project settings before deploying.
