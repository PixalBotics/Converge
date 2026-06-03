"use client";

import { useState } from "react";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FilterList from "@mui/icons-material/FilterList";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, SelectField, Typography } from "@/components/common";
import { aiTrainingFilterGridSx } from "./ai-training-ui.styles";
import type { useAiTrainingHierarchy } from "./use-ai-training-hierarchy";

export function AiTrainingFiltersPanel({
  hierarchy,
  filtersActive,
  onApply,
  onClear,
  showAllWebsites,
  onShowAllWebsitesChange,
}: {
  hierarchy: ReturnType<typeof useAiTrainingHierarchy>;
  filtersActive: boolean;
  onApply: () => void;
  onClear: () => void;
  showAllWebsites: boolean;
  onShowAllWebsitesChange: (v: boolean) => void;
}) {
  const theme = useTheme() as AppTheme;
  const [open, setOpen] = useState(false);

  const hasDraft =
    Boolean(hierarchy.resellerId.trim()) ||
    Boolean(hierarchy.parentCompanyId.trim()) ||
    Boolean(hierarchy.childCompanyId.trim());

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
        bgcolor: "rgba(255,255,255,0.02)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box
          role="button"
          tabIndex={0}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen((v) => !v);
            }
          }}
          sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
        >
          <FilterList sx={{ color: theme.app.dashboard.accentBlue }} />
          <Typography variant="body2" fontWeight={700} color="white">
            Filter websites {filtersActive ? "(active)" : "(optional)"}
          </Typography>
          <ExpandMore
            sx={{
              transform: open ? "rotate(180deg)" : "none",
              transition: "0.2s",
              color: theme.app.dashboard.textMuted,
            }}
          />
        </Box>
        {filtersActive ? (
          <Button type="button" variant="secondary" size="small" onClick={onClear}>
            Clear filters — show all
          </Button>
        ) : null}
      </Box>

      <Collapse in={open}>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 1.5, mb: 1.5 }}>
          The table lists all trained websites in your scope by default. Use the filters below to narrow by reseller or company.
        </Typography>
        <Box sx={aiTrainingFilterGridSx}>
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
          <Box sx={{ mt: 1.5 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={showAllWebsites}
                onChange={(e) => onShowAllWebsitesChange(e.target.checked)}
              />
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                Include websites without training (this child only)
              </Typography>
            </label>
          </Box>
        ) : null}
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <Button type="button" variant="primary" size="small" onClick={onApply} disabled={!hasDraft}>
            Apply filter
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
}
