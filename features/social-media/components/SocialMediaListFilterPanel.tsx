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

export const SOCIAL_PLATFORM_FILTER_OPTIONS = [
  { value: "", label: "All platforms" },
  { value: "facebook_messenger", label: "Facebook Messenger" },
  { value: "instagram_dm", label: "Instagram DM" },
  { value: "whatsapp", label: "WhatsApp" },
] as const;

export type SocialMediaListFilterPanelProps = WebsiteAssignmentScopeFilterState & {
  filterPlatform: string;
  onFilterPlatformChange: (v: string) => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onClose: () => void;
};

export function SocialMediaListFilterPanel({
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
}: SocialMediaListFilterPanelProps) {
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
        title="Social media filters"
        description="Filter connected accounts by organization scope or platform."
      />
      <Box sx={websiteAssignmentFilterGrid}>
        {canFilterByResellerId ? (
          <SelectField
            label="Client of (reseller)"
            value={filterResellerId}
            onChange={setFilterResellerId}
            options={resellerFilterOptions}
          />
        ) : null}
        <SelectField
          label="Parent company"
          value={filterParentCompanyId}
          onChange={setFilterParentCompanyId}
          options={parentCompanyFilterOptions}
        />
        <SelectField
          label="Child company"
          value={filterChildCompanyId}
          onChange={setFilterChildCompanyId}
          options={childCompanyFilterOptions}
        />
        <SelectField
          label="Platform"
          value={filterPlatform}
          onChange={onFilterPlatformChange}
          options={[...SOCIAL_PLATFORM_FILTER_OPTIONS]}
        />
      </Box>
    </ToolbarFilterPopoverPanel>
  );
}
