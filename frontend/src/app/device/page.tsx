'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient, useSession } from '@/lib/auth-client';

function DeviceAuthorizationForm() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [userCode, setUserCode] = useState(
    searchParams.get('user_code') ?? '',
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formattedCode = userCode.trim().replace(/-/g, '').toUpperCase();
    const approvalPath = `/device/approve?user_code=${encodeURIComponent(formattedCode)}`;

    try {
      if (!session?.user) {
        const verificationPath = `/device?user_code=${encodeURIComponent(formattedCode)}`;
        window.location.href = `/login?redirect=${encodeURIComponent(verificationPath)}`;
        return;
      }

      const response = await authClient.device({
        query: { user_code: formattedCode },
      });

      if (response.data) {
        window.location.href = approvalPath;
      } else {
        setError('Invalid or expired code. Please try again.');
      }
    } catch {
      setError('Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
            <svg
              className="h-8 w-8 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3"
              />
            </svg>
          </div>
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold">Device Authorization</h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Enter the code shown on your TV, CLI, or other device to grant it
          access to your account.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value.toUpperCase())}
            placeholder="ABCD-1234"
            maxLength={12}
            required
            className="w-full rounded border border-gray-300 px-4 py-3 text-center font-mono text-xl tracking-widest focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />

          {error && (
            <p className="rounded bg-red-50 px-3 py-2 text-center text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || userCode.trim().length < 4}
            className="rounded bg-indigo-600 px-6 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Continue'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          The code was displayed when you ran the device or CLI command
          requesting access.
        </p>
      </div>
    </main>
  );
}

export default function DevicePage() {
  return (
    <Suspense>
      <DeviceAuthorizationForm />
    </Suspense>
  );
}
