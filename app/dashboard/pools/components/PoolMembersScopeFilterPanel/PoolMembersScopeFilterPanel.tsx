"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  Divider,
  SegmentedControl,
  SelectField,
  FilterPanelHeader,
  ToolbarFilterPopoverPanel,
  Typography,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";

const externalScopeGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
  gap: 2,
} as const;

export type PoolMembersScopeFilterPanelProps = {
  mayPickInternalDeptType: boolean;
  effectiveFilterDeptKind: "Internal" | "External";
  filterDeptKind: "Internal" | "External";
  onFilterDeptKindChange: (v: "Internal" | "External") => void;
  resellerId: string;
  onResellerIdChange: (v: string) => void;
  parentCompanyId: string;
  onParentCompanyIdChange: (v: string) => void;
  departmentId: string;
  onDepartmentIdChange: (v: string) => void;
  resellerOptions: { value: string; label: string }[];
  parentCompanyOptions: { value: string; label: string }[];
  departmentOptions: { value: string; label: string }[];
  hasMembersHubScopeFilters: boolean;
  onClearFilters: () => void;
  onClose: () => void;
};

export function PoolMembersScopeFilterPanel({
  mayPickInternalDeptType,
  effectiveFilterDeptKind,
  filterDeptKind,
  onFilterDeptKindChange,
  resellerId,
  onResellerIdChange,
  parentCompanyId,
  onParentCompanyIdChange,
  departmentId,
  onDepartmentIdChange,
  resellerOptions,
  parentCompanyOptions,
  departmentOptions,
  hasMembersHubScopeFilters,
  onClearFilters,
  onClose,
}: PoolMembersScopeFilterPanelProps) {
  const theme = useTheme() as AppTheme;

  return (
    <ToolbarFilterPopoverPanel
      footer={
        <>
          <Button type="button" variant="secondary" disabled={!hasMembersHubScopeFilters} onClick={onClearFilters}>
            Clear filters
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <FilterPanelHeader
        title="Department scope"
        description={
          mayPickInternalDeptType
            ? "Choose Internal or External. For External, pick reseller and parent company, then department."
            : "Pick reseller, then parent company, then department."
        }
      />

      {mayPickInternalDeptType ? (
        <>
          <Typography variant="caption" sx={{ display: "block", mb: 0.75, fontWeight: 600 }}>
            Department type
          </Typography>
          <SegmentedControl
            options={[
              { value: "Internal", label: "Internal" },
              { value: "External", label: "External" },
            ]}
            value={filterDeptKind}
            onChange={(v) => onFilterDeptKindChange(v as "Internal" | "External")}
            size="small"
            sx={{
              width: "100%",
              display: "flex",
              "& .MuiToggleButtonGroup-grouped": { flex: 1, minWidth: 0 },
            }}
          />
        </>
      ) : null}

      {effectiveFilterDeptKind === "External" ? (
        <>
          {mayPickInternalDeptType ? (
            <Divider sx={{ my: 2, borderBottom: `1px solid ${theme.app.dashboard.cardBorder}` }} />
          ) : null}
          {mayPickInternalDeptType ? (
            <Typography variant="caption" sx={{ display: "block", mb: 1.25, fontWeight: 600 }}>
              External scope
            </Typography>
          ) : null}
          <Box sx={externalScopeGridSx}>
            <SelectField
              label="Reseller"
              value={resellerId}
              onChange={onResellerIdChange}
              options={resellerOptions}
              menuMaxRows={8}
            />
            <SelectField
              label="Parent company"
              value={parentCompanyId}
              onChange={onParentCompanyIdChange}
              options={parentCompanyOptions}
              searchable
              searchPlaceholder="Search parent company…"
              menuMaxRows={8}
              disabled={!resellerId.trim()}
            />
          </Box>
        </>
      ) : null}

      <Box sx={{ mt: 2 }}>
        <SelectField
          label="Department"
          value={departmentId}
          onChange={onDepartmentIdChange}
          options={departmentOptions}
          searchable
          searchPlaceholder="Search department…"
          menuMaxRows={8}
          disabled={effectiveFilterDeptKind === "External" && !parentCompanyId.trim()}
        />
      </Box>
    </ToolbarFilterPopoverPanel>
  );
}
