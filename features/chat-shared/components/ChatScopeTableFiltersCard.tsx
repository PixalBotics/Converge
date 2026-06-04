"use client";

import type { ReactNode, KeyboardEvent } from "react";
import { useEffect, useState } from "react";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FilterList from "@mui/icons-material/FilterList";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { DashboardCard, ToolbarFilterPopover, Typography } from "@/components/common";
import {
  websiteAssignmentFilterCard,
  websiteAssignmentFilterIconBox,
  websiteAssignmentFilterTitleRow,
} from "@/app/dashboard/website-assigning/website-assigning.styles";
import { mergeSx } from "@/lib/mui/merge-sx";
import type { SxProps, Theme } from "@mui/material/styles";

type ChatScopeTableFiltersCardProps = {
  hint?: string;
  hasActiveFilters: boolean;
  filterPopoverOpen: boolean;
  onFilterPopoverOpenChange: (open: boolean) => void;
  children: ReactNode;
};

/** Collapsible scope filters for chat configure tables (involvement, etc.). */
export function ChatScopeTableFiltersCard({
  hint = "Table only — does not affect Add modals",
  hasActiveFilters,
  filterPopoverOpen,
  onFilterPopoverOpenChange,
  children,
}: ChatScopeTableFiltersCardProps) {
  const theme = useTheme() as AppTheme;
  const [expanded, setExpanded] = useState(hasActiveFilters);

  useEffect(() => {
    if (hasActiveFilters) setExpanded(true);
  }, [hasActiveFilters]);

  return (
    <DashboardCard sx={mergeSx(websiteAssignmentFilterCard, { py: expanded ? undefined : 1.25 })}>
      <Box
        sx={
          mergeSx(websiteAssignmentFilterTitleRow, {
            cursor: "pointer",
            userSelect: "none",
            mb: expanded ? 0 : 0,
          }) as SxProps<Theme>
        }
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
      >
        <Box sx={websiteAssignmentFilterIconBox}>
          <FilterList sx={{ fontSize: 20 }} />
        </Box>
        <Typography variant="mediumLarge" fontWeight={600}>
          Filters
        </Typography>
        {hasActiveFilters ? (
          <Chip
            label="Active"
            size="small"
            sx={{
              height: 22,
              fontSize: 11,
              fontWeight: 600,
              bgcolor: alpha(theme.app.dashboard.accentBlue, 0.14),
              color: theme.app.dashboard.accentBlue,
              border: `1px solid ${alpha(theme.app.dashboard.accentBlue, 0.35)}`,
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : null}
        <Typography
          variant="caption"
          sx={{ color: theme.app.dashboard.textMuted, ml: "auto", display: { xs: "none", md: "block" } }}
        >
          {hint}
        </Typography>
        <IconButton
          size="small"
          aria-label={expanded ? "Collapse filters" : "Expand filters"}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          sx={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          <ExpandMore fontSize="small" />
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 1.25 }}>
          <Typography
            variant="caption"
            sx={{ color: theme.app.dashboard.textMuted, display: { xs: "block", md: "none" } }}
          >
            {hint}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "stretch", sm: "flex-end" },
            }}
          >
            <ToolbarFilterPopover
              open={filterPopoverOpen}
              onOpenChange={onFilterPopoverOpenChange}
              active={hasActiveFilters}
            >
              {children}
            </ToolbarFilterPopover>
          </Box>
        </Box>
      </Collapse>
    </DashboardCard>
  );
}
