"use client";

import { useEffect, useMemo, useState } from "react";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  DashboardFilterSection,
  Typography,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import {
  useQaRosterExclusionsQuery,
  useQaRosterQuery,
  useSaveQaRosterMutation,
} from "../hooks/useChatSettings";
import { QaRosterChannelPanel } from "./QaRosterChannelPanel";

type QaRosterTabProps = {
  websiteId: string;
  parentCompanyId?: string;
  resellerId?: string;
  canFilterByResellerId?: boolean;
};

export function QaRosterTab({
  websiteId,
  parentCompanyId = "",
  resellerId = "",
  canFilterByResellerId = false,
}: QaRosterTabProps) {
  const theme = useTheme() as AppTheme;
  const { hasOperational } = useAuth();
  const canEdit = hasOperational(OP.qa.chatAssign) || hasOperational(OP.chatWidget.update);

  const rosterQuery = useQaRosterQuery(websiteId);
  const exclusionsQuery = useQaRosterExclusionsQuery(websiteId);
  const saveRoster = useSaveQaRosterMutation(websiteId);

  const [internalByPool, setInternalByPool] = useState<Record<string, string[]>>({});
  const [externalSelected, setExternalSelected] = useState<string[]>([]);
  const [externalEnabled, setExternalEnabled] = useState(false);

  const internalAssignmentCount = useMemo(
    () => Object.values(internalByPool).reduce((n, ids) => n + ids.length, 0),
    [internalByPool],
  );

  const showExternalSection = useMemo(
    () =>
      canFilterByResellerId ||
      Boolean(parentCompanyId.trim()) ||
      Boolean(resellerId.trim()),
    [canFilterByResellerId, parentCompanyId, resellerId],
  );

  useEffect(() => {
    if (rosterQuery.data) {
      const byPool: Record<string, string[]> = {};
      for (const row of rosterQuery.data.internal) {
        const pool = row.poolId?.trim();
        if (!pool) continue;
        byPool[pool] = byPool[pool] ?? [];
        byPool[pool].push(row.userId);
      }
      setInternalByPool(byPool);
      setExternalSelected(rosterQuery.data.external.map((r) => r.userId));
      setExternalEnabled(rosterQuery.data.external.length > 0);
    }
  }, [rosterQuery.data]);

  const chatAgentUserIds = exclusionsQuery.data?.chatAgentUserIds ?? [];

  if (rosterQuery.isLoading) {
    return (
      <Typography sx={{ color: theme.app.dashboard.textMuted, py: 2 }}>
        Loading QA roster…
      </Typography>
    );
  }

  if (rosterQuery.isError) {
    return (
      <Typography color="error" sx={{ py: 2 }}>
        Could not load QA roster for this website.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <DashboardCard sx={{ p: { xs: 2, md: 2.5 } }}>
        <DashboardFilterSection
          titleSlot={
            <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
              <FactCheckOutlined sx={{ color: theme.app.dashboard.accentViolet, mt: 0.25 }} />
              <Box>
                <Typography fontWeight={700} sx={{ fontSize: 16 }}>
                  QA reviewers (this website)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5, display: "block" }}
                >
                  Internal QA is pool-wise. External QA is optional — enable only when you need
                  external-channel reviewers. Keep QA separate from live chat agents.
                </Typography>
              </Box>
            </Box>
          }
          actionSlot={
            canEdit ? (
              <Button
                type="button"
                variant="primary"
                sx={gradientPrimaryButtonSx}
                disabled={saveRoster.isPending}
                onClick={() =>
                  saveRoster.mutate(
                    {
                      internalAssignments: Object.entries(internalByPool).flatMap(
                        ([poolId, userIds]) =>
                          userIds.map((userId) => ({ userId, poolId })),
                      ),
                      externalUserIds:
                        showExternalSection && externalEnabled ? externalSelected : [],
                    },
                    {
                      onSuccess: () =>
                        publishAppToast({ message: "QA roster saved", variant: "success" }),
                      onError: (e) =>
                        publishAppToast({
                          message: extractApiErrorMessageForToast(e, "Could not save QA roster"),
                          variant: "error",
                        }),
                    },
                  )
                }
              >
                {saveRoster.isPending
                  ? "Saving…"
                  : `Save QA roster (${internalAssignmentCount + (showExternalSection && externalEnabled ? externalSelected.length : 0)})`}
              </Button>
            ) : null
          }
        />
      </DashboardCard>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          alignItems: "flex-start",
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: alpha(theme.app.dashboard.accentBlue, 0.06),
          border: `1px solid ${alpha(theme.app.dashboard.accentBlue, 0.2)}`,
        }}
      >
        <InfoOutlined sx={{ fontSize: 18, color: theme.app.dashboard.accentBlue, mt: 0.15 }} />
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.55 }}>
          <strong>{chatAgentUserIds.length}</strong> user(s) on the live chat roster are hidden here.
          Turn on QA globally under <strong>Chat settings → QA policy</strong>, then save reviewers
          here. Closed chats appear in the <strong>QA inbox</strong> for the assigned reviewer only.
        </Typography>
      </Box>

      <QaRosterChannelPanel
        channel="Internal"
        websiteId={websiteId}
        parentCompanyId={parentCompanyId}
        resellerId={resellerId}
        canFilterByResellerId={canFilterByResellerId}
        assigned={rosterQuery.data?.internal ?? []}
        internalByPool={internalByPool}
        onInternalByPoolChange={setInternalByPool}
        chatAgentUserIds={chatAgentUserIds}
        canEdit={canEdit}
        disabled={saveRoster.isPending}
      />

      {showExternalSection ? (
        <DashboardCard sx={{ p: { xs: 2, md: 2.5 } }}>
          <FormControlLabel
            control={
              <Switch
                checked={externalEnabled}
                onChange={(_, checked) => setExternalEnabled(checked)}
                disabled={!canEdit || saveRoster.isPending}
              />
            }
            label={
              <Box>
                <Typography fontWeight={600} sx={{ fontSize: 14 }}>
                  Enable external QA reviewers
                </Typography>
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                  Off by default — only internal pool reviewers are assigned. Turn on to add external
                  staff (reseller or company admin).
                </Typography>
              </Box>
            }
            sx={{ alignItems: "flex-start", m: 0 }}
          />
        </DashboardCard>
      ) : null}

      {showExternalSection && externalEnabled ? (
        <QaRosterChannelPanel
          channel="External"
          websiteId={websiteId}
          parentCompanyId={parentCompanyId}
          resellerId={resellerId}
          canFilterByResellerId={canFilterByResellerId}
          assigned={rosterQuery.data?.external ?? []}
          selectedIds={externalSelected}
          onChangeSelectedIds={setExternalSelected}
          chatAgentUserIds={chatAgentUserIds}
          canEdit={canEdit}
          disabled={saveRoster.isPending}
        />
      ) : null}
    </Box>
  );
}
