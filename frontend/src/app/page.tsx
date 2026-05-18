'use client';

import { use, useEffect, useState } from 'react';
import Image from 'next/image';
import { authClient, signIn, signOut, useSession } from '@/lib/auth-client';
import { createOAuthCallbackURL } from '@/lib/auth-env';

const oauthCallbackURL = createOAuthCallbackURL();

type EmailMode = 'signIn' | 'signUp';

type AuthAction = {
  label: string;
  onClick: () => Promise<void> | void;
  accent: string;
};

function GlowButton({
  label,
  onClick,
  disabled,
  accent,
  type = 'button',
}: {
  label: string;
  onClick?: () => void;
  disabled: boolean;
  accent: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group relative w-full overflow-hidden rounded-xl border border-white/20 bg-black/50 px-4 py-2.5 text-sm font-semibold tracking-wide text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${accent}`}
    >
      <span className='absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition group-hover:opacity-100' />
      {label}
    </button>
  );
}

export default function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = use(searchParams);
  const { data: session, isPending } = useSession();
  const [busy, setBusy] = useState(false);
  const [emailMode, setEmailMode] = useState<EmailMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const lastMethod = authClient.getLastUsedLoginMethod() ?? null;

  useEffect(() => {
    const id = authClient.ensureElectronRedirect();
    return () => clearTimeout(id);
  }, [session]);

  const signInWithGoogle = async () => {
    setBusy(true);
    try {
      await signIn.social({
        provider: 'google',
        callbackURL: oauthCallbackURL,
        fetchOptions: { query },
      });
    } finally {
      setBusy(false);
    }
  };

  const signInWithGitHub = async () => {
    setBusy(true);
    try {
      await signIn.social({
        provider: 'github',
        callbackURL: oauthCallbackURL,
        fetchOptions: { query },
      });
    } finally {
      setBusy(false);
    }
  };

  const signInWithPasskey = async () => {
    setBusy(true);
    try {
      const res = await authClient.signIn.passkey({ fetchOptions: { query } });

      if (res.error) {
        const errorCode = 'code' in res.error ? res.error.code : 'ERROR';
        const errorMessage = res.error.message ?? 'Passkey sign-in failed';
        alert(`${errorCode}: ${errorMessage}`);
        return;
      }
    } finally {
      setBusy(false);
    }
  };

  const addPasskey = async () => {
    setBusy(true);
    try {
      const res = await authClient.passkey.addPasskey({
        name: 'My device passkey',
        authenticatorAttachment: 'platform',
      });

      if (res.error) {
        alert(res.error.message ?? 'Failed to add passkey');
      } else {
        alert('Passkey added successfully');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailError(null);
    setBusy(true);

    try {
      if (emailMode === 'signIn') {
        const res = await signIn.email({ email, password, fetchOptions: { query } });
        if (res.error) {
          setEmailError(res.error.message ?? 'Sign-in failed');
        }
      } else {
        const res = await authClient.signUp.email({
          email,
          password,
          name,
          fetchOptions: { query },
        });
        if (res.error) {
          setEmailError(res.error.message ?? 'Sign-up failed');
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const guestActions: AuthAction[] = [
    {
      label: 'Continue with Google',
      onClick: signInWithGoogle,
      accent: 'hover:border-amber-300/60',
    },
    {
      label: 'Continue with GitHub',
      onClick: signInWithGitHub,
      accent: 'hover:border-cyan-300/60',
    },
    {
      label: 'Sign in with Passkey',
      onClick: signInWithPasskey,
      accent: 'hover:border-emerald-300/60',
    },
  ];

  if (isPending) {
    return (
      <main className='relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16'>
        <div className='auth-beams' />
        <p className='relative z-10 text-base text-white/80'>Loading auth canvas...</p>
      </main>
    );
  }

  return (
    <main className='relative min-h-screen overflow-hidden px-6 py-10 md:px-10'>
      <div className='auth-grid-overlay' />
      <div className='auth-spotlight auth-spotlight-top' />
      <div className='auth-spotlight auth-spotlight-bottom' />
      <div className='auth-beams' />

      <section className='relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 md:gap-14'>
        <header className='space-y-4 text-center md:text-left'>
          <p className='inline-flex rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/70'>
            Aceternity Inspired
          </p>
          <h1 className='font-display text-4xl tracking-tight text-white md:text-6xl'>
            Secure Auth,
            <span className='block bg-gradient-to-r from-amber-200 via-rose-200 to-cyan-200 bg-clip-text text-transparent'>
              Cinematic Interface
            </span>
          </h1>
          <p className='max-w-2xl text-sm text-white/70 md:text-base'>
            Email, OAuth, passkeys, and device authorization in a premium login
            experience designed for both web and Electron.
          </p>
        </header>

        <div className='grid gap-6 md:grid-cols-2'>
          <article className='relative overflow-hidden rounded-3xl border border-white/15 bg-black/45 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-8'>
            <div className='pointer-events-none absolute -left-20 top-10 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl' />
            <div className='pointer-events-none absolute -bottom-20 right-4 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl' />

            {session ? (
              <div className='relative space-y-5'>
                <div className='space-y-1'>
                  <p className='text-xs uppercase tracking-[0.18em] text-white/60'>
                    Active Session
                  </p>
                  <h2 className='font-display text-2xl text-white'>Welcome back</h2>
                  <p className='text-sm text-white/80'>{session.user.email}</p>
                </div>

                {lastMethod && (
                  <div className='inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/85'>
                    <span className='h-2 w-2 rounded-full bg-emerald-300' />
                    Last login via {lastMethod}
                  </div>
                )}

                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt='avatar'
                    width={56}
                    height={56}
                    className='h-14 w-14 rounded-2xl border border-white/20 object-cover'
                  />
                )}

                <div className='space-y-3'>
                  <GlowButton
                    label='Add a new passkey'
                    onClick={addPasskey}
                    disabled={busy}
                    accent='hover:shadow-[0_0_24px_rgba(34,197,94,0.35)]'
                  />

                  <GlowButton
                    label='Authorize this device'
                    onClick={() => {
                      window.location.href = '/device';
                    }}
                    disabled={busy}
                    accent='hover:shadow-[0_0_24px_rgba(56,189,248,0.35)]'
                  />

                  <GlowButton
                    label='Sign out'
                    onClick={() => {
                      void signOut();
                    }}
                    disabled={busy}
                    accent='hover:shadow-[0_0_24px_rgba(244,63,94,0.35)]'
                  />
                </div>
              </div>
            ) : (
              <div className='relative space-y-5'>
                <div>
                  <p className='text-xs uppercase tracking-[0.18em] text-white/60'>
                    Primary Access
                  </p>
                  <h2 className='font-display text-2xl text-white'>Email access</h2>
                </div>

                <div className='grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1 text-sm text-white/70'>
                  <button
                    type='button'
                    onClick={() => {
                      setEmailMode('signIn');
                      setEmailError(null);
                    }}
                    className={`rounded-lg px-3 py-2 transition ${
                      emailMode === 'signIn'
                        ? 'bg-white/15 text-white'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setEmailMode('signUp');
                      setEmailError(null);
                    }}
                    className={`rounded-lg px-3 py-2 transition ${
                      emailMode === 'signUp'
                        ? 'bg-white/15 text-white'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    Sign up
                  </button>
                </div>

                <form onSubmit={handleEmailSubmit} className='space-y-3'>
                  {emailMode === 'signUp' && (
                    <input
                      type='text'
                      placeholder='Display name'
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      className='w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-amber-300/60'
                    />
                  )}
                  <input
                    type='email'
                    placeholder='Email'
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className='w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-amber-300/60'
                  />
                  <input
                    type='password'
                    placeholder='Password'
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    className='w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none transition focus:border-amber-300/60'
                  />

                  {emailError && (
                    <p className='rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200'>
                      {emailError}
                    </p>
                  )}

                  <GlowButton
                    label={emailMode === 'signIn' ? 'Enter' : 'Create account'}
                    type='submit'
                    disabled={busy}
                    accent='hover:shadow-[0_0_24px_rgba(251,191,36,0.35)]'
                  />
                </form>
              </div>
            )}
          </article>

          <article className='relative overflow-hidden rounded-3xl border border-white/15 bg-black/30 p-6 backdrop-blur-xl md:p-8'>
            <div className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent' />
            <div className='space-y-5'>
              <div>
                <p className='text-xs uppercase tracking-[0.18em] text-white/60'>
                  Fast Login Paths
                </p>
                <h2 className='font-display text-2xl text-white'>One-tap providers</h2>
                <p className='mt-1 text-sm text-white/70'>
                  Choose your preferred identity provider, or go passwordless
                  with passkeys.
                </p>
              </div>

              <div className='space-y-3'>
                {guestActions.map((action) => (
                  <GlowButton
                    key={action.label}
                    label={action.label}
                    onClick={() => {
                      void action.onClick();
                    }}
                    disabled={busy || Boolean(session)}
                    accent={action.accent}
                  />
                ))}
              </div>

              <div className='rounded-2xl border border-white/15 bg-white/5 p-4'>
                <p className='text-xs uppercase tracking-[0.16em] text-white/60'>
                  Security Stack
                </p>
                <ul className='mt-3 space-y-2 text-sm text-white/80'>
                  <li>Passkeys with platform authenticators</li>
                  <li>Google + GitHub OAuth callbacks</li>
                  <li>Device authorization for trusted clients</li>
                </ul>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
