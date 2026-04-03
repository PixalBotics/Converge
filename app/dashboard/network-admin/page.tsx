"use client";

import AdminOnly from "../AdminOnly";
import NetworkAdminOverview from "../NetworkAdminOverview";

export default function NetworkAdminDashboardPage() {
  return (
    <AdminOnly>
      <NetworkAdminOverview />
    </AdminOnly>
  );
}
