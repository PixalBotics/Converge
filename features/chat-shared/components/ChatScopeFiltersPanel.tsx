"use client";

import Box from "@mui/material/Box";
import { Button, Calendar, SelectField, Typography } from "@/components/common";
import type { AppTheme } from "@/theme/theme";
import type { ChatScopeFilterState } from "../types";
import { websiteAssignmentFilterGrid } from "@/app/dashboard/website-assigning/website-assigning.styles";

interface ChatScopeFiltersPanelProps {
  filters: ChatScopeFilterState;
  onPatch: (patch: Partial<ChatScopeFilterState>) => void;
  onReset: () => void;
  canFilterByResellerId: boolean;
  resellerOptions: Array<{ value: string; label: string }>;
  parentCompanyOptions: Array<{ value: string; label: string }>;
  childCompanyOptions: Array<{ value: string; label: string }>;
  websiteOptions: Array<{ value: string; label: string }>;
  showDateRange?: boolean;
  showDepartment?: boolean;
  showPool?: boolean;
  showStatus?: boolean;
  departmentOptions?: Array<{ value: string; label: string }>;
  poolOptions?: Array<{ value: string; label: string }>;
  statusOptions?: Array<{ value: string; label: string }>;
  hint?: string;
  /** Slim toolbar layout for settings pages (no caption hint). */
  compact?: boolean;
}

export function ChatScopeFiltersPanel({
  filters,
  onPatch,
  onReset,
  canFilterByResellerId,
  resellerOptions,
  parentCompanyOptions,
  childCompanyOptions,
  websiteOptions,
  showDateRange = false,
  showDepartment = false,
  showPool = false,
  showStatus = false,
  departmentOptions = [{ value: "", label: "All departments" }],
  poolOptions = [{ value: "", label: "All pools" }],
  statusOptions = [{ value: "", label: "All statuses" }],
  hint,
  compact = false,
}: ChatScopeFiltersPanelProps) {
  return (
    <Box>
      {hint && !compact ? (
        <Typography
          variant="caption"
          sx={(theme) => ({
            color: (theme as AppTheme).app.dashboard.textMuted,
            display: "block",
            mb: 1,
          })}
        >
          {hint}
        </Typography>
      ) : null}
      <Box
        sx={{
          ...websiteAssignmentFilterGrid,
          ...(compact
            ? {
                gap: 1.25,
                "& .MuiFormControl-root": { minWidth: 0 },
              }
            : {}),
        }}
      >
        {canFilterByResellerId ? (
          <SelectField
            label="Reseller"
            value={filters.resellerId}
            onChange={(v) => onPatch({ resellerId: v })}
            options={resellerOptions}
            menuMaxRows={6}
          />
        ) : null}
        <SelectField
          label="Parent company"
          value={filters.parentCompanyId}
          onChange={(v) => onPatch({ parentCompanyId: v })}
          options={parentCompanyOptions}
          menuMaxRows={7}
          disabled={canFilterByResellerId && !filters.resellerId.trim()}
        />
        <SelectField
          label="Child company"
          value={filters.childCompanyId}
          onChange={(v) => onPatch({ childCompanyId: v })}
          options={childCompanyOptions}
          menuMaxRows={7}
          disabled={!filters.parentCompanyId.trim()}
        />
        <SelectField
          label="Website"
          value={filters.websiteId}
          onChange={(v) => onPatch({ websiteId: v })}
          options={websiteOptions}
          menuMaxRows={8}
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
        {showDateRange ? (
          <>
            <Calendar
              label="From"
              value={filters.dateFrom}
              onChange={(v) => onPatch({ dateFrom: v })}
            />
            <Calendar
              label="To"
              value={filters.dateTo}
              onChange={(v) => onPatch({ dateTo: v })}
            />
          </>
        ) : null}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: compact ? 0.75 : 1.25,
          gap: 1,
        }}
      >
        <Button type="button" variant="secondary" size="small" onClick={onReset}>
          Reset
        </Button>
      </Box>
    </Box>
  );
}
