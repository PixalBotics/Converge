"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import ListAltOutlined from "@mui/icons-material/ListAltOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { studioColors } from "./ai-training-studio.tokens";

export type FlowStudioSubTab = "diagram" | "execution";

export function AiTrainingFlowStudioSubTabs({
  value,
  onChange,
  executionCount = 0,
  errorCount = 0,
}: {
  value: FlowStudioSubTab;
  onChange: (value: FlowStudioSubTab) => void;
  executionCount?: number;
  errorCount?: number;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;
  const c = studioColors(theme);
  const badge =
    executionCount > 0 || errorCount > 0
      ? `${executionCount}${errorCount > 0 ? ` · ${errorCount} err` : ""}`
      : null;

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      onChange={(_, next: FlowStudioSubTab | null) => {
        if (next) onChange(next);
      }}
      sx={{
        bgcolor: c.surfaceMuted,
        borderRadius: 2,
        border: `1px solid ${c.border}`,
        "& .MuiToggleButton-root": {
          border: "none",
          px: 1.35,
          py: 0.55,
          textTransform: "none",
          fontSize: 12,
          fontWeight: 600,
          color: c.textSecondary,
          gap: 0.45,
          "&.Mui-selected": {
            bgcolor: alpha(d.accentBlue, 0.15),
            color: c.text,
            "&:hover": { bgcolor: alpha(d.accentBlue, 0.22) },
          },
        },
      }}
    >
      <ToggleButton value="diagram">
        <AccountTreeOutlined sx={{ fontSize: 15 }} />
        Flow diagram
      </ToggleButton>
      <ToggleButton value="execution">
        <ListAltOutlined sx={{ fontSize: 15 }} />
        Execution log{badge ? ` (${badge})` : ""}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
