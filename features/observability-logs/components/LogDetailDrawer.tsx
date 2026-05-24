"use client";

import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import {
  fetchAnalyticsLogDetail,
  fetchAuditLogDetail,
} from "@/api/observability/observability-logs.api";
import type { ObservabilityLogTab } from "../hooks/useObservabilityLogs";
import { observabilityLogKeys } from "../hooks/keys";
import {
  formatLogActor,
  formatLogTimestamp,
  formatLogWebsiteLabel,
} from "../utils/format-log";

export function LogDetailDrawer({
  open,
  logId,
  tab,
  onClose,
}: {
  open: boolean;
  logId: string | null;
  tab: ObservabilityLogTab;
  onClose: () => void;
}) {
  const theme = useTheme() as AppTheme;
  const auditQuery = useQuery({
    queryKey: observabilityLogKeys.auditDetail(logId ?? ""),
    queryFn: () => fetchAuditLogDetail(logId!),
    enabled: open && tab === "audit" && Boolean(logId),
  });
  const analyticsQuery = useQuery({
    queryKey: observabilityLogKeys.analyticsDetail(logId ?? ""),
    queryFn: () => fetchAnalyticsLogDetail(logId!),
    enabled: open && tab === "analytics" && Boolean(logId),
  });

  const detail = tab === "audit" ? auditQuery.data : analyticsQuery.data;
  const loading = tab === "audit" ? auditQuery.isLoading : analyticsQuery.isLoading;
  const payload =
    detail && "detailsJson" in detail
      ? detail.detailsJson
      : detail && "payloadJson" in detail
        ? detail.payloadJson
        : null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 440 } } }}>
      <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="subtitle1" fontWeight={600} color="white">
            Log details
          </Typography>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </Box>

        {loading ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            Loading…
          </Typography>
        ) : !detail ? (
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            No entry selected.
          </Typography>
        ) : (
          <>
            <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: "120px 1fr", gap: 1 }}>
              <Typography component="dt" variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Event
              </Typography>
              <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                {detail.eventType}
              </Typography>
              <Typography component="dt" variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Time
              </Typography>
              <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                {formatLogTimestamp(detail.createdAt)}
              </Typography>
              {"severity" in detail ? (
                <>
                  <Typography component="dt" variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                    Severity
                  </Typography>
                  <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                    {detail.severity}
                  </Typography>
                </>
              ) : null}
              <Typography component="dt" variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Actor
              </Typography>
              <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                {formatLogActor(detail.actor)}
              </Typography>
              <Typography component="dt" variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Website
              </Typography>
              <Typography component="dd" variant="body2" sx={{ m: 0, wordBreak: "break-word" }}>
                {formatLogWebsiteLabel(detail.website)}
              </Typography>
              <Typography component="dt" variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Conversation
              </Typography>
              <Typography component="dd" variant="body2" sx={{ m: 0, fontFamily: "monospace", fontSize: "0.75rem" }}>
                {detail.conversationId ?? "—"}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              {tab === "audit" ? "Details (JSON)" : "Payload (JSON)"}
            </Typography>
            <Box
              component="pre"
              sx={{
                flex: 1,
                m: 0,
                p: 1.5,
                overflow: "auto",
                borderRadius: 1,
                fontSize: "0.75rem",
                bgcolor: "rgba(0,0,0,0.35)",
                color: theme.app.text.primary,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {payload != null ? JSON.stringify(payload, null, 2) : "—"}
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
