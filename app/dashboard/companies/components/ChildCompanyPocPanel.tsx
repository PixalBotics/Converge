"use client";

import { useMemo } from "react";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { ParentCompanyChildDetail } from "@/api/types/companies.types";
import { Typography } from "@/components/common";
import { CompanyPocSummaryBlock } from "./CompanyPocSummaryBlock";
import { normalizePocsFromCarrier } from "@/lib/companies/parent-detail-pocs";

export type ChildCompanyPocPanelProps = {
  child: ParentCompanyChildDetail;
  parentCompanyId: string;
  pocs: PocEditRow[];
  onPocsChange: (next: PocEditRow[]) => void;
  disabled?: boolean;
};

export type PocEditRow = {
  companyContactId?: string;
  userId?: string;
  pocInvite?: Record<string, unknown>;
  userProfile?: Record<string, unknown>;
};

export function ChildCompanyPocPanel({ child }: ChildCompanyPocPanelProps) {
  const theme = useTheme() as AppTheme;

  const rows = useMemo(() => normalizePocsFromCarrier(child), [child]);

  const sectionLabelSx = {
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: theme.app.dashboard.textMuted,
    mb: 1,
  };

  return (
    <Box
      sx={{
        mt: 2,
        pt: 2.25,
        borderTop: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.85)}`,
      }}
    >
      <Typography sx={sectionLabelSx}>Points of contact (POC)</Typography>
      <CompanyPocSummaryBlock title="Current contacts" rows={rows} />
    </Box>
  );
}
