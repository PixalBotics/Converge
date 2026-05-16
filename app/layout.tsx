import type { ReactNode } from "react";

export { siteMetadata as metadata } from "@/components/app-root/site-metadata";
import { RootLayoutShell } from "@/components/app-root/RootLayoutShell";

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <RootLayoutShell>{children}</RootLayoutShell>;
}
