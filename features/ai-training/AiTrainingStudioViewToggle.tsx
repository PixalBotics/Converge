"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { studioColors } from "./ai-training-studio.tokens";

export function AiTrainingStudioViewToggle({
  value,
  onChange,
}: {
  value: "simple" | "advanced";
  onChange: (value: "simple" | "advanced") => void;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;
  const c = studioColors(theme);

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      onChange={(_, next: "simple" | "advanced" | null) => {
        if (next) onChange(next);
      }}
      sx={{
        bgcolor: c.surfaceMuted,
        borderRadius: 2,
        border: `1px solid ${c.border}`,
        "& .MuiToggleButton-root": {
          border: "none",
          px: 1.5,
          py: 0.65,
          textTransform: "none",
          fontSize: 12,
          fontWeight: 600,
          color: c.textSecondary,
          gap: 0.5,
          "&.Mui-selected": {
            bgcolor: alpha(d.accentBlue, 0.15),
            color: c.text,
            "&:hover": { bgcolor: alpha(d.accentBlue, 0.22) },
          },
        },
      }}
    >
      <ToggleButton value="advanced">
        <AccountTreeOutlined sx={{ fontSize: 16 }} />
        Flow builder
      </ToggleButton>
      <ToggleButton value="simple">
        <TuneOutlined sx={{ fontSize: 16 }} />
        Quick setup
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
