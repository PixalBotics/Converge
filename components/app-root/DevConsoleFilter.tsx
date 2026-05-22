"use client";

import { useEffect } from "react";

/**
 * React 19 + Next 15 + React DevTools (`installHook.js`) can log a false-positive:
 * "We are cleaning up async info that was not on the parent Suspense boundary."
 * Dev-only — does not hide real app errors.
 */
const REACT_DEVTOOLS_SUSPENSE_NOISE =
  "cleaning up async info that was not on the parent Suspense boundary";

export function DevConsoleFilter() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const previousError = console.error;
    console.error = (...args: unknown[]) => {
      const text = args
        .map((a) => {
          if (typeof a === "string") return a;
          if (a instanceof Error) return a.message;
          return "";
        })
        .join(" ");
      if (text.includes(REACT_DEVTOOLS_SUSPENSE_NOISE)) {
        return;
      }
      previousError.apply(console, args);
    };

    return () => {
      console.error = previousError;
    };
  }, []);

  return null;
}
