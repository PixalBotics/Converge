import type { ReactNode } from "react";

/** Legacy `/connection/*` — hub layout handles chrome; no extra header. */
export default function LegacyConnectionLayout({ children }: { children: ReactNode }) {
  return children;
}
