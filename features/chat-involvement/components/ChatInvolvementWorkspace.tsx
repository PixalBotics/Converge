"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Chip from "@mui/material/Chip";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  DashboardCard,
  PermissionDeniedPanel,
  Typography,
} from "@/components/common";
import {
  ChatLivePageHeader,
  ChatLivePageShell,
  ChatScopeTableFiltersCard,
  chatConfigurePageTabsSx,
  useChatScopeFilters,
} from "@/features/chat-shared";
import { useChatApiGates } from "@/lib/permissions";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions/operational-keys";
import { fetchWebsiteInvolvementLinks } from "@/services/chat/involvement.api";
import { InvolvementUsersTab } from "./InvolvementUsersTab";
import { ChatInvolvementScopeFilterPanel } from "./ChatInvolvementScopeFilterPanel";

type TabId = "users" | "links";

export function ChatInvolvementWorkspace() {
  const theme = useTheme() as AppTheme;
  const { hasOperational, hasPage, permissionsSyncing } = useAuth();
  const gates = useChatApiGates();
  const [tab, setTab] = useState<TabId>("users");
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const scopeFilters = useChatScopeFilters(undefined, { apiEnabled: gates.widgetSettings });
  const websiteId = scopeFilters.filters.websiteId.trim();

  const hasActiveTableFilters = Boolean(
    scopeFilters.filters.resellerId.trim() ||
      scopeFilters.filters.parentCompanyId.trim() ||
      scopeFilters.filters.childCompanyId.trim() ||
      scopeFilters.filters.websiteId.trim(),
  );

  const linksQuery = useQuery({
    queryKey: ["involvement-links", websiteId],
    queryFn: () => fetchWebsiteInvolvementLinks(websiteId),
    enabled: gates.widgetSettings && Boolean(websiteId) && tab === "links",
  });

  if (permissionsSyncing) {
    return <Typography sx={{ py: 4 }}>Loading permissions…</Typography>;
  }

  if (!gates.widgetSettings) {
    return (
      <PermissionDeniedPanel
        title="Chat involvement not available"
        description="Requires page:chat-widget and chat-widget:view or update."
      />
    );
  }

  return (
    <ChatLivePageShell>
      <ChatLivePageHeader
        title="Chat involvement"
        subtitle="External users who receive monitor links by email—not live chat agents. Scope filters apply to the table only; Add modals use their own picker. QA reviewers live under QA → Roster."
        navPreset="configure"
      />

      <ChatScopeTableFiltersCard
        hasActiveFilters={hasActiveTableFilters}
        filterPopoverOpen={filterPopoverOpen}
        onFilterPopoverOpenChange={setFilterPopoverOpen}
      >
        <ChatInvolvementScopeFilterPanel
          filters={scopeFilters.filters}
          onPatch={scopeFilters.patchFilters}
          canFilterByResellerId={scopeFilters.canFilterByResellerId}
          resellerOptions={scopeFilters.resellerOptions}
          parentCompanyOptions={scopeFilters.parentCompanyOptions}
          childCompanyOptions={scopeFilters.childCompanyOptions}
          websiteOptions={scopeFilters.websiteOptions}
          hasActiveFilters={hasActiveTableFilters}
          onClearAll={scopeFilters.resetFilters}
          onClose={() => setFilterPopoverOpen(false)}
        />
      </ChatScopeTableFiltersCard>

      <Tabs value={tab} onChange={(_, v) => setTab(v as TabId)} sx={chatConfigurePageTabsSx}>
        <Tab value="users" label="Involvement users" />
        <Tab value="links" label="Link activity" />
      </Tabs>

      {tab === "users" ? (
        <InvolvementUsersTab
          filters={scopeFilters.filters}
          canFilterByResellerId={scopeFilters.canFilterByResellerId}
          canEdit={hasOperational(OP.chatWidget.update)}
          apiEnabled={gates.widgetSettings}
        />
      ) : null}

      {tab === "links" ? (
        <DashboardCard sx={{ p: 2 }}>
          <Typography fontWeight={700} sx={{ fontSize: 14, mb: 1 }}>
            Recent involvement links
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 2 }}
          >
            Use table Filters → Website to view links for one site. One shared URL per send.
          </Typography>
          {!websiteId ? (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              Open Filters and pick a website.
            </Typography>
          ) : linksQuery.isLoading ? (
            <Typography variant="caption">Loading…</Typography>
          ) : (linksQuery.data ?? []).length === 0 ? (
            <Typography variant="caption">No links sent yet for this website.</Typography>
          ) : (
            (linksQuery.data ?? []).map((link) => {
              const opened = Boolean(link.firstOpenedAt);
              const revoked = Boolean(link.revokedAt);
              const label = revoked ? "Revoked" : opened ? "Opened" : "Pending";
              const emails = Array.isArray(link.recipientEmails)
                ? link.recipientEmails
                : [link.recipientEmail];
              return (
                <Box
                  key={link.id}
                  sx={{
                    mb: 1,
                    p: 1.25,
                    borderRadius: 1,
                    border: `1px solid ${theme.app.dashboard.cardBorder}`,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 0.5 }}>
                    <Chip label={label} size="small" sx={{ height: 20, fontSize: 10 }} />
                    <Chip
                      label={link.department?.name ?? "Dept"}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: 10 }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ display: "block" }}>
                    Chat {link.conversationId.slice(0, 8)}… · {emails.join(", ")}
                  </Typography>
                </Box>
              );
            })
          )}
        </DashboardCard>
      ) : null}
    </ChatLivePageShell>
  );
}
