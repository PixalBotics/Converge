"use client";

import Box from "@mui/material/Box";
import {
  Button,
  SelectField,
  FilterPanelHeader,
  ToolbarFilterPopoverPanel,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { websiteAssignmentFilterGrid } from "@/app/dashboard/website-assigning/website-assigning.styles";
import type { WebsiteAssignmentScopeFilterState } from "../hooks/useWebsiteAssignmentScopeFilters";

export type WebsiteAssignmentScopeFilterPanelProps = WebsiteAssignmentScopeFilterState & {
  showAssignedFilter?: boolean;
  filterAssigned?: string;
  onFilterAssignedChange?: (v: string) => void;
  assignedOptions?: { value: string; label: string }[];
  showSchedulingFilter?: boolean;
  filterScheduling?: string;
  onFilterSchedulingChange?: (v: string) => void;
  schedulingOptions?: { value: string; label: string }[];
  showRosterFilter?: boolean;
  filterRoster?: string;
  onFilterRosterChange?: (v: string) => void;
  rosterOptions?: { value: string; label: string }[];
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onClose: () => void;
};

export function WebsiteAssignmentScopeFilterPanel({
  canFilterByResellerId,
  filterResellerId,
  setFilterResellerId,
  filterParentCompanyId,
  setFilterParentCompanyId,
  filterChildCompanyId,
  setFilterChildCompanyId,
  resellerFilterOptions,
  parentCompanyFilterOptions,
  childCompanyFilterOptions,
  showAssignedFilter,
  filterAssigned = "",
  onFilterAssignedChange,
  assignedOptions = [],
  showSchedulingFilter,
  filterScheduling = "",
  onFilterSchedulingChange,
  schedulingOptions = [],
  showRosterFilter,
  filterRoster = "",
  onFilterRosterChange,
  rosterOptions = [],
  hasActiveFilters,
  onClearAll,
  onClose,
}: WebsiteAssignmentScopeFilterPanelProps) {
  return (
    <ToolbarFilterPopoverPanel
      footer={
        <>
          <Button type="button" variant="secondary" disabled={!hasActiveFilters} onClick={onClearAll}>
            Clear filters
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <FilterPanelHeader
        title="Organization & status"
        description="Filters apply to the website list from the server. Use Search for names, URLs, companies, or assigned users."
      />
      <Box sx={websiteAssignmentFilterGrid}>
        {showSchedulingFilter && onFilterSchedulingChange ? (
          <SelectField
            label="Schedule status"
            value={filterScheduling}
            onChange={onFilterSchedulingChange}
            options={schedulingOptions}
            menuMaxRows={6}
          />
        ) : null}
        {showAssignedFilter && onFilterAssignedChange ? (
          <SelectField
            label="Agents assigned"
            value={filterAssigned}
            onChange={onFilterAssignedChange}
            options={assignedOptions}
            menuMaxRows={6}
          />
        ) : null}
        {showRosterFilter && onFilterRosterChange ? (
          <SelectField
            label="Roster completion"
            value={filterRoster}
            onChange={onFilterRosterChange}
            options={rosterOptions}
            menuMaxRows={6}
          />
        ) : null}
        {canFilterByResellerId ? (
          <SelectField
            label="Reseller"
            value={filterResellerId}
            onChange={setFilterResellerId}
            options={resellerFilterOptions}
            menuMaxRows={8}
          />
        ) : null}
        <SelectField
          label="Parent company"
          value={filterParentCompanyId}
          onChange={setFilterParentCompanyId}
          options={parentCompanyFilterOptions}
          menuMaxRows={8}
          disabled={canFilterByResellerId && !filterResellerId.trim()}
        />
        <SelectField
          label="Child company"
          value={filterChildCompanyId}
          onChange={setFilterChildCompanyId}
          options={childCompanyFilterOptions}
          menuMaxRows={8}
          disabled={
            (canFilterByResellerId && !filterResellerId.trim()) || !filterParentCompanyId.trim()
          }
        />
      </Box>
    </ToolbarFilterPopoverPanel>
  );
}
