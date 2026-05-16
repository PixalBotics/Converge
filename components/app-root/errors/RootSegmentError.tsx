"use client";

import { useEffect } from "react";
import {
  segmentErrorContainerStyle,
  errorHeadingStyle,
  errorMessageStyle,
  errorButtonStyle,
} from "./critical-error-styles";

type RootSegmentErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Next.js `app/error.tsx` — root segment error UI (root layout shell still applies). */
export function RootSegmentError({ error, reset }: RootSegmentErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={segmentErrorContainerStyle}>
      <h1 style={errorHeadingStyle}>Something went wrong</h1>
      <p style={errorMessageStyle}>
        Please try again. If the problem continues, contact support.
      </p>
      <button type="button" onClick={() => reset()} style={errorButtonStyle}>
        Try again
      </button>
    </div>
  );
}
