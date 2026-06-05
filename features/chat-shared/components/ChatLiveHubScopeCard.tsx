"use client";

import { useMemo, useState } from "react";
import FilterList from "@mui/icons-material/FilterList";
import Box from "@mui/material/Box";
import {
  DashboardCard,
  SearchBar,
  ToolbarFilterPopover,
  Typography,
  filterPanelDescriptionSx,
} from "@/components/common";
import {
  websiteAssignmentFilterCard,
  websiteAssignmentFilterIconBox,
  websiteAssignmentFilterTitleRow,
  websiteAssignmentSearchFieldWrapper,
  websiteAssignmentSearchRow,
} from "@/app/dashboard/website-assigning/website-assigning.styles";
import { ChatScopeFilterPopoverPanel } from "./ChatScopeFilterPopoverPanel";
import { hasActiveChatScopeFilters } from "../utils/chat-scope-filters-active";
import type { ChatScopeFilterState } from "../types";

type ChatLiveHubScopeCardProps = {
  filters: ChatScopeFilterState;
  onPatch: (patch: Partial<ChatScopeFilterState>) => void;
  onReset: () => void;
  canFilterByResellerId: boolean;
  resellerOptions: { value: string; label: string }[];
  parentCompanyOptions: { value: string; label: string }[];
  childCompanyOptions: { value: string; label: string }[];
  websiteOptions: { value: string; label: string }[];
  showDepartmentPool?: boolean;
  departmentOptions?: { value: string; label: string }[];
  poolOptions?: { value: string; label: string }[];
  statusOptions?: { value: string; label: string }[];
  agentSearch: string;
  onAgentSearchChange: (v: string) => void;
};

export function ChatLiveHubScopeCard({
  filters,
  onPatch,
  onReset,
  canFilterByResellerId,
  resellerOptions,
  parentCompanyOptions,
  childCompanyOptions,
  websiteOptions,
  showDepartmentPool = true,
  departmentOptions = [],
  poolOptions = [],
  statusOptions = [],
  agentSearch,
  onAgentSearchChange,
}: ChatLiveHubScopeCardProps) {
  const [filterOpen, setFilterOpen] = useState(false);

  const hasActive = useMemo(
    () => hasActiveChatScopeFilters(filters) || Boolean(agentSearch.trim()),
    [agentSearch, filters],
  );

  return (
    <DashboardCard
      sx={[
        websiteAssignmentFilterCard,
        { mt: { xs: 1.25, md: 1.75 }, flexShrink: 0 },
      ]}
    >
      <Box sx={websiteAssignmentFilterTitleRow}>
        <Box sx={websiteAssignmentFilterIconBox}>
          <FilterList sx={{ fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="mediumLarge" fontWeight={600}>
            Scope
          </Typography>
          <Typography variant="medium" sx={filterPanelDescriptionSx}>
            Select a website to list assigned agents, then open their chats.
          </Typography>
        </Box>
      </Box>
      <Box sx={websiteAssignmentSearchRow}>
        <Box sx={websiteAssignmentSearchFieldWrapper}>
          <SearchBar
            value={agentSearch}
            onChange={onAgentSearchChange}
            placeholder="Search agent name or email…"
            sx={{ minWidth: "100%" }}
          />
        </Box>
        <ToolbarFilterPopover open={filterOpen} onOpenChange={setFilterOpen} active={hasActive}>
          <ChatScopeFilterPopoverPanel
            filters={filters}
            onPatch={onPatch}
            onReset={onReset}
            canFilterByResellerId={canFilterByResellerId}
            resellerOptions={resellerOptions}
            parentCompanyOptions={parentCompanyOptions}
            childCompanyOptions={childCompanyOptions}
            websiteOptions={websiteOptions}
            showDepartment={showDepartmentPool}
            showPool={showDepartmentPool}
            showStatus={statusOptions.length > 1}
            departmentOptions={departmentOptions}
            poolOptions={poolOptions}
            statusOptions={statusOptions}
            hasActiveFilters={hasActive}
            onClose={() => setFilterOpen(false)}
            title="Scope filters"
            hint="Reseller → company → website. Department and pool narrow the agent table and chat queue."
          />
        </ToolbarFilterPopover>
      </Box>
    </DashboardCard>
  );
}
