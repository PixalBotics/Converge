"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Button, FilterPanelHeader, SelectField, ToolbarFilterPopoverPanel } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { aiTrainingFilterPopoverGridSx } from "./ai-training-ui.styles";
import type { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";

export function AiTrainingScopeFilterPanel({
  hierarchy,
  showAllWebsites,
  onShowAllWebsitesChange,
  hasActiveFilters,
  onApply,
  onClear,
  onClose,
}: {
  hierarchy: ReturnType<typeof useAiTrainingHierarchy>;
  showAllWebsites: boolean;
  onShowAllWebsitesChange: (v: boolean) => void;
  hasActiveFilters: boolean;
  onApply: () => void;
  onClear: () => void;
  onClose: () => void;
}) {
  const hasDraft =
    Boolean(hierarchy.resellerId.trim()) ||
    Boolean(hierarchy.parentCompanyId.trim()) ||
    Boolean(hierarchy.childCompanyId.trim());

  return (
    <ToolbarFilterPopoverPanel
      footer={
        <>
          <Button type="button" variant="secondary" disabled={!hasActiveFilters} onClick={onClear}>
            Clear filters
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={!hasDraft}
            onClick={() => {
              onApply();
              onClose();
            }}
          >
            Apply
          </Button>
        </>
      }
    >
      <FilterPanelHeader
        title="Filter websites"
        description="Narrows the table only. Add-training pages use their own website picker."
      />
      <Box sx={aiTrainingFilterPopoverGridSx}>
        <SelectField
          label="Reseller"
          placeholder="All resellers"
          value={hierarchy.resellerId}
          onChange={hierarchy.onResellerChange}
          options={hierarchy.resellerSelectOptions}
          disabled={
            hierarchy.resellersQuery.isLoading ||
            Boolean(hierarchy.sessionResellerId && !hierarchy.mayPickResellerFilter)
          }
          menuMaxRows={8}
        />
        <SelectField
          label="Parent company"
          placeholder="All parents"
          value={hierarchy.parentCompanyId}
          onChange={hierarchy.onParentChange}
          options={hierarchy.parentCompanyOptions}
          disabled={!hierarchy.hierarchyResellerKey || hierarchy.companiesByResellerQuery.isLoading}
          menuMaxRows={8}
        />
        <SelectField
          label="Child company"
          placeholder="All children"
          value={hierarchy.childCompanyId}
          onChange={hierarchy.onChildChange}
          options={hierarchy.childCompanyOptions}
          disabled={!hierarchy.parentCompanyId.trim()}
          menuMaxRows={8}
        />
      </Box>
      {hierarchy.childCompanyId.trim() ? (
        <FormControlLabel
          sx={{ alignItems: "flex-start", mx: 0, mt: 0.5 }}
          control={
            <Checkbox
              checked={showAllWebsites}
              onChange={(e) => onShowAllWebsitesChange(e.target.checked)}
              size="small"
              sx={{ color: theme.app.dashboard.textMuted, pt: 0.25 }}
            />
          }
          label={
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
              Include websites without training (this child only)
            </Typography>
          }
        />
      ) : null}
    </ToolbarFilterPopoverPanel>
  );
}
