export interface LoadingScreenProps {
  /** Optional message shown below the spinner (e.g. "Loading...", "Redirecting to login...") */
  message?: string;
  /** Spinner size in pixels. Default 40. */
  size?: number;
  /** Use full-page dark gradient layout. Default true. */
  fullPage?: boolean;
  /**
   * Transparent surface for in-shell loading (e.g. Next.js `app/dashboard/loading.tsx`).
   * Avoids the auth-style blue gradient flash when only the page segment is suspending.
   */
  embedded?: boolean;
}
