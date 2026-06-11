"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { KnowledgeScrapeProgress } from "@/api/ai-knowledge/types";
import { Typography } from "@/components/common";
import {
  computeScrapeTiming,
  formatDurationSeconds,
  formatScrapePhaseLabel,
} from "./ai-training-kb.utils";

/** Compact live scrape summary — elapsed timer, ETA, current page. */
export function AiTrainingScrapeLiveSummary({
  progress,
}: {
  progress: KnowledgeScrapeProgress;
}) {
  const theme = useTheme() as AppTheme;
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const timing = useMemo(() => computeScrapeTiming(progress, nowMs), [progress, nowMs]);
  const currentTitle =
    progress.currentPage?.title?.trim() ||
    progress.currentPage?.url ||
    progress.activePages?.[0]?.title ||
    null;

  return (
    <Box sx={{ minWidth: 0, maxWidth: 260 }}>
      <Typography variant="caption" sx={{ color: theme.palette.info.light, display: "block" }}>
        {formatDurationSeconds(timing.elapsedSec)}
        {timing.etaSec != null ? ` · ~${formatDurationSeconds(timing.etaSec)} left` : ""}
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
        {formatScrapePhaseLabel(progress)}
      </Typography>
      {currentTitle ? (
        <Typography
          variant="caption"
          sx={{
            color: theme.app.dashboard.accentBlue,
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {currentTitle}
        </Typography>
      ) : null}
    </Box>
  );
}
