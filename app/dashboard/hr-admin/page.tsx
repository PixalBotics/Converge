"use client";

import AdminOnly from "../AdminOnly";
import HrAdminOverview from "../HrAdminOverview";

export default function HrAdminDashboardPage() {
  return (
    <AdminOnly>
      <HrAdminOverview />
    </AdminOnly>
  );
}
