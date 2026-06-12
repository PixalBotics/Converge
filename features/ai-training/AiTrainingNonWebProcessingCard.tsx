"use client";

import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { KnowledgeSourceListItem } from "@/api/ai-knowledge/types";
import { Typography } from "@/components/common";
import { formatSourceRefForDisplay, sourceTypeHumanLabel } from "./ai-training-kb.utils";
import { aiTrainingScrapeStatusCardSx } from "./ai-training-ui.styles";

export function AiTrainingNonWebProcessingCard({
  source,
}: {
  source: KnowledgeSourceListItem;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;

  return (
    <Box sx={aiTrainingScrapeStatusCardSx}>
      <Box sx={{ px: { xs: 1.25, sm: 2 }, py: 1.25 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.info.light }}>
          {source.status === "pending" ? "Queued for indexing" : "Indexing in progress"}
        </Typography>
        <Typography variant="caption" sx={{ display: "block", mt: 0.35, color: d.textMuted }}>
          {formatSourceRefForDisplay(source)} · {sourceTypeHumanLabel(source.sourceType)}
        </Typography>
        <LinearProgress sx={{ mt: 1, borderRadius: 999, height: 4 }} />
      </Box>
    </Box>
  );
}
