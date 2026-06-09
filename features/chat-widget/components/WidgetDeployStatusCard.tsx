"use client";

import CloudOff from "@mui/icons-material/CloudOff";
import CloudUpload from "@mui/icons-material/CloudUpload";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { DashboardCard } from "@/components/common";
import { WidgetDraftStatusBar } from "@/features/chat-widget/components/WidgetDraftStatusBar";
import { useWidgetAdminLifecycle } from "@/features/chat-widget/hooks/useWidgetAdminLifecycle";

export function WidgetDeployStatusCard({ widgetKey }: { widgetKey: string }) {
  const theme = useTheme() as AppTheme;
  const { meta, loading, error, busy, publishLatest, unpublishLatest, isLive } =
    useWidgetAdminLifecycle(widgetKey);

  return (
    <DashboardCard sx={{ p: 2, mb: 2 }}>
      <Typography variant="mediumLarge" fontWeight={700} sx={{ mb: 1 }}>
        Live on customer sites
      </Typography>

      {loading ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          Loading…
        </Typography>
      ) : error ? (
        <Typography variant="body2" sx={{ color: theme.palette.error.main }}>
          {error}
        </Typography>
      ) : meta ? (
        <>
          <WidgetDraftStatusBar variant="detail" deployState={meta.deploy.state} />

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
            <Box
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: 1,
                bgcolor: alpha(
                  isLive ? theme.palette.success.main : theme.palette.warning.main,
                  0.12,
                ),
                border: `1px solid ${alpha(
                  isLive ? theme.palette.success.main : theme.palette.warning.main,
                  0.35,
                )}`,
              }}
            >
              <Typography variant="caption" fontWeight={700}>
                {meta.deploy.state === "live"
                  ? "Live"
                  : meta.deploy.state === "live_with_pending_draft"
                    ? "Live · newer draft saved"
                    : "Offline"}
              </Typography>
            </Box>

            {meta.deploy.draftSavedAt ? (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Draft saved: {new Date(meta.deploy.draftSavedAt).toLocaleString()}
              </Typography>
            ) : null}

            {meta.deploy.liveAt ? (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Last live: {new Date(meta.deploy.liveAt).toLocaleString()}
              </Typography>
            ) : null}
          </Box>

          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
            {meta.deploy.state === "draft_only" ||
            meta.deploy.state === "live_with_pending_draft" ? (
              <Button
                type="button"
                variant="primary"
                size="small"
                sx={gradientPrimaryButtonSx}
                disabled={busy || loading}
                startIcon={<CloudUpload sx={{ fontSize: 16 }} />}
                onClick={() => void publishLatest()}
              >
                {busy ? "Updating…" : meta.deploy.state === "draft_only" ? "Go live" : "Publish changes"}
              </Button>
            ) : null}

            {isLive ? (
              <Button
                type="button"
                variant="outlined"
                size="small"
                color="warning"
                disabled={busy || loading}
                startIcon={<CloudOff sx={{ fontSize: 16 }} />}
                onClick={() => void unpublishLatest()}
              >
                {busy ? "Updating…" : "Take offline"}
              </Button>
            ) : null}
          </Stack>
        </>
      ) : null}
    </DashboardCard>
  );
}
