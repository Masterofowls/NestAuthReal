"use client";

import { useState } from "react";
import { authClient, useSession, signIn, signOut } from "@/lib/auth-client";
import { createOAuthCallbackURL } from "@/lib/auth-env";

const oauthCallbackURL = createOAuthCallbackURL();

export default function Home() {
  const { data: session, isPending } = useSession();
  const [busy, setBusy] = useState(false);

  const signInWithGoogle = async () => {
    setBusy(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: oauthCallbackURL,
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

  if (isPending) return <p className="p-8">Loading...</p>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">NestAuth Frontend</h1>

      {session ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg">
            Signed in as <strong>{session.user.email}</strong>
          </p>

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
            onClick={() => signOut()}
            disabled={busy}
            className="rounded bg-red-500 px-6 py-2 text-white hover:bg-red-600 disabled:opacity-50"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            onClick={signInWithGoogle}
            disabled={busy}
            className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            Sign in with Google
          </button>

          <button
            onClick={signInWithGitHub}
            disabled={busy}
            className="rounded bg-gray-800 px-6 py-2 text-white hover:bg-gray-900 disabled:opacity-50"
          >
            Sign in with GitHub
          </button>

          <button
            onClick={signInWithPasskey}
            disabled={busy}
            className="rounded bg-black px-6 py-2 text-white hover:bg-neutral-800 disabled:opacity-50"
          >
            Sign in with Passkey
          </button>
        </div>
      )}
    </main>
  );
}
