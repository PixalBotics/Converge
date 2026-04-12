import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { typographyVariants } from "@/components/common/Typography/typography.styles";
import { mainBackgroundGradient } from "@/theme/theme";

export const SIDEBAR_WIDTH = 260;

export const navTypographyBase = typographyVariants.medium16;

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

export const navItemSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    mx: 1,
    my: 2.25,
    borderRadius: "6px",
    boxSizing: "border-box",
    whiteSpace: "nowrap",

    "&.Mui-selected": {
      width: 210,
      height: 48,
      borderRadius: "6px",
      border: `1px solid ${app.dashboard.shellBorder}`,
      background: app.dashboard.navItemSelectedBg,
      backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      boxShadow: app.dashboard.navSelectedInsetShadow,

      "& .MuiListItemIcon-root": {
        color: app.text.primary,
      },

      "& .MuiListItemText-primary": {
        fontWeight: 600,
        color: app.text.primary,
      },
    },
  };
};

export const getSidebarBackground = (theme: Theme) =>
  (theme as Theme & { appBackground?: string }).appBackground ?? mainBackgroundGradient;

export const sidebarInnerSx: SxProps<Theme> = {
  width: SIDEBAR_WIDTH,
  height: "100%",
  background: (t) => {
    const app = (t as AppTheme).app;
    const blur = app.dashboard.sidebarBackdropBlur;
    if (blur && blur !== "none") {
      return app.dashboard.sidebarBg;
    }
    return getSidebarBackground(t as Theme);
  },
  backdropFilter: (t) => {
    const b = (t as AppTheme).app.dashboard.sidebarBackdropBlur;
    return !b || b === "none" ? undefined : b;
  },
  WebkitBackdropFilter: (t) => {
    const b = (t as AppTheme).app.dashboard.sidebarBackdropBlur;
    return !b || b === "none" ? undefined : b;
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

export const listIconSelectedSx: SxProps<Theme> = (theme) => ({
  minWidth: 40,
  color: (theme as AppTheme).app.text.primary,
});

export const listIconDefaultSx: SxProps<Theme> = (theme) => ({
  minWidth: 40,
  color: (theme as AppTheme).app.text.primary,
});

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

export const backdropSx: SxProps<Theme> = (theme) => ({
  display: "block",
  position: "fixed",
  inset: 0,
  bgcolor: (theme as AppTheme).app.dashboard.backdropDark,
  zIndex: 1200,
  transition: "opacity 0.2s ease",
});

export const mobileDrawerSx: SxProps<Theme> = (theme) => {
  const app = (theme as AppTheme).app;
  return {
    position: "fixed",
    left: 0,
    top: 0,
    height: "100vh",
    width: SIDEBAR_WIDTH,
    zIndex: 1300,
    transition: "transform 0.25s ease-out",
    borderRadius: `0 ${app.dashboard.shellRadius} ${app.dashboard.shellRadius} 0`,
    border: `1px solid ${app.dashboard.shellBorder}`,
    borderLeft: "none",
    overflow: "hidden",
    boxSizing: "border-box",
    boxShadow: "8px 0 32px rgba(0, 0, 0, 0.25)",
  };
};
