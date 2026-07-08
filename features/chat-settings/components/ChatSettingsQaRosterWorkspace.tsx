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
  ChatLivePageShell,
  ChatScopeFiltersPanel,
  useChatScopeFilters,
} from "@/features/chat-shared";
import { PermissionDeniedPanel } from "@/components/common";
import { useAuth, useResellerListScope } from "@/lib/auth";
import { PAGE } from "@/lib/permissions/permission-constants";
import { OP } from "@/lib/permissions/operational-keys";
import { useChatApiGates } from "@/lib/permissions";
import { QaRosterTab } from "./QaRosterTab";
import { ChatSettingsSectionLayout } from "./ChatSettingsSectionLayout";

export function ChatSettingsQaRosterWorkspace() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasOperational, hasPage, permissionsSyncing } = useAuth();
  const { sessionResellerId } = useResellerListScope();
  const gates = useChatApiGates();

  const canViewRoster =
    hasPage(PAGE.CHAT_QA_ROSTER) ||
    hasPage(PAGE.CHAT_WIDGET) ||
    hasOperational(OP.qa.chatAssign);

  const initialWebsiteId = searchParams.get("website")?.trim() ?? "";

  const scopeFilters = useChatScopeFilters(
    initialWebsiteId ? { websiteId: initialWebsiteId } : undefined,
    { apiEnabled: gates.widgetSettings || canViewRoster },
  );

  const selectedWebsiteId = scopeFilters.filters.websiteId.trim();
  const selectedWebsite = scopeFilters.websiteOptions.find(
    (w) => w.value === selectedWebsiteId,
  );

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedWebsiteId) params.set("website", selectedWebsiteId);
    else params.delete("website");
    const base = "/dashboard/chat-settings/qa-roster";
    const qs = params.toString();
    const next = qs ? `${base}?${qs}` : base;
    const current = qs ? `${base}?${searchParams.toString()}` : base;
    if (next !== current) {
      router.replace(next, { scroll: false });
    }
  }, [router, searchParams, selectedWebsiteId]);

  if (permissionsSyncing) {
    return (
      <Typography sx={{ py: 4, color: theme.app.dashboard.textMuted }}>
        Loading permissions…
      </Typography>
    );
  }

  if (!canViewRoster) {
    return (
      <PermissionDeniedPanel
        title="QA roster not available"
        description="Requires page:chat-qa-roster (or legacy page:chat-widget) and qa:chat:assign or chat-widget access from /auth/me."
      />
    );
  }

  return (
    <ChatLivePageShell>
      <ChatLivePageHeader
        title="QA roster"
        subtitle="Dedicated QA reviewers per website—separate from live chat agents. They review closed chats in the QA inbox."
        navPreset="configure"
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
                Choose a website to manage QA reviewers
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
        </DashboardCard>

        {!selectedWebsiteId ? (
          <DashboardCard sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
            <Typography fontWeight={600} sx={{ mb: 0.75, color: theme.app.text.primary }}>
              Select a website
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.app.dashboard.textMuted, maxWidth: 420, mx: "auto" }}
            >
              Pick reseller, parent company, and website above. Roster changes apply to one site at
              a time.
            </Typography>
          </DashboardCard>
        ) : (
          <QaRosterTab
            websiteId={selectedWebsiteId}
            parentCompanyId={scopeFilters.filters.parentCompanyId}
            resellerId={
              scopeFilters.canFilterByResellerId
                ? scopeFilters.filters.resellerId
                : sessionResellerId ?? ""
            }
            canFilterByResellerId={scopeFilters.canFilterByResellerId}
          />
        )}
      </ChatSettingsSectionLayout>
    </ChatLivePageShell>
  );
}
