"use client";

import { useState } from "react";
import {
  ChatLivePageHeader,
  ChatLivePageShell,
  ChatScopeTableFiltersCard,
  useChatScopeFilters,
} from "@/features/chat-shared";
import { ChatInvolvementScopeFilterPanel } from "@/features/chat-involvement/components/ChatInvolvementScopeFilterPanel";
import { PermissionDeniedPanel, Typography } from "@/components/common";
import { useChatApiGates } from "@/lib/permissions";
import { useAuth } from "@/lib/auth";
import { PAGE } from "@/lib/permissions/permission-constants";
import { OP } from "@/lib/permissions/operational-keys";
import { InternalSupervisorsTab } from "./InternalSupervisorsTab";

export function InternalSupervisorsWorkspace() {
  const { hasPage, hasOperational, permissionsSyncing } = useAuth();
  const gates = useChatApiGates();
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const scopeFilters = useChatScopeFilters(undefined, { apiEnabled: gates.widgetSettings });
  const canAccess =
    hasPage(PAGE.CHAT_INTERNAL_SUPERVISORS) ||
    (hasPage(PAGE.CHAT_WIDGET) && hasOperational(OP.chatWidget.view));

  const hasActiveTableFilters = Boolean(
    scopeFilters.filters.resellerId.trim() ||
      scopeFilters.filters.parentCompanyId.trim() ||
      scopeFilters.filters.childCompanyId.trim() ||
      scopeFilters.filters.websiteId.trim(),
  );

  if (permissionsSyncing) {
    return <Typography sx={{ py: 4 }}>Loading permissions…</Typography>;
  }

  if (!canAccess || !gates.widgetSettings) {
    return (
      <PermissionDeniedPanel
        title="Internal supervisors not available"
        description="Requires page:chat-internal-supervisors or page:chat-widget with chat-widget:view."
      />
    );
  }

  return (
    <ChatLivePageShell>
      <ChatLivePageHeader
        title="Internal supervisors"
        subtitle="Internal supervisors only (external users use involvement). Assign internal users to monitor internal pools."
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

      <InternalSupervisorsTab
        filters={scopeFilters.filters}
        canFilterByResellerId={scopeFilters.canFilterByResellerId}
        canEdit={hasOperational(OP.chatWidget.update)}
        apiEnabled={gates.widgetSettings}
      />
    </ChatLivePageShell>
  );
}
