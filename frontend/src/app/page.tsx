"use client";

import { use, useState, useEffect } from "react";
import { authClient, useSession, signIn, signOut } from "@/lib/auth-client";
import { createOAuthCallbackURL } from "@/lib/auth-env";

const oauthCallbackURL = createOAuthCallbackURL();

type EmailMode = 'signIn' | 'signUp';

export default function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = use(searchParams);
  const { data: session, isPending } = useSession();
  const [busy, setBusy] = useState(false);
  const [lastMethod, setLastMethod] = useState<string | null>(null);
  const [emailMode, setEmailMode] = useState<EmailMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    const method = authClient.getLastUsedLoginMethod();
    setLastMethod(method ?? null);
    // Allow the Electron client to claim the session after OAuth redirect
    const id = authClient.ensureElectronRedirect();
    return () => clearTimeout(id);
  }, [session]);

  const signInWithGoogle = async () => {
    setBusy(true);
    try {
      await signIn.social({
        provider: "google",
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
        provider: "github",
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
      const res = await authClient.signIn.passkey();

      if (res.error) {
        const errorCode = 'code' in res.error ? res.error.code : 'ERROR';
        const errorMessage = res.error.message ?? 'Passkey sign-in failed';
        alert(`${errorCode}: ${errorMessage}`);
        console.error("Passkey sign-in error:", res.error);
        return;
      }

      console.log("Passkey sign-in success:", res.data);
    } finally {
      setBusy(false);
    }
  };

  const addPasskey = async () => {
    setBusy(true);
    try {
      const res = await authClient.passkey.addPasskey({
        name: "My device passkey",
        authenticatorAttachment: "platform",
      });

      if (res.error) {
        alert(res.error.message ?? "Failed to add passkey");
      } else {
        alert("Passkey added successfully");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setBusy(true);
    try {
      if (emailMode === 'signIn') {
        const res = await signIn.email({ email, password });
        if (res.error) {
          setEmailError(res.error.message ?? 'Sign-in failed');
        }
      } else {
        const res = await authClient.signUp.email({ email, password, name });
        if (res.error) {
          setEmailError(res.error.message ?? 'Sign-up failed');
        }
      }
    } finally {
      setBusy(false);
    }
  };

  if (isPending) return <p className="p-8">Loading...</p>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">NestAuth Frontend</h1>

      {session ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg">
            Signed in as <strong>{session.user.email}</strong>
          </p>

          {lastMethod && (
            <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm text-indigo-700 ring-1 ring-indigo-200">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Last login via&nbsp;<strong className="capitalize">{lastMethod}</strong>
            </div>
          )}

          {session.user.image && (
            <img
              src={session.user.image}
              alt="avatar"
              className="h-16 w-16 rounded-full"
            />
          )}

          <button
            onClick={addPasskey}
            disabled={busy}
            className="rounded bg-emerald-600 px-6 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Add Passkey
          </button>

          <button
            onClick={() => (window.location.href = '/device')}
            disabled={busy}
            className="rounded bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Authorize Device
          </button>

          <button
            onClick={() => signOut()}
            disabled={busy}
            className="rounded bg-red-500 px-6 py-2 text-white hover:bg-red-600 disabled:opacity-50"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="flex w-full max-w-sm flex-col gap-4">
          {/* Email / Password form */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Mode toggle */}
            <div className="mb-5 flex rounded-lg bg-gray-100 p-1 text-sm font-medium">
              <button
                type="button"
                onClick={() => { setEmailMode('signIn'); setEmailError(null); }}
                className={`flex-1 rounded-md py-1.5 transition-colors ${
                  emailMode === 'signIn'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setEmailMode('signUp'); setEmailError(null); }}
                className={`flex-1 rounded-md py-1.5 transition-colors ${
                  emailMode === 'signUp'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign up
              </button>
            </div>

            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
              {emailMode === 'signUp' && (
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {emailMode === 'signIn' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex-1 border-t border-gray-200" />
            or continue with
            <span className="flex-1 border-t border-gray-200" />
          </div>

          {/* Social / Passkey buttons */}
          <button
            onClick={signInWithGoogle}
            disabled={busy}
            className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
          >
            Sign in with Google
          </button>

          <button
            onClick={signInWithGitHub}
            disabled={busy}
            className="rounded-lg bg-gray-800 px-6 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
          >
            Sign in with GitHub
          </button>

          <button
            onClick={signInWithPasskey}
            disabled={busy}
            className="rounded-lg bg-black px-6 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            Sign in with Passkey
          </button>
        </div>
      )}
    </main>
  );
}
