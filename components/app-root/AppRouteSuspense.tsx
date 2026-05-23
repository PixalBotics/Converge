"use client";

import { Suspense, type ReactNode } from "react";

/** Client-side Suspense shell — aligns with Next App Router async boundaries. */
export function AppRouteSuspense({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
