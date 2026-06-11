"use client";

import { Suspense } from "react";
import { LoadingScreen } from "@/components/common";
import { ParentCompanyEditPageClient } from "../../components/ParentCompanyEditPageClient";

export default function ParentCompanyEditPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading…" embedded />}>
      <ParentCompanyEditPageClient />
    </Suspense>
  );
}
