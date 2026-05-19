import { alpha, getLuminance, lighten } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { typographyVariants } from "@/components/common/Typography/typography.styles";

export const SIDEBAR_WIDTH = 260;

/** Slightly roomier line box than `medium16`’s 100% — lines up with the 24px icon slot in the nav row. */
export const navTypographyBase = {
  ...typographyVariants.medium16,
  lineHeight: 1.4,
};

export const sectionLabelSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    pl: "16px",
    pr: "16px",
    pt: "1px",
    pb: "4px",
    ml: "8px",
    mr: "8px",
    mt: "10px",
    mb: "18px",
    boxSizing: "border-box",
    typography: typographyVariants.medium16,
    fontWeight: 700,
    letterSpacing: 1.2,
    color: app.text.primary,
  };
};

/** When accent is ~black, `alpha(primary, …)` is invisible on dark chrome — use a light veil instead. */
const PRIMARY_LUM_THRESHOLD = 0.15;

export const navItemSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  const primary = theme.palette.primary.main;
  const edge = theme.spacing(1);
  const mode = theme.palette.mode;
  const textPrimary = theme.palette.text.primary;
  const primaryTooDarkForTint = getLuminance(primary) < PRIMARY_LUM_THRESHOLD;

  const selectedBg = primaryTooDarkForTint
    ? alpha(textPrimary, mode === "dark" ? 0.14 : 0.1)
    : alpha(primary, mode === "dark" ? 0.22 : 0.14);

  const selectedBgHover = primaryTooDarkForTint
    ? alpha(textPrimary, mode === "dark" ? 0.2 : 0.14)
    : alpha(primary, mode === "dark" ? 0.28 : 0.2);

  const hoverBg = primaryTooDarkForTint
    ? alpha(textPrimary, mode === "dark" ? 0.06 : 0.05)
    : alpha(primary, 0.08);

  const defaultNavIcon =
    mode === "light"
      ? (theme.palette.text.secondary ?? alpha(textPrimary, 0.58))
      : app.dashboard.sidebarNavIconMuted;

  const selectedIcon = primaryTooDarkForTint
    ? mode === "dark"
      ? app.dashboard.iconMuted
      : (theme.palette.text.primary ?? alpha("#0f172a", 0.88))
    : mode === "dark"
      ? lighten(primary, 0.14)
      : primary;

  return {
    ml: 0,
    mr: 1.25,
    my: 2.25,
    pl: `calc(${edge} + ${theme.spacing(2)})`,
    pr: 3,
    py: 1.5,
    borderRadius: "10px",
    boxSizing: "border-box",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    transition: "background-color 0.15s ease, color 0.15s ease",
    /** Next `Link` as root can inherit anchor color; lock to theme text. */
    textDecoration: "none",
    color: textPrimary,
    "&:visited": {
      color: textPrimary,
    },

    "& .MuiListItemIcon-root": {
      color: defaultNavIcon,
    },
    "& .MuiListItemText-root": {
      marginTop: 0,
      marginBottom: 0,
      display: "flex",
      alignItems: "center",
    },
    "& .MuiListItemText-primary": {
      color: alpha(textPrimary, mode === "dark" ? 0.9 : 0.87),
      margin: 0,
      padding: 0,
      lineHeight: 1.4,
      display: "inline-flex",
      alignItems: "center",
    },

    "&:hover:not(.Mui-selected)": {
      backgroundColor: hoverBg,
    },

    "&.Mui-selected": {
      borderRadius: "0 9999px 9999px 0",
      border: "none",
      backgroundColor: selectedBg,
      backdropFilter: "none",
      WebkitBackdropFilter: "none",
      boxShadow: primaryTooDarkForTint
        ? `inset 0 0 0 1px ${alpha(textPrimary, mode === "dark" ? 0.12 : 0.08)}`
        : "none",
      color: textPrimary,

      "& .MuiListItemIcon-root": {
        color: selectedIcon,
      },

      "& .MuiListItemText-primary": {
        fontWeight: 600,
        color: textPrimary,
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 1.4,
        margin: 0,
        padding: 0,
      },
    },

    "&.Mui-selected:hover": {
      backgroundColor: selectedBgHover,
    },
  };
};

