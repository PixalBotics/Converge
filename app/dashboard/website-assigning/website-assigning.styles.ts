import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { cardPadding, pageWrapper } from "../dashboard.styles";

export const websiteAssignmentPageWrapper: SxProps<Theme> = {
  ...pageWrapper,
  width: "100%",
};

export const websiteAssignmentPageHeader: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", lg: "row" },
  alignItems: { xs: "stretch", lg: "flex-start" },
  justifyContent: "space-between",
  gap: 2,
  mb: 2.5,
};

export const websiteAssignmentHeaderActions: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  gap: 1.5,
  justifyContent: { xs: "flex-start", lg: "flex-end" },
};

export const websiteAssignmentFilterCard: SxProps<Theme> = {
  ...cardPadding,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  mb: 2.5,
};

export const websiteAssignmentFilterTitleRow: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
};

export const websiteAssignmentFilterIconBox: SxProps<Theme> = (theme) => ({
  width: 36,
  height: 36,
  borderRadius: "50%",
  bgcolor: (theme as AppTheme).app.dashboard.overlayMedium,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: (theme as AppTheme).app.dashboard.iconMuted,
});

/** Website select + Apply Filter (end-aligned on large screens). */
export const websiteAssignmentFilterGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "1fr",
    lg: "minmax(0, 1fr) auto",
  },
  gap: 2,
  alignItems: "end",
};

export const websiteAssignmentTableCard: SxProps<Theme> = {
  ...cardPadding,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const websiteAssignmentTableToolbar: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  alignItems: { xs: "stretch", md: "center" },
  justifyContent: "space-between",
  gap: 2,
};

export const websiteAssignmentSearchRow: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "stretch", sm: "center" },
  gap: 1.5,
  width: { xs: "100%", md: "auto" },
};

export const websiteAssignmentSearchFieldWrapper: SxProps<Theme> = {
  flex: 1,
  minWidth: { xs: "100%", sm: 220 },
};

export const websiteAssignmentTableIconBox: SxProps<Theme> = {
  width: 40,
  height: 40,
  borderRadius: "12px",
  background: "radial-gradient(100% 100% at 50% 0%, #A855F7 0%, #312E81 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 10px 30px rgba(15,23,42,0.85)",
};

export const websiteAssignmentFooterRow: SxProps<Theme> = (theme) => ({
  mt: 1,
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "flex-start", sm: "center" },
  justifyContent: "space-between",
  gap: 1.5,
  color: (theme as AppTheme).app.dashboard.textMuted,
  fontSize: 13,
});

export const websiteAssignmentPaginationWrapper: SxProps<Theme> = {
  width: { xs: "100%", sm: "auto" },
  display: "flex",
  justifyContent: "flex-end",
  alignSelf: { xs: "stretch", sm: "auto" },
};

/** Purple gradient tile with “$” — matches Account Setup / design reference. */
export const websiteAssignmentSectionIconSx: SxProps<Theme> = (theme) => {
  const d = (theme as AppTheme).app.dashboard;
  return {
    width: 44,
    height: 44,
    borderRadius: "12px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: d.gradientIcon,
    color: d.white95,
    fontWeight: 700,
    fontSize: "1.25rem",
    fontFamily: theme.typography.fontFamily,
    boxShadow: `0 8px 24px ${alpha(d.accentPurple, 0.45)}`,
  };
};

export const websiteAssignmentUserDetailCard: SxProps<Theme> = {
  ...cardPadding,
  display: "flex",
  flexDirection: "column",
  gap: 2,
  mb: 2.5,
};

/** Username / Email / Department — one row on large screens. */
export const websiteAssignmentUserDetailGrid: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
  gap: { xs: 2, sm: 2.5 },
  alignItems: "start",
};

export function websiteAssignmentRankPillSx(
  theme: Theme,
  variant: "Primary" | "Secondary" | "Backup"
): SxProps<Theme> {
  const t = theme as AppTheme;
  const primary = theme.palette.primary.main;
  if (variant === "Primary") {
    return {
      display: "inline-flex",
      alignItems: "center",
      px: 1.25,
      py: 0.4,
      borderRadius: "9999px",
      fontSize: 13,
      fontWeight: 600,
      bgcolor: alpha(primary, 0.14),
      color: primary,
      border: `1px solid ${alpha(primary, 0.35)}`,
    };
  }
  if (variant === "Secondary") {
    const c = t.app.dashboard.iconMuted;
    return {
      display: "inline-flex",
      alignItems: "center",
      px: 1.25,
      py: 0.4,
      borderRadius: "9999px",
      fontSize: 13,
      fontWeight: 600,
      bgcolor: alpha(c, 0.12),
      color: t.app.text.secondary,
      border: `1px solid ${alpha(c, 0.28)}`,
    };
  }
  const w = theme.palette.warning.main;
  return {
    display: "inline-flex",
    alignItems: "center",
    px: 1.25,
    py: 0.4,
    borderRadius: "9999px",
    fontSize: 13,
    fontWeight: 600,
    bgcolor: alpha(w, 0.12),
    color: w,
    border: `1px solid ${alpha(w, 0.35)}`,
  };
}

/** Used by `SystemAdminOverview` — kept for backward compatibility after website-assigning page refactor. */
export const departmentsAddButton: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    borderRadius: "9999px",
    px: 3,
    py: 1.25,
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    width: { xs: "100%", sm: "auto" },
    justifyContent: "center",
    background: app.dashboard.gradientButton,
    color: app.dashboard.gradientButtonText,
    boxShadow: "0 10px 25px rgba(0,0,0,0.28)",
    border: `1px solid ${app.dashboard.overlayBorder}`,
    "&:hover": {
      background: app.dashboard.gradientButton,
      color: app.dashboard.gradientButtonText,
    },
  };
};

export const departmentsCard: SxProps<Theme> = {
  p: { xs: 1.5, sm: 2, md: 2.5 },
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const departmentsCardHeader: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", md: "row" },
  alignItems: { xs: "flex-start", md: "center" },
  justifyContent: "space-between",
  gap: 1.5,
};

export const departmentsSearchRow: SxProps<Theme> = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 1,
  width: { xs: "100%", md: "auto" },
};

export const departmentsSearchFieldWrapper: SxProps<Theme> = {
  flex: 1,
};

export const departmentsFooterRow = websiteAssignmentFooterRow;
export const departmentsPaginationWrapper = websiteAssignmentPaginationWrapper;
