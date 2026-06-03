"use client";

import AutoAwesome from "@mui/icons-material/AutoAwesome";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import QuizOutlined from "@mui/icons-material/QuizOutlined";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { suggestedSourceRef } from "./ai-training-kb.utils";

export function AiTrainingChatbotQuickStart({
  websiteName,
  registeredHost,
  registeredWebsiteUrl,
  disabled,
  busy,
  onTrainWebsite,
  onAddFaq,
}: {
  websiteName: string;
  registeredHost: string | null;
  registeredWebsiteUrl: string;
  disabled: boolean;
  busy: boolean;
  onTrainWebsite: () => void;
  onAddFaq: () => void;
}) {
  const theme = useTheme() as AppTheme;
  const siteUrl = registeredWebsiteUrl.trim()
    ? suggestedSourceRef("URL", registeredWebsiteUrl)
    : "";

  return (
    <Box
      sx={{
        p: 2,
        mb: 2.5,
        borderRadius: 2.5,
        border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.45)}`,
        bgcolor: alpha(theme.app.dashboard.overlayLight, 0.22),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <AutoAwesome sx={{ color: theme.app.dashboard.textMuted }} />
        <Typography variant="body1" fontWeight={700} sx={{ color: theme.app.text.primary }}>
          Quick start for {websiteName}
        </Typography>
      </Stack>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 2 }}>
        {registeredHost ? (
          <>
            Paste your site URL on <strong>{registeredHost}</strong>
            {siteUrl ? (
              <>
                {" "}
                (e.g. <span style={{ fontFamily: "monospace" }}>{siteUrl}</span>)
              </>
            ) : null}
            . We find the sitemap and scrape in the background — no sitemap.xml link needed.
          </>
        ) : (
          "Add a website URL in settings before training."
        )}
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
        <Button
          type="button"
          variant="primary"
          sx={{ ...gradientPrimaryButtonSx, flex: 1 }}
          disabled={disabled || busy || !registeredHost}
          onClick={onTrainWebsite}
          startIcon={<LanguageOutlined />}
        >
          {busy ? "Starting training…" : "Train from website URL"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          sx={{ flex: 1 }}
          disabled={disabled || busy}
          onClick={onAddFaq}
          startIcon={<QuizOutlined />}
        >
          Add visitor FAQs
        </Button>
      </Stack>
    </Box>
  );
}
