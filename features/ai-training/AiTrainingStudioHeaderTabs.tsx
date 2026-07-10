"use client";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import MenuBookOutlined from "@mui/icons-material/MenuBookOutlined";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import AutoStories from "@mui/icons-material/AutoStories";
import { useRouter } from "next/navigation";
import { aiTrainingManageHref, aiTrainingTestStudioHref } from "./ai-training-routes";
import type { AiTrainingKbVariant } from "./ai-training-kb.utils";
import { aiTrainingStudioToggleGroupSx } from "./ai-training-studio.styles";

export function AiTrainingStudioHeaderTabs({
  variant,
  websiteId,
  active,
}: {
  variant: AiTrainingKbVariant;
  websiteId: string;
  active: "test" | "training";
}) {
  const router = useRouter();
  const isChatbot = variant === "chatbot";
  const testLabel = "Test";
  const trainingLabel = "Content";

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
      sx={aiTrainingStudioToggleGroupSx}
    >
      <ToggleButton value="training">
        <MenuBookOutlined sx={{ fontSize: 16 }} />
        {trainingLabel}
      </ToggleButton>
      <ToggleButton value="test">
        {isChatbot ? (
          <SmartToyOutlined sx={{ fontSize: 16 }} />
        ) : (
          <AutoStories sx={{ fontSize: 16 }} />
        )}
        {testLabel}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
