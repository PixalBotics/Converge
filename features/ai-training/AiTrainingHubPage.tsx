"use client";

import AutoStories from "@mui/icons-material/AutoStories";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import KeyOutlined from "@mui/icons-material/KeyOutlined";
import SmartToyOutlined from "@mui/icons-material/SmartToyOutlined";
import SupportAgentOutlined from "@mui/icons-material/SupportAgentOutlined";
import ArrowForward from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  AI_ASSISTANT_PRODUCT,
  AI_CHATBOT_PRODUCT,
  AI_CONFIG_PRODUCT,
  AI_COPILOT_PRODUCT,
  AI_HUB_SUBTITLE,
  AI_HUB_TITLE,
  AI_PRODUCT_RELATIONSHIP_NOTE,
} from "@/lib/ai/ai-role-copy";
import { AiTrainingPageShell } from "./AiTrainingPageShell";
import {
  aiTrainingHubCardInnerSx,
  aiTrainingHubGridSx,
  aiTrainingHubIconBoxSx,
  aiTrainingRelationshipBannerSx,
} from "./ai-training-ui.styles";
import {
  aiTrainingCopilotHref,
  aiTrainingListHref,
  aiTrainingPlatformKeysHref,
  aiTrainingSetupHref,
} from "./ai-training-routes";

const PRODUCTS = [
  {
    ...AI_ASSISTANT_PRODUCT,
    icon: AutoStories,
    accentKey: "accentIndigo" as const,
    href: aiTrainingListHref("assistant"),
    cta: "Manage assistant training",
  },
  {
    ...AI_CHATBOT_PRODUCT,
    icon: SmartToyOutlined,
    accentKey: "accentGreen" as const,
    href: aiTrainingListHref("chatbot"),
    cta: "Manage chatbot training",
    setupHref: aiTrainingSetupHref(undefined, "chatbot"),
  },
  {
    ...AI_COPILOT_PRODUCT,
    icon: SupportAgentOutlined,
    accentKey: "accentOrange" as const,
    href: aiTrainingCopilotHref(),
    cta: "Check copilot status",
  },
  {
    ...AI_CONFIG_PRODUCT,
    icon: KeyOutlined,
    accentKey: "accentViolet" as const,
    href: aiTrainingPlatformKeysHref(),
    cta: "Open configuration",
  },
] as const;

export function AiTrainingHubPage() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();

  return (
    <AiTrainingPageShell
      title={AI_HUB_TITLE}
      subtitle={AI_HUB_SUBTITLE}
      icon={<AutoStories sx={{ color: theme.app.dashboard.accentBlue, fontSize: 28 }} />}
      showSubNav
    >
      <DashboardCard sx={aiTrainingRelationshipBannerSx}>
        <InfoOutlined sx={{ color: theme.app.dashboard.accentBlue, fontSize: 20, mt: 0.25, flexShrink: 0 }} />
        <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
          {AI_PRODUCT_RELATIONSHIP_NOTE}
        </Typography>
      </DashboardCard>

      <Box sx={aiTrainingHubGridSx}>
        {PRODUCTS.map((product) => {
          const Icon = product.icon;
          const accent = theme.app.dashboard[product.accentKey];
          return (
            <DashboardCard key={product.title} sx={{ height: "100%" }}>
              <Box sx={aiTrainingHubCardInnerSx}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5 }}>
                  <Box sx={aiTrainingHubIconBoxSx(accent)}>
                    <Icon sx={{ fontSize: 22 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="mediumLarge" fontWeight={700} color="white">
                      {product.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: accent, fontWeight: 600 }}>
                      {product.tagline}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, mb: 1.5, flex: 1 }}>
                  {product.description}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: theme.app.dashboard.textMuted,
                    display: "block",
                    mb: 2,
                    opacity: 0.85,
                  }}
                >
                  {product.audience}
                </Typography>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Button
                    type="button"
                    variant="primary"
                    size="small"
                    endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                    sx={gradientPrimaryButtonSx}
                    onClick={() => router.push(product.href)}
                  >
                    {product.cta}
                  </Button>
                  {"setupHref" in product && product.setupHref ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={() => router.push(product.setupHref!)}
                    >
                      Quick setup
                    </Button>
                  ) : null}
                </Box>
              </Box>
            </DashboardCard>
          );
        })}
      </Box>
    </AiTrainingPageShell>
  );
}
