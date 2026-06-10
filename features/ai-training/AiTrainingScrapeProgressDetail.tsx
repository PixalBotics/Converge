"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { KnowledgeScrapeProgress } from "@/api/ai-knowledge/types";
import { Typography } from "@/components/common";
import {
  computeScrapeTiming,
  formatDurationSeconds,
  formatScrapePhaseLabel,
  formatScrapeProgressLabel,
} from "./ai-training-kb.utils";

export function AiTrainingScrapeProgressDetail({
  progress,
  compact = false,
  sourceRef,
}: {
  progress: KnowledgeScrapeProgress;
  compact?: boolean;
  sourceRef?: string;
}) {
  const theme = useTheme() as AppTheme;
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const timing = useMemo(() => computeScrapeTiming(progress, nowMs), [progress, nowMs]);
  const progressLabel = formatScrapeProgressLabel(progress);
  const phaseLabel = formatScrapePhaseLabel(progress);
  const percent =
    progress.pagesTotal != null && progress.pagesTotal > 0
      ? Math.min(100, Math.round((progress.pagesDone / progress.pagesTotal) * 100))
      : null;

  const currentTitle =
    progress.currentPage?.title?.trim() ||
    progress.currentPage?.url ||
    progress.activePages?.[0]?.title ||
    progress.activePages?.[0]?.url ||
    null;

  return (
    <Stack spacing={compact ? 0.75 : 1.25} sx={{ minWidth: 0 }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: compact ? 1 : 1.5,
          alignItems: "center",
        }}
      >
        <Typography variant="caption" sx={{ color: theme.palette.info.light, fontWeight: 700 }}>
          Elapsed {formatDurationSeconds(timing.elapsedSec)}
        </Typography>
        {timing.etaSec != null ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            ~{formatDurationSeconds(timing.etaSec)} left
          </Typography>
        ) : progress.pagesDone > 0 ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            Estimating time…
          </Typography>
        ) : null}
        {progressLabel ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            {progressLabel}
          </Typography>
        ) : null}
      </Box>

      {percent != null ? (
        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{ borderRadius: 1, height: compact ? 4 : 6 }}
        />
      ) : (
        <LinearProgress sx={{ borderRadius: 1, height: compact ? 4 : 6 }} />
      )}

      {!compact && sourceRef ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, wordBreak: "break-all" }}>
          Site: {sourceRef}
        </Typography>
      ) : null}

      <Typography variant="caption" sx={{ color: theme.app.text.primary }}>
        {phaseLabel}
        {currentTitle ? (
          <>
            {" — "}
            <Box component="span" sx={{ color: theme.app.dashboard.accentBlue, fontWeight: 600 }}>
              {currentTitle}
            </Box>
          </>
        ) : null}
      </Typography>

      {progress.activePages && progress.activePages.length > 1 ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
          +{progress.activePages.length - 1} more page
          {progress.activePages.length - 1 === 1 ? "" : "s"} in parallel
        </Typography>
      ) : null}

      {!compact && progress.recentPages.length > 0 ? (
        <Box component="ul" sx={{ m: 0, pl: 2.25 }}>
          {progress.recentPages.slice(0, 5).map((page) => (
            <Box component="li" key={page.url} sx={{ mb: 0.25 }}>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Done: {page.title || page.url}
                {page.chunks > 0 ? ` (${page.chunks} pieces)` : ""}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : null}
    </Stack>
  );
}
