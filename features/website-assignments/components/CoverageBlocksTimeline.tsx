"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { CoverageBlockDraft } from "../utils/coverage-block-draft.utils";
import { formatBlockPeriodLabel } from "../utils/coverage-block-overlap.utils";
import { coerceTimeHm24, formatHm12Label, parseHmMinutes24 } from "../utils/schedule-time.utils";

type CoverageBlocksTimelineProps = {
  serviceStart: string;
  serviceEnd: string;
  blocks: CoverageBlockDraft[];
};

const BLOCK_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"];

export function CoverageBlocksTimeline({
  serviceStart,
  serviceEnd,
  blocks,
}: CoverageBlocksTimelineProps) {
  const theme = useTheme() as AppTheme;
  const dayStart = parseHmMinutes24(serviceStart) ?? 9 * 60;
  const dayEnd = parseHmMinutes24(serviceEnd) ?? 17 * 60;
  const span = Math.max(dayEnd - dayStart, 1);

  return (
    <Box
      sx={{
        mb: 2,
        p: 1.5,
        borderRadius: 2,
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
        bgcolor: "rgba(255,255,255,0.02)",
      }}
    >
      <Typography variant="caption" sx={{ display: "block", fontWeight: 700, mb: 1 }}>
        Day timeline (within chat service hours)
      </Typography>
      <Box
        sx={{
          position: "relative",
          height: 36,
          borderRadius: 1,
          bgcolor: `${theme.palette.info.main}14`,
          border: `1px dashed ${theme.palette.info.main}44`,
          overflow: "hidden",
        }}
      >
        {blocks.map((block, index) => {
          const start = parseHmMinutes24(block.startTime) ?? dayStart;
          const end = parseHmMinutes24(block.endTime) ?? dayEnd;
          const left = ((start - dayStart) / span) * 100;
          const width = ((end - start) / span) * 100;
          const label = `${formatHm12Label(block.startTime)}–${formatHm12Label(block.endTime)}`;
          return (
            <Box
              key={block.id ?? `tl-${index}`}
              title={`${formatBlockPeriodLabel(block, index)}: ${label}`}
              sx={{
                position: "absolute",
                left: `${Math.max(0, left)}%`,
                width: `${Math.min(100 - Math.max(0, left), Math.max(width, 4))}%`,
                top: 4,
                bottom: 4,
                borderRadius: 0.75,
                bgcolor: BLOCK_COLORS[index % BLOCK_COLORS.length],
                opacity: 0.92,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 10,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
        {blocks.map((block, index) => (
          <Typography
            key={block.id ?? `legend-${index}`}
            variant="caption"
            sx={{ color: theme.app.dashboard.textMuted }}
          >
            <Box
              component="span"
              sx={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: BLOCK_COLORS[index % BLOCK_COLORS.length],
                mr: 0.5,
                verticalAlign: "middle",
              }}
            />
            {formatBlockPeriodLabel(block, index)}: {formatHm12Label(block.startTime)} –{" "}
            {formatHm12Label(block.endTime)}
          </Typography>
        ))}
      </Box>
      <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: theme.app.dashboard.textMuted }}>
        Service window: {formatHm12Label(coerceTimeHm24(serviceStart))} –{" "}
        {formatHm12Label(coerceTimeHm24(serviceEnd))}
      </Typography>
    </Box>
  );
}
