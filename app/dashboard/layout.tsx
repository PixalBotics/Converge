import { Suspense } from "react";
import DashboardLayoutClient from "./DashboardLayoutClient";
import { DashboardRouteFallback } from "./DashboardRouteFallback";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardRouteFallback />}>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </Suspense>
  );
}
