"use client";

import Box from "@mui/material/Box";
import { SelectField } from "@/components/common";
import { websiteAssignmentFilterGrid } from "@/app/dashboard/website-assigning/website-assigning.styles";
import type { InvolvementModalScope } from "../hooks/useInvolvementModalScope";

type InvolvementOrgScopeFieldsProps = {
  scope: InvolvementModalScope;
  canEdit: boolean;
  disabled?: boolean;
};

/** Reseller → parent → child → website (modal only, not table filters). */
export function InvolvementOrgScopeFields({
  scope,
  canEdit,
  disabled = false,
}: InvolvementOrgScopeFieldsProps) {
  return (
    <Box sx={websiteAssignmentFilterGrid}>
      {scope.canFilterByResellerId ? (
        <SelectField
          label="Reseller"
          value={scope.filterResellerId}
          onChange={scope.setFilterResellerId}
          options={scope.resellerFilterOptions}
          menuMaxRows={8}
          disabled={!canEdit || disabled}
        />
      ) : null}
      <SelectField
        label="Parent company"
        value={scope.filterParentCompanyId}
        onChange={scope.setFilterParentCompanyId}
        options={scope.parentCompanyFilterOptions}
        menuMaxRows={8}
        disabled={
          !canEdit || disabled || (scope.canFilterByResellerId && !scope.filterResellerId.trim())
        }
      />
      <SelectField
        label="Child company"
        value={scope.filterChildCompanyId}
        onChange={scope.setFilterChildCompanyId}
        options={scope.childCompanyFilterOptions}
        menuMaxRows={8}
        disabled={
          !canEdit ||
          disabled ||
          (scope.canFilterByResellerId && !scope.filterResellerId.trim()) ||
          !scope.filterParentCompanyId.trim()
        }
      />
      <SelectField
        label="Website"
        value={scope.websiteId}
        onChange={scope.setWebsiteId}
        options={scope.websiteOptions}
        menuMaxRows={8}
        searchPlaceholder="Search website…"
        disabled={
          !canEdit ||
          disabled ||
          scope.websitesLoading ||
          !scope.filterParentCompanyId.trim()
        }
      />
    </Box>
  );
}
