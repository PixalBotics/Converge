"use client";

import AdminOnly from "../AdminOnly";
import SystemAdminOverview from "../SystemAdminOverview";

export default function SystemAdminDashboardPage() {
  return (
    <AdminOnly>
      <SystemAdminOverview />
    </AdminOnly>
  );
}
