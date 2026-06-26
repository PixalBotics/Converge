"use client";

import Box from "@mui/material/Box";
import {
  Button,
  Calendar,
  FilterPanelHeader,
  SelectField,
  ToolbarFilterPopoverPanel,
  Typography,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { websiteAssignmentFilterGrid } from "@/app/dashboard/website-assigning/website-assigning.styles";
import type { ChatScopeFilterState } from "@/features/chat-shared";
import { LEAD_TYPE_OPTIONS } from "../reports.constants";
import type { ReportPeriodState } from "../utils/report-params";

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2000, i, 1).toLocaleString("en-US", { month: "long" }),
}));

function yearOptions(): { value: string; label: string }[] {
  const current = new Date().getUTCFullYear();
  return Array.from({ length: 6 }, (_, i) => {
    const y = current - i;
    return { value: String(y), label: String(y) };
  });
}

export type ReportFiltersPanelProps = {
  scope: ChatScopeFilterState;
  onScopePatch: (patch: Partial<ChatScopeFilterState>) => void;
  canFilterByResellerId: boolean;
  resellerOptions: Array<{ value: string; label: string }>;
  parentCompanyOptions: Array<{ value: string; label: string }>;
  childCompanyOptions: Array<{ value: string; label: string }>;
  websiteOptions: Array<{ value: string; label: string }>;
  period: ReportPeriodState;
  onPeriodChange: (patch: Partial<ReportPeriodState>) => void;
  showPeriod: boolean;
  showLeadType: boolean;
  leadType: string;
  onLeadTypeChange: (v: string) => void;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onClose: () => void;
};

export function ReportFiltersPanel({
  scope,
  onScopePatch,
  canFilterByResellerId,
  resellerOptions,
  parentCompanyOptions,
  childCompanyOptions,
  websiteOptions,
  period,
  onPeriodChange,
  showPeriod,
  showLeadType,
  leadType,
  onLeadTypeChange,
  hasActiveFilters,
  onClearAll,
  onClose,
}: ReportFiltersPanelProps) {
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
        title="Report filters"
        description="Select organization scope and period. Backend applies the narrowest scope when multiple IDs are sent."
      />
      <Box sx={websiteAssignmentFilterGrid}>
        {canFilterByResellerId ? (
          <SelectField
            label="Client of (reseller)"
            value={scope.resellerId}
            onChange={(v) => onScopePatch({ resellerId: v })}
            options={resellerOptions}
          />
        ) : null}
        <SelectField
          label="Parent company"
          value={scope.parentCompanyId}
          onChange={(v) => onScopePatch({ parentCompanyId: v })}
          options={parentCompanyOptions}
        />
        <SelectField
          label="Child company"
          value={scope.childCompanyId}
          onChange={(v) => onScopePatch({ childCompanyId: v })}
          options={childCompanyOptions}
        />
        <SelectField
          label="Website"
          value={scope.websiteId}
          onChange={(v) => onScopePatch({ websiteId: v })}
          options={websiteOptions}
        />
        {showPeriod ? (
          <>
            <SelectField
              label="Period mode"
              value={period.mode}
              onChange={(v) => onPeriodChange({ mode: v as ReportPeriodState["mode"] })}
              options={[
                { value: "month", label: "Calendar month" },
                { value: "range", label: "Custom date range" },
              ]}
            />
            {period.mode === "month" ? (
              <>
                <SelectField
                  label="Year"
                  value={String(period.year)}
                  onChange={(v) => onPeriodChange({ year: Number(v) || period.year })}
                  options={yearOptions()}
                />
                <SelectField
                  label="Month"
                  value={String(period.month)}
                  onChange={(v) => onPeriodChange({ month: Number(v) || period.month })}
                  options={MONTH_OPTIONS}
                />
              </>
            ) : (
              <>
                <Calendar
                  label="From"
                  value={scope.dateFrom}
                  onChange={(v) => onScopePatch({ dateFrom: v })}
                />
                <Calendar
                  label="To"
                  value={scope.dateTo}
                  onChange={(v) => onScopePatch({ dateTo: v })}
                />
              </>
            )}
          </>
        ) : null}
        {showLeadType ? (
          <SelectField
            label="Lead type"
            value={leadType}
            onChange={onLeadTypeChange}
            options={[...LEAD_TYPE_OPTIONS]}
          />
        ) : null}
      </Box>
      {!showPeriod && (
        <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: 0.7 }}>
          This report reflects the current configuration snapshot (no date filter).
        </Typography>
      )}
    </ToolbarFilterPopoverPanel>
  );
}
