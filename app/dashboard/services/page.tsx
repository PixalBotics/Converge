"use client";

import { Suspense } from "react";
import { LoadingScreen } from "@/components/common";
import { ServicesPageClient } from "./ServicesPageClient";

export default function ServicesPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading…" embedded />}>
      <ServicesPageClient />
    </Suspense>
  );
}
