"use client";



import CloudUpload from "@mui/icons-material/CloudUpload";

import Box from "@mui/material/Box";

import { alpha, useTheme } from "@mui/material/styles";

import type { AppTheme } from "@/theme/theme";

import { Button, Typography } from "@/components/common";

import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";

import { DashboardCard } from "@/components/common";

import { WidgetDraftStatusBar } from "@/features/chat-widget/components/WidgetDraftStatusBar";

import { useWidgetAdminLifecycle } from "@/features/chat-widget/hooks/useWidgetAdminLifecycle";



export function WidgetDeployStatusCard({ widgetKey }: { widgetKey: string }) {

  const theme = useTheme() as AppTheme;

  const { meta, loading, error, busy, publishLatest } = useWidgetAdminLifecycle(widgetKey);



  return (

    <DashboardCard sx={{ p: 2, mb: 2 }}>

      <Typography variant="mediumLarge" fontWeight={700} sx={{ mb: 1 }}>

        Deployment

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

                  meta.deploy.state === "live" || meta.deploy.state === "live_with_pending_draft"

                    ? theme.palette.success.main

                    : theme.palette.warning.main,

                  0.12,

                ),

                border: `1px solid ${alpha(

                  meta.deploy.state === "live" || meta.deploy.state === "live_with_pending_draft"

                    ? theme.palette.success.main

                    : theme.palette.warning.main,

                  0.35,

                )}`,

              }}

            >

              <Typography variant="caption" fontWeight={700}>

                {meta.deploy.state === "live"

                  ? "Live"

                  : meta.deploy.state === "live_with_pending_draft"

                    ? "Live · pending publish"

                    : "Draft only"}

              </Typography>

            </Box>

            {meta.deploy.draftSavedAt ? (

              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>

                Draft saved: {new Date(meta.deploy.draftSavedAt).toLocaleString()}

              </Typography>

            ) : null}

            {meta.deploy.liveAt ? (

              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>

                Last published: {new Date(meta.deploy.liveAt).toLocaleString()}

              </Typography>

            ) : null}

          </Box>

          {meta.deploy.state === "draft_only" ||
          meta.deploy.state === "live_with_pending_draft" ? (

            <Button

              type="button"

              variant="primary"

              size="small"

              sx={{ ...gradientPrimaryButtonSx, mt: 1.5 }}

              disabled={busy || loading}

              startIcon={<CloudUpload sx={{ fontSize: 16 }} />}

              onClick={() => void publishLatest()}

            >

              {busy ? "Publishing…" : "Publish to live sites"}

            </Button>

          ) : null}

        </>

      ) : null}

    </DashboardCard>

  );

}

