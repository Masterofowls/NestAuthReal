"use client";

import { useSession, signIn, signOut } from "@/lib/auth-client";

export default function Home() {
  const { data: session, isPending } = useSession();

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
            onClick={() => signOut()}
            className="rounded bg-red-500 px-6 py-2 text-white hover:bg-red-600"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <button
            onClick={() =>
              signIn.social({
                provider: "google",
                callbackURL: "http://localhost:3001/",
              })
            }
            className="rounded bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          >
            Sign in with Google
          </button>
          <button
            onClick={() =>
              signIn.social({
                provider: "github",
                callbackURL: "http://localhost:3001/",
              })
            }
            className="rounded bg-gray-800 px-6 py-2 text-white hover:bg-gray-900"
          >
            Sign in with GitHub
          </button>
        </div>
      )}
    </main>
  );
}
