"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import { aiTrainingStudioToggleGroupSx } from "./ai-training-studio.styles";

export function AiTrainingStudioViewToggle({
  value,
  onChange,
}: {
  value: "simple" | "advanced";
  onChange: (value: "simple" | "advanced") => void;
}) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      onChange={(_, next: "simple" | "advanced" | null) => {
        if (next) onChange(next);
      }}
      sx={aiTrainingStudioToggleGroupSx}
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
