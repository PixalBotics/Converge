"use client";

import { useEffect } from "react";
import { globalErrorBodyStyle, errorHeadingStyle, errorButtonStyle } from "./critical-error-styles";

type RootGlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Next.js `app/global-error.tsx` — must define its own `<html>` / `<body>` when root layout failed.
 */
export function RootGlobalError({ error, reset }: RootGlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={globalErrorBodyStyle}>
        <h1 style={errorHeadingStyle}>Something went wrong</h1>
        <button type="button" onClick={() => reset()} style={errorButtonStyle}>
          Try again
        </button>
      </body>
    </html>
  );
}
