"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import Add from "@mui/icons-material/Add";
import {
  Button,
  DashboardCard,
  SearchBar,
  Typography,
} from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { mergeSx } from "@/lib/mui/merge-sx";
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
  searchLabel?: string;
  addLabel?: string;
  onAdd?: () => void;
  canAdd?: boolean;
  /** Table or other content rendered inside the same card (below search). */
  children?: ReactNode;
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
  searchLabel,
  addLabel,
  onAdd,
  canAdd = false,
  children,
}: InvolvementTabToolbarCardProps) {
  const theme = useTheme() as AppTheme;

  return (
    <DashboardCard
      sx={{
        flex: children ? 1 : undefined,
        display: children ? "flex" : undefined,
        flexDirection: children ? "column" : undefined,
        minHeight: children ? 0 : undefined,
        overflow: children ? "hidden" : undefined,
        p: { xs: children ? 1.5 : 2, md: children ? 2 : 2.5 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
          <Box sx={{ color: iconColor, display: "flex", fontSize: 22 }}>{icon}</Box>
          <Box>
            <Typography
              variant="mediumLarge"
              color="white"
              fontWeight={600}
              sx={{ fontSize: 22, lineHeight: "22px" }}
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: theme.app.dashboard.textMuted, fontSize: 14, lineHeight: "20px" }}
            >
              {description}
            </Typography>
          </Box>
        </Box>
        {canAdd && addLabel && onAdd ? (
          <Button
            type="button"
            variant="primary"
            sx={mergeSx(gradientPrimaryButtonSx, { flexShrink: 0 })}
            startIcon={<Add />}
            onClick={onAdd}
          >
            {addLabel}
          </Button>
        ) : null}
      </Box>
      <Box
        sx={{
          ...websiteAssignmentSearchRow,
          mt: 2,
          pt: 0.5,
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {searchLabel ? (
          <Typography
            component="label"
            variant="caption"
            fontWeight={600}
            sx={{ color: theme.app.dashboard.textMuted, mb: 0.5, display: "block" }}
          >
            {searchLabel}
          </Typography>
        ) : null}
        <Box sx={websiteAssignmentSearchFieldWrapper}>
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            sx={{ minWidth: "100%", width: "100%" }}
          />
        </Box>
      </Box>
      {children ? (
        <Box sx={{ flex: 1, minHeight: 0, mt: 2 }}>{children}</Box>
      ) : null}
    </DashboardCard>
  );
}
