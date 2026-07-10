"use client";

import type { ReactElement } from "react";
import AutoStories from "@mui/icons-material/AutoStories";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import KeyOutlined from "@mui/icons-material/KeyOutlined";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import SupportAgentOutlined from "@mui/icons-material/SupportAgentOutlined";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { usePathname, useRouter } from "next/navigation";
import {
  aiTrainingCopilotHref,
  aiTrainingHubHref,
  aiTrainingListHref,
  aiTrainingPlatformKeysHref,
} from "./ai-training-routes";
import { aiTrainingSubNavSx } from "./ai-training-ui.styles";

type AiTrainingSection = "hub" | "assistant" | "chatbot" | "copilot" | "config";

const TABS: {
  id: AiTrainingSection;
  label: string;
  href: string;
  icon: ReactElement;
}[] = [
  { id: "hub", label: "Overview", href: aiTrainingHubHref(), icon: <DashboardOutlined sx={{ fontSize: 18 }} /> },
  { id: "assistant", label: "Assistant", href: aiTrainingListHref("assistant"), icon: <AutoStories sx={{ fontSize: 18 }} /> },
  { id: "chatbot", label: "Chatbot", href: aiTrainingListHref("chatbot"), icon: <SmartToyOutlined sx={{ fontSize: 18 }} /> },
  { id: "copilot", label: "Copilot", href: aiTrainingCopilotHref(), icon: <SupportAgentOutlined sx={{ fontSize: 18 }} /> },
  { id: "config", label: "Configuration", href: aiTrainingPlatformKeysHref(), icon: <KeyOutlined sx={{ fontSize: 18 }} /> },
];

function sectionFromPath(pathname: string): AiTrainingSection {
  if (pathname === "/dashboard/ai-training" || pathname === "/dashboard/ai-training/") return "hub";
  if (pathname.startsWith("/dashboard/ai-training/platform-keys")) return "config";
  if (pathname.startsWith("/dashboard/ai-training/copilot")) return "copilot";
  if (pathname.startsWith("/dashboard/ai-training/chatbot")) return "chatbot";
  if (pathname.startsWith("/dashboard/ai-training/assistant")) return "assistant";
  if (pathname.startsWith("/dashboard/ai-training/train")) return "chatbot";
  if (pathname.startsWith("/dashboard/ai-training/setup")) return "hub";
  return "hub";
}

export function AiTrainingSubNav() {
  const pathname = usePathname();
  const router = useRouter();
  const active = sectionFromPath(pathname ?? "");

  return (
    <Tabs
      value={active}
      onChange={(_, next: AiTrainingSection) => {
        const tab = TABS.find((t) => t.id === next);
        if (tab) router.push(tab.href);
      }}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={aiTrainingSubNavSx}
    >
      {TABS.map((tab) => (
        <Tab
          key={tab.id}
          value={tab.id}
          label={tab.label}
          icon={tab.icon}
          iconPosition="start"
        />
      ))}
    </Tabs>
  );
}
