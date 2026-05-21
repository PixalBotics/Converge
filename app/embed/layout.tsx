/** Minimal chrome for third-party iframe embed (chat widget runtime). Uses root ThemeRegistry/MUI via parent layout. */

import { EmbedBodyReset } from "@/components/embed/EmbedBodyReset";

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmbedBodyReset>{children}</EmbedBodyReset>;
}
