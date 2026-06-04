"use client";

import { useEffect } from "react";

/**
 * React 19 + Next 15 + nested Suspense + React DevTools (`installHook.js`) can log
 * false-positives while traversing hydrated boundaries — not app hydration bugs.
 * Dev-only — does not hide real app errors.
 */
const REACT_DEVTOOLS_SUSPENSE_NOISE: readonly string[] = [
  "cleaning up async info that was not on the parent Suspense boundary",
  "There should always be an Offscreen Fiber child in a hydrated Suspense boundary",
];

function isReactDevToolsSuspenseNoise(args: unknown[]): boolean {
  const text = args
    .map((a) => {
      if (typeof a === "string") return a;
      if (a instanceof Error) return `${a.message}\n${a.stack ?? ""}`;
      return "";
    })
    .join(" ");
  return REACT_DEVTOOLS_SUSPENSE_NOISE.some((fragment) => text.includes(fragment));
}

export function DevConsoleFilter() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const previousError = console.error;
    console.error = (...args: unknown[]) => {
      if (isReactDevToolsSuspenseNoise(args)) {
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
