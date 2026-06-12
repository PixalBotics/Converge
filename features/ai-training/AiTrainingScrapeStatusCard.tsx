"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { KnowledgeSourceListItem } from "@/api/ai-knowledge/types";
import { Typography } from "@/components/common";
import { AiTrainingScrapeLiveBar } from "./AiTrainingScrapeLiveBar";
import {
  formatScrapePhaseLabel,
  formatScrapePageDisplay,
  formatSourceRefForDisplay,
  sourceTypeHumanLabel,
} from "./ai-training-kb.utils";
import { aiTrainingScrapeStatusCardSx } from "./ai-training-ui.styles";

function ScrapeStartingPanel({
  source,
}: {
  source: Pick<KnowledgeSourceListItem, "sourceRef" | "title" | "sourceType" | "status">;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;
  const siteLabel = formatSourceRefForDisplay(source);
  const isPending = source.status === "pending";

  return (
    <Box sx={{ px: { xs: 1.25, sm: 2 }, py: 1.25 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.info.light }}>
        {isPending ? "Queued for training" : "Starting website scrape"}
      </Typography>
      <Typography variant="caption" sx={{ display: "block", mt: 0.35, color: d.textMuted }}>
        {isPending
          ? "Waiting to start — your site will be read page by page in a moment."
          : "Finding sitemap and page list, then scraping each page."}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 0.5,
          color: d.white95,
          fontWeight: 600,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        Site: {siteLabel}
      </Typography>
      <Typography variant="caption" sx={{ display: "block", mt: 0.25, color: d.textMuted }}>
        Type: {sourceTypeHumanLabel(source.sourceType)}
        {source.sourceRef?.trim() && source.sourceRef !== siteLabel
          ? ` · ${formatScrapePageDisplay(source.sourceRef) ?? source.sourceRef}`
          : ""}
      </Typography>
    </Box>
  );
}

export function AiTrainingScrapeStatusCard({
  source,
}: {
  source: KnowledgeSourceListItem;
}) {
  const theme = useTheme() as AppTheme;
  const progress = source.scrapeProgress;

  return (
    <Box sx={aiTrainingScrapeStatusCardSx}>
      <Box sx={{ px: { xs: 1.25, sm: 2 }, pt: 0.75, pb: progress ? 0 : undefined }}>
        <Typography
          variant="caption"
          sx={{
            color: theme.app.dashboard.textMuted,
            fontWeight: 600,
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {formatSourceRefForDisplay(source)}
        </Typography>
      </Box>
      {progress ? (
        <AiTrainingScrapeLiveBar
          progress={progress}
          trainingTier={source.trainingTier ?? progress.trainingTier}
          showPageList
        />
      ) : (
        <ScrapeStartingPanel source={source} />
      )}
    </Box>
  );
}
