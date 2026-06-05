"use client";

import Box from "@mui/material/Box";
import {
  Button,
  FilterPanelHeader,
  SelectField,
  ToolbarFilterPopoverPanel,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { websiteAssignmentFilterGrid } from "@/app/dashboard/website-assigning/website-assigning.styles";
import type { ChatScopeFilterState } from "../types";

export type ChatScopeFilterPopoverPanelProps = {
  filters: ChatScopeFilterState;
  onPatch: (patch: Partial<ChatScopeFilterState>) => void;
  onReset: () => void;
  canFilterByResellerId: boolean;
  resellerOptions: Array<{ value: string; label: string }>;
  parentCompanyOptions: Array<{ value: string; label: string }>;
  childCompanyOptions: Array<{ value: string; label: string }>;
  websiteOptions: Array<{ value: string; label: string }>;
  showDepartment?: boolean;
  showPool?: boolean;
  showStatus?: boolean;
  showDateRange?: boolean;
  departmentOptions?: Array<{ value: string; label: string }>;
  poolOptions?: Array<{ value: string; label: string }>;
  statusOptions?: Array<{ value: string; label: string }>;
  hasActiveFilters: boolean;
  onClose: () => void;
  title?: string;
  hint?: string;
};

/** Scope filters inside {@link ToolbarFilterPopover} — aligned grid + pinned Done row. */
export function ChatScopeFilterPopoverPanel({
  filters,
  onPatch,
  onReset,
  canFilterByResellerId,
  resellerOptions,
  parentCompanyOptions,
  childCompanyOptions,
  websiteOptions,
  showDepartment = false,
  showPool = false,
  showStatus = false,
  showDateRange = false,
  departmentOptions = [{ value: "", label: "All departments" }],
  poolOptions = [{ value: "", label: "All pools" }],
  statusOptions = [{ value: "", label: "All statuses" }],
  hasActiveFilters,
  onClose,
  title = "Scope filters",
  hint,
}: ChatScopeFilterPopoverPanelProps) {
  return (
    <ToolbarFilterPopoverPanel
      footer={
        <>
          <Button type="button" variant="secondary" disabled={!hasActiveFilters} onClick={onReset}>
            Reset
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <FilterPanelHeader title={title} description={hint} />
      <Box sx={websiteAssignmentFilterGrid}>
        {canFilterByResellerId ? (
          <SelectField
            label="Reseller"
            value={filters.resellerId}
            onChange={(v) => onPatch({ resellerId: v })}
            options={resellerOptions}
            menuMaxRows={8}
          />
        ) : null}
        <SelectField
          label="Parent company"
          value={filters.parentCompanyId}
          onChange={(v) => onPatch({ parentCompanyId: v })}
          options={parentCompanyOptions}
          menuMaxRows={8}
          disabled={canFilterByResellerId && !filters.resellerId.trim()}
        />
        <SelectField
          label="Child company"
          value={filters.childCompanyId}
          onChange={(v) => onPatch({ childCompanyId: v })}
          options={childCompanyOptions}
          menuMaxRows={8}
          disabled={!filters.parentCompanyId.trim()}
        />
        <SelectField
          label="Website"
          value={filters.websiteId}
          onChange={(v) => onPatch({ websiteId: v })}
          options={websiteOptions}
          menuMaxRows={8}
          searchPlaceholder="Search website…"
        />
        {showDepartment ? (
          <SelectField
            label="Department"
            value={filters.departmentId}
            onChange={(v) => onPatch({ departmentId: v })}
            options={departmentOptions}
            menuMaxRows={6}
          />
        ) : null}
        {showPool ? (
          <SelectField
            label="Pool"
            value={filters.poolId}
            onChange={(v) => onPatch({ poolId: v })}
            options={poolOptions}
            menuMaxRows={6}
          />
        ) : null}
        {showStatus ? (
          <SelectField
            label="Status"
            value={filters.status}
            onChange={(v) => onPatch({ status: v })}
            options={statusOptions}
            menuMaxRows={6}
          />
        ) : null}
      </Box>
    </ToolbarFilterPopoverPanel>
  );
}