export const sidebarInnerSx: SxProps<Theme> = {
  width: SIDEBAR_WIDTH,
  height: "100%",
  backgroundColor: (t) => {
    const isLight = t.palette.mode === "light";
    return isLight ? "rgba(255, 255, 255, 0.3)" : "rgba(8, 12, 22, 0.34)";
  },
  backgroundImage: (t) => {
    const app = (t as AppTheme).app;
    return `linear-gradient(180deg, ${alpha("#ffffff", 0.12)} 0%, ${alpha("#ffffff", 0.02)} 100%), ${app.dashboard.sidebarBg}`;
  },
  backdropFilter: (t) => {
    const isLight = t.palette.mode === "light";
    const b = (t as AppTheme).app.dashboard.sidebarBackdropBlur;
    return !b || b === "none"
      ? (isLight ? "blur(18px) saturate(165%)" : "blur(24px) saturate(180%)")
      : b;
  },
  WebkitBackdropFilter: (t) => {
    const isLight = t.palette.mode === "light";
    const b = (t as AppTheme).app.dashboard.sidebarBackdropBlur;
    return !b || b === "none"
      ? (isLight ? "blur(18px) saturate(165%)" : "blur(24px) saturate(180%)")
      : b;
  },
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

export const headerBoxSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    width: "100%",
    height: 104,
    p: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1.5,
    position: "relative",
    boxSizing: "border-box",
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "1px",
      backgroundColor: app.dashboard.shellBorder,
    },
  };
};

export const logoImgSx: SxProps<Theme> = {
  display: "block",
  height: 36,
  width: "auto",
  maxWidth: "100%",
};

export const closeButtonSx: SxProps<Theme> = (theme) => ({
  color: (theme as AppTheme).app.dashboard.white80,
});

export const listSx: SxProps<Theme> = {
  px: 0,
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": { display: "none" },
};

/** Pinned bottom block (Theme / Log out) — same idea as fixed header, does not scroll with nav. */
export const sidebarFooterSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    flexShrink: 0,
    position: "relative",
    pt: 1.25,
    pb: 1.5,
    "&::before": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: "1px",
      backgroundColor: app.dashboard.shellBorder,
    },
  };
};

export const sidebarFooterListSx: SxProps<Theme> = {
  py: 0,
  px: 0,
  width: "100%",
};

/** Icon color comes from `navItemSx` (theme primary); keep layout only here. */
export const listIconSelectedSx: SxProps<Theme> = {
  minWidth: 40,
  width: 40,
  maxWidth: 40,
  p: 0,
  m: 0,
  mr: 1.25,
  alignSelf: "stretch",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  "& .MuiSvgIcon-root": {
    display: "block",
    lineHeight: 0,
    flexShrink: 0,
    margin: 0,
  },
};

export const listIconDefaultSx: SxProps<Theme> = {
  minWidth: 40,
  width: 40,
  maxWidth: 40,
  p: 0,
  m: 0,
  mr: 1.25,
  alignSelf: "stretch",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  "& .MuiSvgIcon-root": {
    display: "block",
    lineHeight: 0,
    flexShrink: 0,
    margin: 0,
  },
};

export const desktopWrapperSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    width: SIDEBAR_WIDTH,
    height: { xs: "100vh", md: "calc(100vh - 32px)" },
    position: "sticky",
    top: { xs: 0, md: 16 },
    flexShrink: 0,
    alignSelf: { xs: "stretch", md: "flex-start" },
    borderRadius: { xs: 0, md: app.dashboard.shellRadius },
    border: { xs: "none", md: `1px solid ${app.dashboard.shellBorder}` },
    overflow: "hidden",
    boxSizing: "border-box",
    boxShadow: {
      md: "0 8px 32px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
    },
  };
};

/** Backdrop tint when the mobile nav uses MUI `Drawer` (Modal portal — not `position: fixed` in layout tree). */
export const mobileDrawerBackdropSx: SxProps<Theme> = (theme) => ({
  bgcolor: (theme as AppTheme).app.dashboard.backdropDark,
});

/** `Drawer` paper only (root Modal supplies portal + stacking; avoids broken `fixed` inside transformed ancestors). */
export const mobileDrawerPaperSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    width: SIDEBAR_WIDTH,
    maxWidth: "min(100vw - 16px, 100%)",
    boxSizing: "border-box",
    overflow: "hidden",
    borderRadius: `0 ${app.dashboard.shellRadius} ${app.dashboard.shellRadius} 0`,
    border: `1px solid ${app.dashboard.shellBorder}`,
    borderLeft: "none",
    boxShadow: "8px 0 32px rgba(0, 0, 0, 0.25)",
    bgcolor: "transparent",
  };
};
