export interface LoadingScreenProps {
  /** Optional message shown below the spinner (e.g. "Loading...", "Redirecting to login...") */
  message?: string;
  /** Spinner size in pixels. Default 40. */
  size?: number;
  /** Use full-page dark gradient layout. Default true. */
  fullPage?: boolean;
}
