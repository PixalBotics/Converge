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

export const CRM_PLATFORM_FILTER_OPTIONS = [
  { value: "", label: "All CRMs" },
  { value: "hubspot", label: "HubSpot" },
  { value: "salesforce", label: "Salesforce" },
  { value: "zoho", label: "Zoho CRM" },
] as const;

export type CrmIntegrationListFilterPanelProps = WebsiteAssignmentScopeFilterState & {
  filterPlatform: string;
  onFilterPlatformChange: (v: string) => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onClose: () => void;
};

export function CrmIntegrationListFilterPanel({
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
  filterPlatform,
  onFilterPlatformChange,
  hasActiveFilters,
  onClearAll,
  onClose,
}: CrmIntegrationListFilterPanelProps) {
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
        title="CRM filters"
        description="Filter configured integrations by organization scope or CRM platform."
      />
      <Box sx={websiteAssignmentFilterGrid}>
        {canFilterByResellerId ? (
          <SelectField
            label="Client of (reseller)"
            value={filterResellerId}
            onChange={(e) => setFilterResellerId(e.target.value)}
            options={resellerFilterOptions}
          />
        ) : null}
        <SelectField
          label="Parent company"
          value={filterParentCompanyId}
          onChange={(e) => setFilterParentCompanyId(e.target.value)}
          options={parentCompanyFilterOptions}
        />
        <SelectField
          label="Child company"
          value={filterChildCompanyId}
          onChange={(e) => setFilterChildCompanyId(e.target.value)}
          options={childCompanyFilterOptions}
        />
        <SelectField
          label="CRM platform"
          value={filterPlatform}
          onChange={(e) => onFilterPlatformChange(e.target.value)}
          options={[...CRM_PLATFORM_FILTER_OPTIONS]}
        />
      </Box>
    </ToolbarFilterPopoverPanel>
  );
}
