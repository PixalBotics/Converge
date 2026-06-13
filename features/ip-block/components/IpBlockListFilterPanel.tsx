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
import type { WebsiteAssignmentScopeFilterState } from "@/features/website-assignments/hooks/useWebsiteAssignmentScopeFilters";

export const IP_BLOCK_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active blocks" },
  { value: "inactive", label: "Inactive rules" },
] as const;

export type IpBlockListFilterPanelProps = WebsiteAssignmentScopeFilterState & {
  filterStatus: string;
  onFilterStatusChange: (v: string) => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onClose: () => void;
};

export function IpBlockListFilterPanel({
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
  filterStatus,
  onFilterStatusChange,
  hasActiveFilters,
  onClearAll,
  onClose,
}: IpBlockListFilterPanelProps) {
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
        title="IP block filters"
        description="Narrow the table by organization scope or rule status. Search still matches IPs, websites, and company names."
      />
      <Box sx={websiteAssignmentFilterGrid}>
        <SelectField
          label="Status"
          value={filterStatus}
          onChange={onFilterStatusChange}
          options={[...IP_BLOCK_STATUS_FILTER_OPTIONS]}
          menuMaxRows={6}
        />
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
          disabled={!filterParentCompanyId.trim()}
        />
      </Box>
    </ToolbarFilterPopoverPanel>
  );
}
