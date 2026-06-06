"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import MenuBookOutlined from "@mui/icons-material/MenuBookOutlined";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import AutoStories from "@mui/icons-material/AutoStories";
import { alpha, useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import type { AppTheme } from "@/theme/theme";
import { aiTrainingManageHref, aiTrainingTestStudioHref } from "./ai-training-routes";
import type { AiTrainingKbVariant } from "./ai-training-kb.utils";
import { studioColors } from "./ai-training-studio.tokens";

export function AiTrainingStudioHeaderTabs({
  variant,
  websiteId,
  active,
}: {
  variant: AiTrainingKbVariant;
  websiteId: string;
  active: "test" | "training";
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;
  const c = studioColors(theme);
  const router = useRouter();
  const isChatbot = variant === "chatbot";
  const testLabel = isChatbot ? "Chatbot test" : "Assistant test";

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={active}
      onChange={(_, next: "test" | "training" | null) => {
        if (!next || next === active || !websiteId) return;
        if (next === "test") router.push(aiTrainingTestStudioHref(variant, websiteId));
        else router.push(aiTrainingManageHref(variant, websiteId));
      }}
      sx={{
        bgcolor: c.surfaceMuted,
        borderRadius: 2,
        border: `1px solid ${c.border}`,
        flexShrink: 0,
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
      <ToggleButton value="test">
        {isChatbot ? (
          <SmartToyOutlined sx={{ fontSize: 16 }} />
        ) : (
          <AutoStories sx={{ fontSize: 16 }} />
        )}
        {testLabel}
      </ToggleButton>
      <ToggleButton value="training">
        <MenuBookOutlined sx={{ fontSize: 16 }} />
        Training
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
