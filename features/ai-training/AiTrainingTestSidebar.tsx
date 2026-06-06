"use client";

import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography } from "@/components/common";
import { AiTrainingBehaviorPanel } from "./AiTrainingBehaviorPanel";
import { AiTrainingAssistantTestChat } from "./AiTrainingAssistantTestChat";
import { AiTrainingWidgetTestFrame } from "./AiTrainingWidgetTestFrame";
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

  useEffect(() => {
    if (!highlight || !cardRef.current) return;
    cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [highlight]);

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
        Test &amp; fallbacks
      </Typography>
      <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 2 }}>
        Train content on the left, then test here. Set fallback messages when AI is unsure.
      </Typography>

      <Stack spacing={2.5} divider={<Divider flexItem sx={{ borderColor: theme.app.dashboard.cardBorder }} />}>
        <Box>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            {isChatbot ? "Widget test" : "Copilot test"}
          </Typography>
          {isChatbot ? (
            widgetKey ? (
              <AiTrainingWidgetTestFrame widgetKey={widgetKey} websiteUrl={websiteUrl} />
            ) : testContext.isLoading ? (
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                Loading widget…
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: theme.palette.warning.light }}>
                No published widget key for this website. Install/publish a widget to test the full
                visitor form and chat.
              </Typography>
            )
          ) : null}
          {!isChatbot || !widgetKey ? (
            <Box sx={{ mt: isChatbot && !widgetKey ? 2 : 0 }}>
              <AiTrainingAssistantTestChat
                variant={variant}
                websiteId={websiteId}
                websiteUrl={websiteUrl}
              />
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
                Quick dry-run (no widget UI)
              </Typography>
              <AiTrainingAssistantTestChat
                variant={variant}
                websiteId={websiteId}
                websiteUrl={websiteUrl}
              />
            </Box>
          )}
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
