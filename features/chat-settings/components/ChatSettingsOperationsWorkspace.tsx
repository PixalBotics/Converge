"use client";

import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography } from "@/components/common";
import {
  ChatLivePageHeader,
  ChatLivePageShell,
  ChatScopeFiltersPanel,
  useChatScopeFilters,
} from "@/features/chat-shared";
import { PermissionDeniedPanel } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { useChatApiGates } from "@/lib/permissions";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { ClosePolicyListTab } from "./ClosePolicyListTab";
import { ChatSettingsSubnav } from "./ChatSettingsSubnav";

export function ChatSettingsOperationsWorkspace() {
  const theme = useTheme() as AppTheme;
  const { permissionsSyncing, hasOperational } = useAuth();
  const gates = useChatApiGates();
  const canEdit = hasOperational(OP.chatWidget.update);

  const scopeFilters = useChatScopeFilters(undefined, { apiEnabled: gates.widgetSettings });

  const notifyError = (e: unknown) => {
    publishAppToast({
      message: extractApiErrorMessageForToast(e, "Request failed"),
      variant: "error",
    });
  };

  if (permissionsSyncing) {
    return (
      <Typography sx={{ py: 4, color: theme.app.dashboard.textMuted }}>Loading permissions…</Typography>
    );
  }

  if (!gates.widgetSettings) {
    return (
      <PermissionDeniedPanel
        title="Chat settings not available"
        description="Requires page:chat-widget and chat-widget:view or chat-widget:update from /auth/me."
      />
    );
  }

  return (
    <ChatLivePageShell>
      <ChatLivePageHeader
        title="Chat settings"
        subtitle="Close policies per website and global QA policy for all sites in your org scope."
        navPreset="configure"
      />

      <ChatSettingsSubnav />

      <DashboardCard sx={{ flexShrink: 0, p: { xs: 1.5, md: 2 }, height: "auto", minHeight: 0 }}>
        <ChatScopeFiltersPanel
          compact
          filters={scopeFilters.filters}
          onPatch={scopeFilters.patchFilters}
          onReset={scopeFilters.resetFilters}
          canFilterByResellerId={scopeFilters.canFilterByResellerId}
          resellerOptions={scopeFilters.resellerOptions}
          parentCompanyOptions={scopeFilters.parentCompanyOptions}
          childCompanyOptions={scopeFilters.childCompanyOptions}
          websiteOptions={scopeFilters.websiteOptions}
        />
        {scopeFilters.websitesLoading ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mt: 0.75 }}>
            Loading websites…
          </Typography>
        ) : null}
      </DashboardCard>

      <DashboardCard
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          p: { xs: 1.5, md: 2 },
          overflow: "hidden",
          borderColor: alpha(theme.app.dashboard.cardBorder, 0.85),
        }}
      >
        <ClosePolicyListTab
          filters={scopeFilters.filters}
          canFilterByResellerId={scopeFilters.canFilterByResellerId}
          canEdit={canEdit}
          onNotifyError={notifyError}
          onNotifySuccess={(message) => publishAppToast({ message, variant: "success" })}
        />
      </DashboardCard>
    </ChatLivePageShell>
  );
}
