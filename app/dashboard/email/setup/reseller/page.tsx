"use client";

import { Suspense } from "react";
import { LoadingScreen } from "@/components/common";
import { ResellerOwnMailPage } from "@/features/email";

export default function Page() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading reseller mail…" />}>
      <ResellerOwnMailPage />
    </Suspense>
  );
}
