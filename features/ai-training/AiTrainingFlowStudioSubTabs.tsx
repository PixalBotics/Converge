"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import ListAltOutlined from "@mui/icons-material/ListAltOutlined";
import { aiTrainingStudioToggleGroupSx } from "./ai-training-studio.styles";

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
      sx={aiTrainingStudioToggleGroupSx}
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
