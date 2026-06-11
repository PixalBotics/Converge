"use client";

import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { KnowledgeScrapeProgress, KnowledgeTrainingTier } from "@/api/ai-knowledge/types";
import { Typography } from "@/components/common";
import {
  computeAvgSecPerPage,
  computeCurrentPageElapsedSec,
  computeScrapeTiming,
  formatDurationSeconds,
  formatScrapePageDisplay,
  formatScrapePhaseLabel,
  formatScrapeProgressLabel,
  formatTrainingTierBanner,
  resolveFullScrapeUiPhase,
} from "./ai-training-kb.utils";

export function AiTrainingScrapeLiveBar({
  progress,
  trainingTier,
}: {
  progress: KnowledgeScrapeProgress;
  trainingTier?: KnowledgeTrainingTier | null;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const timing = useMemo(() => computeScrapeTiming(progress, nowMs), [progress, nowMs]);
  const pageElapsedSec = useMemo(
    () => computeCurrentPageElapsedSec(progress, nowMs),
    [progress, nowMs],
  );
  const avgSecPerPage = useMemo(
    () => computeAvgSecPerPage(progress, nowMs),
    [progress, nowMs],
  );
  const tierBanner = formatTrainingTierBanner(progress, trainingTier ?? progress.trainingTier);
  const progressLabel = formatScrapeProgressLabel(progress);
  const phaseLabel = formatScrapePhaseLabel(progress);
  const postScrapePhase = resolveFullScrapeUiPhase(progress);
  const tier = progress.trainingTier;
  const percent =
    tier === "basic" && progress.basicPagesTotal > 0
      ? Math.min(
          100,
          Math.round((progress.basicPagesDone / progress.basicPagesTotal) * 100),
        )
      : progress.pagesTotal != null && progress.pagesTotal > 0
        ? Math.min(100, Math.round((progress.pagesDone / progress.pagesTotal) * 100))
        : null;

  const currentPage = progress.currentPage ?? progress.activePages?.[0] ?? null;
  const currentDisplay = formatScrapePageDisplay(currentPage?.url, currentPage?.title);
  const lastDone = progress.recentPages[0] ?? null;
  const lastDoneDisplay = lastDone
    ? formatScrapePageDisplay(lastDone.url, lastDone.title)
    : null;

  const severity = tierBanner?.severity ?? "info";
  const accent =
    severity === "success" ? theme.palette.success.main : d.accentBlue;

  return (
    <Box
      sx={{
        flexShrink: 0,
        px: { xs: 1.25, sm: 2 },
        py: 1,
        borderBottom: `1px solid ${alpha(d.cardBorder, 0.35)}`,
        bgcolor: alpha(accent, theme.palette.mode === "light" ? 0.08 : 0.12),
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          flexWrap: "wrap",
          minWidth: 0,
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: accent, flexShrink: 0 }}
        >
          {tierBanner?.title ?? "Training in progress"}
        </Typography>
        <Typography variant="caption" sx={{ color: d.textMuted, fontWeight: 600 }}>
          Total {formatDurationSeconds(timing.elapsedSec)}
        </Typography>
        {progressLabel ? (
          <Typography variant="caption" sx={{ color: d.textMuted, fontWeight: 600 }}>
            {progressLabel}
          </Typography>
        ) : null}
        {avgSecPerPage != null ? (
          <Typography variant="caption" sx={{ color: d.textMuted }}>
            ~{avgSecPerPage}s/page
          </Typography>
        ) : null}
        {timing.etaSec != null ? (
          <Typography variant="caption" sx={{ color: d.textMuted }}>
            ~{formatDurationSeconds(timing.etaSec)} left
          </Typography>
        ) : null}
      </Box>

      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 0.35,
          color: d.textMuted,
          fontWeight: 600,
        }}
      >
        {phaseLabel}
      </Typography>

      {currentDisplay ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            gap: 1,
            mt: 0.35,
            minWidth: 0,
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: accent,
              fontWeight: 700,
              minWidth: 0,
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Scraping: {currentDisplay}
          </Typography>
          {pageElapsedSec != null ? (
            <Typography variant="caption" sx={{ color: d.textMuted, flexShrink: 0 }}>
              {formatDurationSeconds(pageElapsedSec)} on this page
            </Typography>
          ) : null}
        </Box>
      ) : null}

      {(progress.activePages?.length ?? 0) > 1 ? (
        <Typography variant="caption" sx={{ display: "block", mt: 0.25, color: d.textMuted }}>
          +{(progress.activePages?.length ?? 0) - 1} more page
          {(progress.activePages?.length ?? 0) - 1 === 1 ? "" : "s"} in parallel
        </Typography>
      ) : null}

      {lastDoneDisplay && postScrapePhase !== "embedding" ? (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.25,
            color: d.textMuted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          Last done: {lastDoneDisplay}
          {lastDone && lastDone.chunks > 0 ? ` (${lastDone.chunks} pieces)` : ""}
        </Typography>
      ) : null}

      {postScrapePhase === "finishing_pages" || postScrapePhase === "embedding" ? (
        <LinearProgress
          sx={{
            mt: 0.75,
            borderRadius: 999,
            height: 4,
            bgcolor: alpha(d.cardBorder, 0.35),
            "& .MuiLinearProgress-bar": { bgcolor: accent },
          }}
        />
      ) : percent != null ? (
        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            mt: 0.75,
            borderRadius: 999,
            height: 4,
            bgcolor: alpha(d.cardBorder, 0.35),
            "& .MuiLinearProgress-bar": { bgcolor: accent },
          }}
        />
      ) : (
        <LinearProgress
          sx={{
            mt: 0.75,
            borderRadius: 999,
            height: 4,
            bgcolor: alpha(d.cardBorder, 0.35),
            "& .MuiLinearProgress-bar": { bgcolor: accent },
          }}
        />
      )}
    </Box>
  );
}
