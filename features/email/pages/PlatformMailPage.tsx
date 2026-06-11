"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import { useAuth } from "@/lib/auth";
import { useSmtpEmailAccess } from "../hooks/useSmtpEmailAccess";
import { PlatformMailConfigSummaryTable } from "../components/PlatformMailConfigSummaryTable";
import { PlatformMailAssignmentsTable } from "../components/PlatformMailAssignmentsTable";
import { PlatformMailConfigModal } from "../components/PlatformMailConfigModal";
import { usePlatformEmailSettingsQuery } from "../hooks/useEmailSettings";

export function PlatformMailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { canView, canUpdate } = useSmtpEmailAccess();

  const [modalOpen, setModalOpen] = useState(false);
  const settingsQuery = usePlatformEmailSettingsQuery({ enabled: canView });

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    if (user && user.userType !== "Internal") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!canView) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <PlatformMailConfigSummaryTable
        enabled={canView}
        canConfigure={canUpdate}
        onConfigure={canUpdate ? openModal : undefined}
      />

      <PlatformMailAssignmentsTable />

      <PlatformMailConfigModal
        open={modalOpen}
        onClose={closeModal}
        onSaved={() => {
          void settingsQuery.refetch();
        }}
      />
    </Box>
  );
}
