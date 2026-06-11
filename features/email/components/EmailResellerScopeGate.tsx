"use client";

import type { ReactNode } from "react";
import Skeleton from "@mui/material/Skeleton";
import { DashboardCard } from "@/components/common";
import { emailCard } from "../styles/email-page.styles";
import { useEmailResellerScope } from "../context/EmailResellerScopeContext";
import { ResellerSelectPanel } from "./ResellerSelectPanel";

export function EmailResellerScopeGate({ children }: { children: ReactNode }) {
  const { ready, isResolving, needsResellerPick } = useEmailResellerScope();

  if (isResolving) {
    return (
      <DashboardCard sx={emailCard}>
        <Skeleton variant="rounded" height={120} />
      </DashboardCard>
    );
  }

  if (needsResellerPick) {
    return <ResellerSelectPanel />;
  }

  return <>{children}</>;
}
