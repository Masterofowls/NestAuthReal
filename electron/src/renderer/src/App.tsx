import { useState, useEffect, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types (mirrored from Better Auth user shape)
// ---------------------------------------------------------------------------
interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  createdAt?: Date;
}

// ---------------------------------------------------------------------------
// Inline styles — no external CSS dependency required for testing
// ---------------------------------------------------------------------------
const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#0f172a',
    color: '#e2e8f0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#f8fafc',
  },
  badge: {
    fontSize: 11,
    padding: '2px 8px',
    borderRadius: 999,
    background: '#1e40af',
    color: '#93c5fd',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  body: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  panel: {
    flex: 1,
    padding: 32,
    overflowY: 'auto' as const,
  },
  card: {
    background: '#1e293b',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    border: '1px solid #334155',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: 16,
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '#334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    fontWeight: 700,
    color: '#94a3b8',
    flexShrink: 0,
    overflow: 'hidden',
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: { fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 2 },
  userEmail: { fontSize: 13, color: '#64748b' },
  userId: { fontSize: 11, color: '#475569', marginTop: 4, fontFamily: 'monospace' },
  row: { display: 'flex', gap: 8, flexWrap: 'wrap' as const },
  btn: {
    padding: '9px 18px',
    borderRadius: 8,
    border: 'none',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  btnPrimary: {
    background: '#2563eb',
    color: '#fff',
  },
  btnSecondary: {
    background: '#334155',
    color: '#e2e8f0',
  },
  btnDanger: {
    background: '#7f1d1d',
    color: '#fca5a5',
  },
  btnGoogle: {
    background: '#fff',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  btnGithub: {
    background: '#24292f',
    color: '#f0f6fc',
  },
  label: { fontSize: 13, color: '#94a3b8', marginBottom: 6, display: 'block' },
  input: {
    width: '100%',
    padding: '9px 12px',
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    color: '#e2e8f0',
    fontSize: 13,
    marginBottom: 12,
    outline: 'none',
  },
  divider: { borderTop: '1px solid #1e293b', margin: '20px 0' },
  logs: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#94a3b8',
    background: '#0f172a',
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
    overflowY: 'auto' as const,
    border: '1px solid #1e293b',
  },
  logEntry: { marginBottom: 4 },
  logSuccess: { color: '#4ade80' },
  logError: { color: '#f87171' },
  logInfo: { color: '#60a5fa' },
  status: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    padding: '4px 10px',
    borderRadius: 999,
  },
  statusOnline: { background: '#052e16', color: '#4ade80' },
  statusOffline: { background: '#1c1917', color: '#78716c' },
};

// ---------------------------------------------------------------------------
// Log entry
// ---------------------------------------------------------------------------
interface LogEntry {
  ts: string;
  type: 'success' | 'error' | 'info';
  msg: string;
}

function now(): string {
  return new Date().toLocaleTimeString();
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [requestedAuth, setRequestedAuth] = useState(false);

  // Inject spinner keyframes once
  useEffect(() => {
    const id = 'nestauth-spin';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(s);
    }
  }, []);

  const addLog = useCallback(
    (type: LogEntry['type'], msg: string) => {
      setLogs((prev) => [...prev.slice(-99), { ts: now(), type, msg }]);
    },
    [],
  );

  // ── IPC bridge listeners ────────────────────────────────────────────────
  useEffect(() => {
    const unsubAuth = window.onAuthenticated((u) => {
      setUser(u as User);
      setRequestedAuth(false);
      addLog('success', `Authenticated: ${(u as User).email}`);
    });

    const unsubError = window.onAuthError((ctx) => {
      addLog('error', `Auth error: ${(ctx as { message?: string }).message ?? 'unknown'}`);
    });

    const unsubUpdate = window.onUserUpdated((u) => {
      setUser(u as User);
      addLog('info', `User updated: ${(u as User).email}`);
    });

    return () => {
      unsubAuth();
      unsubError();
      unsubUpdate();
    };
  }, [addLog]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleRequestAuth = (provider?: string) => {
    setRequestedAuth(true);
    // Always open the frontend PKCE sign-in URL (no provider arg) so all
    // auth methods — email, Google, GitHub, passkey — flow through the same
    // page and complete via ensureElectronRedirect().
    // Passing provider would route through init-oauth-proxy (backend-direct),
    // bypassing the frontend and breaking the PKCE exchange.
    const label = provider ? `${provider} ` : '';
    window.requestAuth();
    addLog('info', `Opening browser for ${label}sign-in…`);
  };

  const handleSignOut = async () => {
    await window.signOut();
    setUser(null);
    addLog('info', 'Signed out');
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>NestAuth</div>
        <div style={styles.badge}>Electron Testing Client</div>
        <div style={{ marginLeft: 'auto' }}>
          <span
            style={{
              ...styles.status,
              ...(user ? styles.statusOnline : styles.statusOffline),
            }}
          >
            <span>{user ? '●' : '○'}</span>
            {user ? 'Signed in' : 'Signed out'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={styles.body}>
        <div style={styles.panel}>

          {/* Session card */}
          {user ? (
            <div style={styles.card}>
              <div style={styles.cardTitle}>Active Session</div>
              <div style={styles.userRow}>
                <div style={styles.avatar}>
                  {user.image ? (
                    <img
                      src={user.image}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    (user.name?.[0] ?? user.email[0]).toUpperCase()
                  )}
                </div>
                <div style={styles.userInfo}>
                  <div style={styles.userName}>{user.name}</div>
                  <div style={styles.userEmail}>{user.email}</div>
                  <div style={styles.userId}>ID: {user.id}</div>
                </div>
              </div>
              <div style={styles.row}>
                <button
                  style={{ ...styles.btn, ...styles.btnDanger }}
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : null}

          {/* Sign-in card */}
          {!user && (
            <div style={styles.card}>
              <div style={styles.cardTitle}>Sign In</div>
              <div style={styles.row}>
                <button
                  style={{ ...styles.btn, ...styles.btnPrimary }}
                  onClick={() => handleRequestAuth()}
                >
                  Sign in with Browser
                </button>
                <button
                  style={{ ...styles.btn, ...styles.btnGoogle }}
                  onClick={() => handleRequestAuth('google')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  style={{ ...styles.btn, ...styles.btnGithub }}
                  onClick={() => handleRequestAuth('github')}
                >
                  GitHub
                </button>
              </div>
            </div>
          )}

          {/* Browser sign-in in progress */}
          {requestedAuth && !user && (
            <div
              style={{
                ...styles.card,
                border: '1px solid #1e40af',
                background: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '3px solid #1e40af',
                  borderTopColor: '#60a5fa',
                  animation: 'spin 0.9s linear infinite',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#93c5fd', marginBottom: 4 }}>
                  Waiting for browser sign-in…
                </div>
                <div style={{ fontSize: 12, color: '#475569' }}>
                  Complete sign-in in your browser — you'll be redirected back automatically.
                </div>
              </div>
              <button
                style={{ ...styles.btn, ...styles.btnSecondary, fontSize: 12, padding: '6px 12px' }}
                onClick={() => setRequestedAuth(false)}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Activity log */}
          <div style={styles.card}>
            <div style={{ ...styles.cardTitle, marginBottom: 12 }}>
              Activity Log
            </div>
            <div style={styles.logs}>
              {logs.length === 0 && (
                <span style={{ color: '#475569' }}>No events yet.</span>
              )}
              {[...logs].reverse().map((entry, i) => (
                <div key={i} style={styles.logEntry}>
                  <span style={{ color: '#475569' }}>[{entry.ts}] </span>
                  <span style={styles[`log${entry.type.charAt(0).toUpperCase()}${entry.type.slice(1)}`]}>
                    {entry.msg}
                  </span>
                </div>
              ))}
            </div>
            {logs.length > 0 && (
              <button
                style={{
                  ...styles.btn,
                  ...styles.btnSecondary,
                  marginTop: 8,
                  fontSize: 12,
                  padding: '6px 12px',
                }}
                onClick={() => setLogs([])}
              >
                Clear log
              </button>
            )}
          </div>

          {/* Debug info */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>Debug Info</div>
            <pre
              style={{
                fontSize: 11,
                color: '#475569',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {JSON.stringify(
                {
                  backendUrl: 'http://localhost:3000',
                  signInUrl: 'http://localhost:3001',
                  protocol: 'com.example.nestauth',
                  authenticated: !!user,
                  userId: user?.id ?? null,
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
