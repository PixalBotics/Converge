/**
 * Visitor embed shell — no dashboard AuthProvider (see AppRootProviders).
 * Widget auth = POST /widget/session JWT only; HTTP uses credentials: omit.
 */

import { EmbedBodyReset } from "@/components/embed/EmbedBodyReset";

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EmbedBodyReset>{children}</EmbedBodyReset>;
}
