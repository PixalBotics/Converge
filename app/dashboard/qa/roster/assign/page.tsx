"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import {
  AssignQaRosterWorkspace,
} from "@/features/chat-qa/components/AssignQaRosterWorkspace";
import type { QaAssignPreset } from "@/features/chat-qa/utils/qa-assign-href";

function AssignQaRosterPageContent() {
  const searchParams = useSearchParams();

  const preset = useMemo((): QaAssignPreset | null => {
    const websiteId = searchParams.get("websiteId")?.trim() ?? "";
    if (!websiteId) return null;
    return {
      websiteId,
      parentCompanyId: searchParams.get("parentCompanyId")?.trim() ?? "",
      childCompanyId: searchParams.get("childCompanyId")?.trim() || undefined,
      resellerId: searchParams.get("resellerId")?.trim() || undefined,
    };
  }, [searchParams]);

  return <AssignQaRosterWorkspace preset={preset} />;
}

export default function AssignQaRosterPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ py: 4 }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Loading…
          </Typography>
        </Box>
      }
    >
      <AssignQaRosterPageContent />
    </Suspense>
  );
}
