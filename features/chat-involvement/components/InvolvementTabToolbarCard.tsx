"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import Add from "@mui/icons-material/Add";
import {
  Button,
  DashboardCard,
  DashboardFilterSection,
  SearchBar,
  Typography,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  websiteAssignmentSearchFieldWrapper,
  websiteAssignmentSearchRow,
} from "@/app/dashboard/website-assigning/website-assigning.styles";

type InvolvementTabToolbarCardProps = {
  icon: ReactNode;
  iconColor: string;
  title: string;
  description: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  addLabel?: string;
  onAdd?: () => void;
  canAdd?: boolean;
};

/** Matches canned messages / website-assigning toolbar layout. */
export function InvolvementTabToolbarCard({
  icon,
  iconColor,
  title,
  description,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  addLabel,
  onAdd,
  canAdd = false,
}: InvolvementTabToolbarCardProps) {
  const theme = useTheme() as AppTheme;

  return (
    <DashboardCard sx={{ p: { xs: 2, md: 2.5 } }}>
      <DashboardFilterSection
        titleSlot={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box sx={{ color: iconColor, display: "flex" }}>{icon}</Box>
            <Box>
              <Typography fontWeight={700} sx={{ fontSize: 16, color: theme.app.text.primary }}>
                {title}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {description}
              </Typography>
            </Box>
          </Box>
        }
        actionSlot={
          canAdd && addLabel && onAdd ? (
            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              startIcon={<Add />}
              onClick={onAdd}
            >
              {addLabel}
            </Button>
          ) : null
        }
      />
      <Box sx={{ ...websiteAssignmentSearchRow, mt: 2 }}>
        <Box sx={websiteAssignmentSearchFieldWrapper}>
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            sx={{ minWidth: "100%", width: "100%" }}
          />
        </Box>
      </Box>
    </DashboardCard>
  );
}
