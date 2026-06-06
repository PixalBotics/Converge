"use client";

import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography } from "@/components/common";
import { WidgetSandboxPanel } from "@/features/chat-widget/components/WidgetSandboxPanel";
import { AiTrainingBehaviorPanel } from "./AiTrainingBehaviorPanel";
import { AiTrainingSandboxChat } from "./AiTrainingSandboxChat";
import type { AiTrainingKbVariant } from "./ai-training-kb.utils";
import { useAiTrainingTestContextQuery } from "@/lib/hooks/query/ai-training/hooks";

export function AiTrainingTestSidebar({
  variant,
  websiteId,
  websiteUrl,
  highlight,
}: {
  variant: AiTrainingKbVariant;
  websiteId: string;
  websiteUrl?: string;
  highlight?: boolean;
}) {
  const theme = useTheme() as AppTheme;
  const cardRef = useRef<HTMLDivElement>(null);
  const isChatbot = variant === "chatbot";
  const testContext = useAiTrainingTestContextQuery(websiteId);
  const widgetKey = testContext.data?.widgetKey ?? null;
  const [chatbotView, setChatbotView] = useState<"sandbox" | "widget">("sandbox");

  useEffect(() => {
    if (!highlight || !cardRef.current) return;
    cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [highlight]);

  useEffect(() => {
    if (!widgetKey) setChatbotView("sandbox");
  }, [widgetKey]);

  return (
    <Box ref={cardRef}>
      <DashboardCard
        sx={{
          p: 2.5,
          position: { lg: "sticky" },
          top: { lg: 16 },
          ...(highlight
            ? { boxShadow: `0 0 0 2px ${theme.palette.primary.main}` }
            : {}),
        }}
      >
        <Typography variant="mediumLarge" color="white" fontWeight={700} sx={{ mb: 0.5 }}>
          Test sandbox
        </Typography>
        <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
          Train content on the left, then test here. Sandbox uses dry-run AI with a visible pipeline —
          no live analytics.
        </Typography>

        <Stack spacing={2.5} divider={<Divider flexItem sx={{ borderColor: theme.app.dashboard.cardBorder }} />}>
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              {isChatbot ? "Chatbot test" : "Copilot test"}
            </Typography>

            {isChatbot && widgetKey ? (
              <ToggleButtonGroup
                exclusive
                size="small"
                value={chatbotView}
                onChange={(_, v: "sandbox" | "widget" | null) => {
                  if (v) setChatbotView(v);
                }}
                sx={{ mb: 1.5 }}
              >
                <ToggleButton value="sandbox" sx={{ textTransform: "none", fontSize: 12 }}>
                  AI sandbox
                </ToggleButton>
                <ToggleButton value="widget" sx={{ textTransform: "none", fontSize: 12 }}>
                  Full widget
                </ToggleButton>
              </ToggleButtonGroup>
            ) : null}

            {isChatbot && chatbotView === "widget" && widgetKey ? (
              <WidgetSandboxPanel widgetKey={widgetKey} websiteUrl={websiteUrl} height={520} />
            ) : (
              <AiTrainingSandboxChat
                variant={variant}
                websiteId={websiteId}
                websiteUrl={websiteUrl}
              />
            )}

            {isChatbot && !widgetKey && !testContext.isLoading ? (
              <Typography variant="caption" sx={{ color: theme.palette.warning.light, display: "block", mt: 1 }}>
                Publish a widget to unlock the full-widget sandbox tab.
              </Typography>
            ) : null}
          </Box>

          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              Fallback messages
            </Typography>
            <AiTrainingBehaviorPanel websiteId={websiteId} />
          </Box>
        </Stack>
      </DashboardCard>
    </Box>
  );
}
