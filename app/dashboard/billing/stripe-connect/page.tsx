import { Suspense } from "react";
import { StripeConnectPageClient } from "@/features/billing/StripeConnectPageClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <StripeConnectPageClient />
    </Suspense>
  );
}
