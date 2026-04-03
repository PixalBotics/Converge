"use client";

import AdminOnly from "../AdminOnly";
import ManagerOverview from "../ManagerOverview";

export default function ManagerDashboardPage() {
  return (
    <AdminOnly>
      <ManagerOverview />
    </AdminOnly>
  );
}
