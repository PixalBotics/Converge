"use client";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { QaReviewBundle } from "@/services/chat/qa.types";
import { qaUserLabel } from "../utils/qa-labels";

function accordionSx(theme: AppTheme): object {
  const d = theme.app.dashboard;
  return {
    background: "transparent",
    boxShadow: "none",
    "&:before": { display: "none" },
    borderBottom: `1px solid ${alpha(d.cardBorder, 0.35)}`,
  };
}

interface QaTimelinePanelProps {
  bundle: QaReviewBundle | null;
}

export function QaTimelinePanel({ bundle }: QaTimelinePanelProps) {
  const theme = useTheme() as AppTheme;
  if (!bundle) return null;

  const { segments, timeline } = bundle;
  const transfers = (timeline.transfers ?? []) as Array<Record<string, unknown>>;
  const takeovers = (timeline.takeoverRequests ?? []) as Array<Record<string, unknown>>;
  const whispers = (timeline.whispers ?? []) as Array<Record<string, unknown>>;
  const events = (timeline.analyticsEvents ?? []) as Array<Record<string, unknown>>;

  return (
    <Box sx={{ px: 2, pb: 2, borderTop: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.35)}` }}>
      <Typography fontWeight={700} sx={{ fontSize: 13, py: 1.5 }}>
        Timeline
      </Typography>

      {segments?.segments?.length ? (
        <Accordion disableGutters sx={accordionSx(theme)}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Takeover segments</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            {segments.takeoverBoundaryAt ? (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
                Boundary: {new Date(segments.takeoverBoundaryAt).toLocaleString()}
              </Typography>
            ) : null}
            {segments.segments.map((seg) => (
              <Typography key={seg.key} variant="caption" sx={{ display: "block", mb: 0.5 }}>
                {seg.label} — {seg.messageCount} messages
              </Typography>
            ))}
          </AccordionDetails>
        </Accordion>
      ) : null}

      {takeovers.length > 0 ? (
        <Accordion disableGutters sx={accordionSx(theme)}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              Takeovers ({takeovers.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            {takeovers.map((t, i) => (
              <Typography key={i} variant="caption" sx={{ display: "block", mb: 0.5 }}>
                {String(t.status ?? "—")} · {qaUserLabel(t.requestedBy as never)}
              </Typography>
            ))}
          </AccordionDetails>
        </Accordion>
      ) : null}

      {transfers.length > 0 ? (
        <Accordion disableGutters sx={accordionSx(theme)}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              Transfers ({transfers.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            {transfers.map((t, i) => (
              <Typography key={i} variant="caption" sx={{ display: "block", mb: 0.5 }}>
                {qaUserLabel(t.fromUser as never)} → {qaUserLabel(t.toUser as never)}
              </Typography>
            ))}
          </AccordionDetails>
        </Accordion>
      ) : null}

      {whispers.length > 0 ? (
        <Accordion disableGutters sx={accordionSx(theme)}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              Whispers ({whispers.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            {whispers.map((w, i) => (
              <Typography key={i} variant="caption" sx={{ display: "block", mb: 0.5 }}>
                {(w as { redacted?: boolean }).redacted
                  ? "Redacted whisper"
                  : String((w as { message?: string }).message ?? "Whisper")}
              </Typography>
            ))}
          </AccordionDetails>
        </Accordion>
      ) : null}

      {events.length > 0 ? (
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mt: 1, display: "block" }}>
          {events.length} analytics events on record
        </Typography>
      ) : null}
    </Box>
  );
}
