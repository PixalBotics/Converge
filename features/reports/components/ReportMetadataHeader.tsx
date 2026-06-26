"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { ReportMetadataBase } from "@/api/reports/reports.types";
import { REPORT_TYPE_LABELS } from "../reports.constants";

export function ReportMetadataHeader({ metadata }: { metadata: ReportMetadataBase }) {
  const theme = useTheme() as AppTheme;
  const hierarchy = metadata.hierarchy;

  const hierarchyParts = [
    hierarchy.reseller?.name,
    hierarchy.parentCompany?.name,
    hierarchy.childCompany?.name,
    hierarchy.website?.name ?? hierarchy.website?.url,
  ].filter(Boolean);

  return (
    <Box
      sx={{
        mb: 2,
        p: 1.5,
        borderRadius: 1.5,
        border: `1px solid ${theme.app.dashboard.shellBorder}`,
        bgcolor: theme.app.dashboard.cardBg,
      }}
    >
      <Typography fontWeight={700}>
        {REPORT_TYPE_LABELS[metadata.reportType] ?? metadata.reportType}
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
        Scope: {metadata.scope.name} ({metadata.scope.type})
        {metadata.period ? ` · Period: ${metadata.period.label}` : ""}
      </Typography>
      {hierarchyParts.length > 0 ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
          Hierarchy: {hierarchyParts.join(" → ")}
        </Typography>
      ) : null}
    </Box>
  );
}
