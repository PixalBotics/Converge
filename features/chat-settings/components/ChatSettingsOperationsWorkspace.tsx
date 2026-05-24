"use client";

import { useEffect } from "react";
import Box from "@mui/material/Box";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import { useRouter, useSearchParams } from "next/navigation";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, Typography } from "@/components/common";
import {
  ChatLivePageHeader,
  ChatScopeFiltersPanel,
  useChatScopeFilters,
} from "@/features/chat-shared";
import { chatLivePageStackSx } from "@/features/chat-shared/styles/chat-live.styles";
import { PermissionDeniedPanel } from "@/components/common";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { useChatApiGates } from "@/lib/permissions";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import {
  useSaveWebsiteChatSettingsMutation,
  useWebsiteChatSettingsQuery,
} from "../hooks/useChatSettings";
import { ClosePolicyTab } from "./ClosePolicyTab";
import { ChatSettingsSectionLayout } from "./ChatSettingsSectionLayout";

export function ChatSettingsOperationsWorkspace() {
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
  const selectedWebsite = scopeFilters.websiteOptions.find(
    (w) => w.value === selectedWebsiteId,
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedWebsiteId) params.set("website", selectedWebsiteId);
    else params.delete("website");
    const base = "/dashboard/chat-settings/close-policy";
    const qs = params.toString();
    const next = qs ? `${base}?${qs}` : base;
    const current = qs ? `${base}?${searchParams.toString()}` : base;
    if (next !== current) {
      router.replace(next, { scroll: false });
    }
  }, [router, searchParams, selectedWebsiteId]);

  const settingsQuery = useWebsiteChatSettingsQuery(
    selectedWebsiteId,
    gates.widgetSettings && Boolean(selectedWebsiteId),
  );
  const saveSettings = useSaveWebsiteChatSettingsMutation(selectedWebsiteId);

  const notifyError = (e: unknown) => {
    publishAppToast({
      message: extractApiErrorMessageForToast(e, "Request failed"),
      variant: "error",
    });
  };

  const saveSettingsBody = (body: Parameters<typeof saveSettings.mutate>[0]) => {
    saveSettings.mutate(body, {
      onSuccess: () => publishAppToast({ message: "Settings saved", variant: "success" }),
      onError: notifyError,
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
    <Box sx={chatLivePageStackSx}>
      <ChatLivePageHeader
        title="Chat settings"
        subtitle="Per-website close policy — auto-close timers, fallback messages, and supervisor close rules."
        navItems={[]}
      />

      <ChatSettingsSectionLayout>
        <DashboardCard
          sx={{
            flexShrink: 0,
            p: { xs: 1.5, md: 2 },
            borderColor: alpha(theme.app.dashboard.cardBorder, 0.85),
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1.5,
              mb: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
              <LanguageOutlined sx={{ fontSize: 20, color: theme.app.dashboard.accentBlue }} />
              <Typography fontWeight={600} sx={{ fontSize: 14, color: theme.app.text.primary }}>
                Website scope
              </Typography>
            </Box>
            {selectedWebsiteId && selectedWebsite ? (
              <Typography
                variant="caption"
                sx={{
                  px: 1.25,
                  py: 0.35,
                  borderRadius: 999,
                  bgcolor: alpha(theme.app.dashboard.accentBlue, 0.12),
                  color: theme.app.dashboard.accentBlue,
                  fontWeight: 600,
                }}
              >
                {selectedWebsite.label}
              </Typography>
            ) : (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Choose a website to view and edit close policy
              </Typography>
            )}
          </Box>
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
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, mt: 1 }}>
              Loading websites…
            </Typography>
          ) : null}
        </DashboardCard>

        {!selectedWebsiteId ? (
          <DashboardCard sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
            <Typography fontWeight={600} sx={{ mb: 0.75, color: theme.app.text.primary }}>
              Select a website
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 420, mx: "auto" }}>
              Use the scope filters above to pick reseller, company, and website. Close policy applies
              to one website at a time.
            </Typography>
          </DashboardCard>
        ) : settingsQuery.isLoading ? (
          <Typography sx={{ py: 3, color: theme.app.dashboard.textMuted }}>
            Loading settings for website…
          </Typography>
        ) : settingsQuery.isError || !settingsQuery.data ? (
          <DashboardCard sx={{ p: 3 }}>
            <Typography sx={{ color: theme.palette.error.light }}>
              Could not load chat settings for this website.
            </Typography>
          </DashboardCard>
        ) : (
          <DashboardCard sx={{ p: { xs: 2, md: 2.5 }, flex: 1, minHeight: 0 }}>
            {!canEdit ? (
              <Typography
                variant="caption"
                sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 2 }}
              >
                View only — you need chat-widget:update to save changes.
              </Typography>
            ) : null}
            <ClosePolicyTab
              settings={settingsQuery.data.settings}
              canEdit={canEdit}
              saving={saveSettings.isPending}
              onSave={saveSettingsBody}
            />
          </DashboardCard>
        )}
      </ChatSettingsSectionLayout>
    </Box>
  );
}
