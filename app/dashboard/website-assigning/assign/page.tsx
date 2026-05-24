"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import {
  AssignWebsiteWorkspace,
  type AssignWebsitePreset,
} from "@/features/website-assignments/components/AssignWebsiteWorkspace";

function AssignWebsitePageContent() {
  const searchParams = useSearchParams();

  const preset = useMemo((): AssignWebsitePreset | null => {
    const websiteId = searchParams.get("websiteId")?.trim() ?? "";
    if (!websiteId) return null;
    return {
      websiteId,
      parentCompanyId: searchParams.get("parentCompanyId")?.trim() ?? "",
      childCompanyId: searchParams.get("childCompanyId")?.trim() || undefined,
      resellerId: searchParams.get("resellerId")?.trim() || undefined,
    };
  }, [searchParams]);

  return <AssignWebsiteWorkspace preset={preset} />;
}

export default function AssignWebsitePage() {
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
      <AssignWebsitePageContent />
    </Suspense>
  );
}
