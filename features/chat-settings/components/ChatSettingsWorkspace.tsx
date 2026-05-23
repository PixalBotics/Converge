"use client";

import { useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography } from "@/components/common";
import {
  ChatLivePageHeader,
  ChatScopeFiltersPanel,
  useChatScopeFilters,
} from "@/features/chat-shared";
import { chatLivePageStackSx } from "@/features/chat-shared/styles/chat-live.styles";
import { buildChatLiveNavItems } from "@/lib/permissions";
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
  const chatNavItems = useMemo(
    () => buildChatLiveNavItems(hasPage, hasOperational),
    [hasPage, hasOperational],
  );
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
    if (params.get("tab") === "settings") params.delete("tab");
    const qs = params.toString();
    const next = qs ? `/dashboard/chat-settings?${qs}` : "/dashboard/chat-settings";
    const current = qs
      ? `/dashboard/chat-settings?${searchParams.toString()}`
      : "/dashboard/chat-settings";
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
    <Box sx={chatLivePageStackSx}>
      <ChatLivePageHeader
        title="Canned messages"
        subtitle="Manage quick replies per website for the agent inbox. Routing, QA, and operations are configured under Website Assignments and the chat widget."
        navItems={chatNavItems}
      />

      <DashboardCard sx={{ flexShrink: 0, p: { xs: 1.5, md: 2 }, height: "auto", minHeight: 0 }}>
        <ChatScopeFiltersPanel
          filters={scopeFilters.filters}
          onPatch={scopeFilters.patchFilters}
          onReset={scopeFilters.resetFilters}
          canFilterByResellerId={scopeFilters.canFilterByResellerId}
          resellerOptions={scopeFilters.resellerOptions}
          parentCompanyOptions={scopeFilters.parentCompanyOptions}
          childCompanyOptions={scopeFilters.childCompanyOptions}
          websiteOptions={scopeFilters.websiteOptions}
          hint="Filter canned messages: reseller → parent company → child company → website (optional)."
        />
        {scopeFilters.websitesLoading ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mt: 1 }}>
            Loading websites…
          </Typography>
        ) : null}
      </DashboardCard>

      <CannedResponsesTab
        filters={scopeFilters.filters}
        canFilterByResellerId={scopeFilters.canFilterByResellerId}
        canEdit={canEdit}
        onNotifyError={notifyError}
        onNotifySuccess={(message) => publishAppToast({ message, variant: "success" })}
      />
    </Box>
  );
}
