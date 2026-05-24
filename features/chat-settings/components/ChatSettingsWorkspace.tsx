"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import { useRouter, useSearchParams } from "next/navigation";
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
import { CannedResponsesTab } from "./CannedResponsesTab";

export function ChatSettingsWorkspace() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasOperational, hasPage, permissionsSyncing } = useAuth();
  const gates = useChatApiGates();
  const canEdit = hasOperational(OP.chatWidget.update);

  const initialWebsiteId = searchParams.get("website")?.trim() ?? "";

  const scopeFilters = useChatScopeFilters(
    initialWebsiteId ? { websiteId: initialWebsiteId } : undefined,
    { apiEnabled: gates.widgetSettings },
  );

  const selectedWebsiteId = scopeFilters.filters.websiteId.trim();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedWebsiteId) params.set("website", selectedWebsiteId);
    else params.delete("website");
    const qs = params.toString();
    const next = qs ? `/dashboard/chat-canned?${qs}` : "/dashboard/chat-canned";
    const current = qs
      ? `/dashboard/chat-canned?${searchParams.toString()}`
      : "/dashboard/chat-canned";
    if (next !== current) {
      router.replace(next, { scroll: false });
    }
  }, [router, searchParams, selectedWebsiteId]);

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
        title="Canned messages not available"
        description="Requires page:chat-widget and chat-widget:view or chat-widget:update from /auth/me."
      />
    );
  }

  return (
    <ChatLivePageShell>
      <ChatLivePageHeader
        title="Canned messages"
        subtitle="Quick replies agents insert from the inbox composer. Scope filters narrow the list; each row is one message for a website."
        navPreset="configure"
      />

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
        <CannedResponsesTab
          filters={scopeFilters.filters}
          canFilterByResellerId={scopeFilters.canFilterByResellerId}
          canEdit={canEdit}
          onNotifyError={notifyError}
          onNotifySuccess={(message) => publishAppToast({ message, variant: "success" })}
          embedded
        />
      </DashboardCard>
    </ChatLivePageShell>
  );
}
