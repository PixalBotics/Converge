"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import {
  Button,
  SelectField,
  ToolbarFilterPopoverPanel,
  Typography,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { websiteAssignmentFilterGrid } from "@/app/dashboard/website-assigning/website-assigning.styles";
import type { ChatScopeFilterState } from "@/features/chat-shared/types";

export type ChatInvolvementScopeFilterPanelProps = {
  filters: ChatScopeFilterState;
  onPatch: (patch: Partial<ChatScopeFilterState>) => void;
  canFilterByResellerId: boolean;
  resellerOptions: Array<{ value: string; label: string }>;
  parentCompanyOptions: Array<{ value: string; label: string }>;
  childCompanyOptions: Array<{ value: string; label: string }>;
  websiteOptions: Array<{ value: string; label: string }>;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  onClose: () => void;
};

/** Table-only scope filters (popover). Does not affect Add modals. */
export function ChatInvolvementScopeFilterPanel({
  filters,
  onPatch,
  canFilterByResellerId,
  resellerOptions,
  parentCompanyOptions,
  childCompanyOptions,
  websiteOptions,
  hasActiveFilters,
  onClearAll,
  onClose,
}: ChatInvolvementScopeFilterPanelProps) {
  const theme = useTheme() as AppTheme;

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
      <Typography variant="medium" fontWeight={700} sx={{ mb: 0.5 }}>
        Table filters
      </Typography>
      <Typography
        variant="caption"
        sx={{ display: "block", mb: 1.5, lineHeight: 1.5, color: theme.app.dashboard.textMuted }}
      >
        Narrows the list below only. Platform sees all data in scope; reseller users see their
        reseller. Add supervisors uses a separate form.
      </Typography>
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
          disabled={!filters.parentCompanyId.trim()}
        />
      </Box>
    </ToolbarFilterPopoverPanel>
  );
}
