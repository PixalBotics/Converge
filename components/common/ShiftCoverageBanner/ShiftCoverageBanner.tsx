"use client";

import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { ShiftCoverage } from "@/api/types/shift-coverage.types";

export type ShiftCoverageBannerProps = {
  coverage: ShiftCoverage | null;
  onDismiss?: () => void;
};

export function ShiftCoverageBanner({ coverage, onDismiss }: ShiftCoverageBannerProps) {
  const theme = useTheme() as AppTheme;

  if (!coverage || coverage.status === "ok") {
    return null;
  }

  if (coverage.status === "not_applicable") {
    return (
      <Alert severity="info" onClose={onDismiss} sx={{ borderRadius: 2 }}>
        <Typography variant="body2" fontWeight={600}>
          HRMS shift check not applicable
        </Typography>
        <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
          Assignment succeeded. External agents or sites without an internal shift rule skip the 7-day
          coverage check. Chat routing is unchanged.
        </Typography>
      </Alert>
    );
  }

  return (
    <Alert severity="warning" onClose={onDismiss} sx={{ borderRadius: 2 }}>
      <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
        Assignment saved — shift coverage gap (next 7 days)
      </Typography>
      <Typography variant="caption" sx={{ display: "block", color: "inherit", mb: 1 }}>
        Internal agents should have HRMS shifts for handoff visibility. This does not block the
        roster assign or chat queue.
      </Typography>
      {coverage.warnings.length > 0 ? (
        <Box component="ul" sx={{ m: 0, pl: 2.25, fontSize: 13 }}>
          {coverage.warnings.map((w) => (
            <li key={w}>
              <Typography variant="caption" component="span">
                {w}
              </Typography>
            </li>
          ))}
        </Box>
      ) : null}
      {coverage.missingDates.length > 0 ? (
        <Typography variant="caption" sx={{ display: "block", mt: 1, fontFamily: "monospace" }}>
          Missing: {coverage.missingDates.join(", ")}
        </Typography>
      ) : null}
      {coverage.requestId ? (
        <Typography
          variant="caption"
          sx={{ display: "block", mt: 0.75, color: theme.app.dashboard.textMuted }}
        >
          Ref: {coverage.requestId}
        </Typography>
      ) : null}
    </Alert>
  );
}

export function ShiftCoverageOkHint() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, py: 0.5 }}>
      <CheckCircleOutline sx={{ fontSize: 18, color: "success.main" }} />
      <Typography variant="caption" sx={{ color: "success.main" }}>
        Shift coverage OK for the next 7 days
      </Typography>
    </Box>
  );
}
