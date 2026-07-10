"use client";

import { Suspense } from "react";
import { LoadingScreen } from "@/components/common";
import { ParentCompanyResellerSettingsPageClient } from "../../../components/ParentCompanyResellerSettingsPageClient";

export default function ParentCompanyResellerSettingsPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading…" embedded />}>
      <ParentCompanyResellerSettingsPageClient />
    </Suspense>
  );
}

