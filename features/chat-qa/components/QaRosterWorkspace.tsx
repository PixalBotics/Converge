"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import FilterList from "@mui/icons-material/FilterList";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  DashboardCard,
  PermissionDeniedPanel,
  SearchBar,
  ToolbarFilterPopover,
  Typography,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { ChatLivePageHeader, ChatLivePageShell } from "@/features/chat-shared";
import { WebsiteAssignmentScopeFilterPanel } from "@/features/website-assignments/components/WebsiteAssignmentScopeFilterPanel";
import { useWebsiteAssignmentScopeFilters } from "@/features/website-assignments/hooks/useWebsiteAssignmentScopeFilters";
import {
  websiteAssignmentFilterCard,
  websiteAssignmentFilterIconBox,
  websiteAssignmentFilterTitleRow,
  websiteAssignmentHeaderActions,
  websiteAssignmentPageHeader,
  websiteAssignmentSearchFieldWrapper,
  websiteAssignmentSearchRow,
  websiteAssignmentTableCard,
  websiteAssignmentTableIconBox,
  websiteAssignmentTableToolbar,
} from "@/app/dashboard/website-assigning/website-assigning.styles";
import { mergeSx } from "@/lib/mui/merge-sx";
import { useAuth } from "@/lib/auth";
import { PAGE } from "@/lib/permissions/permission-constants";
import { OP } from "@/lib/permissions/operational-keys";
import { useChatApiGates } from "@/lib/permissions";
import { useQaRosterListQuery } from "../hooks/useQaRosterList";
import { QaRosterListTable } from "./QaRosterListTable";
import { qaRosterAssignHref } from "../utils/qa-assign-href";
import type { QaRosterListRow } from "@/services/chat/qa-roster.api";

export function QaRosterWorkspace() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { hasOperational, hasPage, permissionsSyncing } = useAuth();
  const gates = useChatApiGates();
  const scope = useWebsiteAssignmentScopeFilters();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const canViewRoster =
    hasPage(PAGE.CHAT_QA_ROSTER) ||
    hasPage(PAGE.CHAT_WIDGET) ||
    hasPage(PAGE.CHAT) ||
    hasOperational(OP.qa.chatAssign);

  const canEdit =
    hasOperational(OP.qa.chatAssign) || hasOperational(OP.chatWidget.update);

  const listQuery = useQaRosterListQuery(
    {
      all: true,
      resellerId: scope.canFilterByResellerId ? scope.filterResellerId : undefined,
      parentCompanyId: scope.filterParentCompanyId || undefined,
      childCompanyId: scope.filterChildCompanyId || undefined,
      search: search.trim() || undefined,
    },
    (gates.widgetSettings || canViewRoster) && canViewRoster,
  );

  const rows = listQuery.data ?? [];

  const hasActiveFilters = Boolean(
    scope.hasScopeFilters || search.trim() || searchInput.trim(),
  );

  const openAssign = () => {
    router.push(qaRosterAssignHref());
  };

  const openEdit = (row: QaRosterListRow) => {
    router.push(
      qaRosterAssignHref({
        websiteId: row.websiteId,
        parentCompanyId: row.website.parentCompanyId,
        childCompanyId: row.website.childCompanyId,
        resellerId: row.website.resellerId,
      }),
    );
  };

  useEffect(() => {
    if (searchInput.trim().length > 0) return;
    if (!search.trim()) return;
    setSearch("");
  }, [searchInput, search]);

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
        description="Requires page:chat-qa-roster (or legacy chat access) and qa:chat:assign."
      />
    );
  }

  return (
    <ChatLivePageShell>
      <ChatLivePageHeader
        title="QA roster"
        subtitle="All QA reviewer assignments in your scope—same layout as website assignments."
        navPreset="configure"
        trailing={
          canEdit ? (
            <Box sx={websiteAssignmentHeaderActions}>
              <Button
                type="button"
                variant="primary"
                sx={gradientPrimaryButtonSx}
                startIcon={<FactCheckOutlined sx={{ fontSize: 18 }} />}
                onClick={openAssign}
              >
                Assign QA reviewers
              </Button>
            </Box>
          ) : null
        }
      />

      <DashboardCard sx={mergeSx(websiteAssignmentFilterCard, { mb: 0 })}>
        <Box sx={websiteAssignmentFilterTitleRow}>
          <Box sx={websiteAssignmentFilterIconBox}>
            <FilterList sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="mediumLarge" fontWeight={600}>
            Filters
          </Typography>
        </Box>
        <Box sx={websiteAssignmentSearchRow}>
          <Box sx={websiteAssignmentSearchFieldWrapper}>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              placeholder="Search website, company, reviewer…"
              sx={{ minWidth: "100%" }}
            />
          </Box>
          <Button
            type="button"
            variant="primary"
            disabled={searchInput.trim() === search.trim()}
            onClick={() => setSearch(searchInput.trim())}
            sx={{ minWidth: 132, whiteSpace: "nowrap", alignSelf: { xs: "stretch", sm: "center" } }}
          >
            Search
          </Button>
          <ToolbarFilterPopover
            open={filterPopoverOpen}
            onOpenChange={setFilterPopoverOpen}
            active={hasActiveFilters}
          >
            <WebsiteAssignmentScopeFilterPanel
              {...scope}
              hasActiveFilters={hasActiveFilters}
              onClearAll={() => {
                scope.clearScopeFilters();
                setSearchInput("");
                setSearch("");
              }}
              onClose={() => setFilterPopoverOpen(false)}
            />
          </ToolbarFilterPopover>
        </Box>
      </DashboardCard>

      <DashboardCard sx={websiteAssignmentTableCard}>
        <Box sx={websiteAssignmentTableToolbar}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={websiteAssignmentTableIconBox}>
              <FactCheckOutlined sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography fontWeight={700} sx={{ fontSize: 16, color: theme.app.text.primary }}>
                QA assignments
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {listQuery.isLoading
                  ? "Loading…"
                  : `${rows.length} reviewer${rows.length === 1 ? "" : "s"} in scope`}
              </Typography>
            </Box>
          </Box>
        </Box>

        <QaRosterListTable
          rows={rows}
          isLoading={listQuery.isLoading}
          isError={listQuery.isError}
          hasActiveFilters={hasActiveFilters}
          canEdit={canEdit}
          onEditRow={openEdit}
        />
      </DashboardCard>
    </ChatLivePageShell>
  );
}
