declare global {
  interface Window {
    /** Fired by the auth system when sign-in completes via the custom protocol. */
    onAuthenticated(
      callback: (user: unknown) => void,
    ): () => void;

    /** Fired when an auth error occurs (e.g. denied, expired). */
    onAuthError(
      callback: (ctx: unknown) => void,
    ): () => void;

    /** Fired when the stored session user record is updated. */
    onUserUpdated(
      callback: (user: unknown) => void,
    ): () => void;

    /** Sign the current user out and clear stored tokens. */
    signOut(): Promise<void>;

    /** Authenticate using an explicit token (e.g. manual fallback). */
    authenticate(opts: { token: string }): Promise<void>;

    /**
     * Custom bridge: opens the sign-in URL in the user's default browser.
     * Optionally pass a provider name (e.g. 'google', 'github') to
     * pre-select the OAuth provider on the sign-in page.
     */
    requestAuth(opts?: { provider?: string }): Promise<void>;
  }
}

export {};
