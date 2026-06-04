"use client";

import { useEffect, useState } from "react";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import Box from "@mui/material/Box";
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

  const [internalSelected, setInternalSelected] = useState<string[]>([]);
  const [externalSelected, setExternalSelected] = useState<string[]>([]);

  useEffect(() => {
    if (rosterQuery.data) {
      setInternalSelected(rosterQuery.data.internal.map((r) => r.userId));
      setExternalSelected(rosterQuery.data.external.map((r) => r.userId));
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
                  Internal QA reviews internal-channel chats; external QA reviews external-channel
                  chats. Keep QA separate from live chat agents.
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
                      internalUserIds: internalSelected,
                      externalUserIds: externalSelected,
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
                  : `Save QA roster (${internalSelected.length + externalSelected.length})`}
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
          After save, they review closed chats only from the{" "}
          <strong>QA inbox</strong> — not from the agent inbox.
        </Typography>
      </Box>

      <QaRosterChannelPanel
        channel="Internal"
        websiteId={websiteId}
        parentCompanyId={parentCompanyId}
        resellerId={resellerId}
        canFilterByResellerId={canFilterByResellerId}
        assigned={rosterQuery.data?.internal ?? []}
        selectedIds={internalSelected}
        onChangeSelectedIds={setInternalSelected}
        chatAgentUserIds={chatAgentUserIds}
        canEdit={canEdit}
        disabled={saveRoster.isPending}
      />

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
    </Box>
  );
}
