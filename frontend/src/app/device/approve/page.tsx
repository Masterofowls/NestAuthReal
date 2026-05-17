'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authClient, useSession } from '@/lib/auth-client';

function DeviceApprovalContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userCode = searchParams.get('user_code') ?? '';
  const [processing, setProcessing] = useState(false);

  if (!session?.user) {
    const verificationPath = `/device?user_code=${encodeURIComponent(userCode)}`;
    router.replace(`/login?redirect=${encodeURIComponent(verificationPath)}`);
    return null;
  }

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await authClient.device.approve({ userCode });
      alert('Device approved successfully!');
      router.push('/');
    } catch {
      alert('Failed to approve device.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeny = async () => {
    setProcessing(true);
    try {
      await authClient.device.deny({ userCode });
      alert('Device denied.');
      router.push('/');
    } catch {
      alert('Failed to deny device.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-8 w-8 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
              />
            </svg>
          </div>
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold">Approve Device Access</h1>
        <p className="mb-4 text-center text-sm text-gray-500">
          A device is requesting access to your account.
        </p>

        <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-6 py-4 text-center">
          <p className="mb-1 text-xs uppercase tracking-wider text-gray-400">Device Code</p>
          <p className="font-mono text-2xl font-bold tracking-widest text-gray-800">
            {userCode}
          </p>
        </div>

        <p className="mb-6 text-center text-sm text-gray-500">
          Signed in as{' '}
          <span className="font-medium text-gray-700">{session.user.email}</span>
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleDeny}
            disabled={processing}
            className="flex-1 rounded border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Deny
          </button>
          <button
            onClick={handleApprove}
            disabled={processing}
            className="flex-1 rounded bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {processing ? 'Approving…' : 'Approve'}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function DeviceApprovePage() {
  return (
    <Suspense>
      <DeviceApprovalContent />
    </Suspense>
  );
}
