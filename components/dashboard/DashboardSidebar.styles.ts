import type { SxProps, Theme } from "@mui/material/styles";
import { typographyVariants } from "@/components/common/Typography/typography.styles";

/** Expanded rail content width */
export const SIDEBAR_WIDTH = 260;
/** Icon-only rail */
export const SIDEBAR_WIDTH_COLLAPSED = 76;

export const navTextProps = {
  color: "#B6A0EA" as const,
  ...typographyVariants.medium16,
};

export const sectionLabelSx: SxProps<Theme> = {
  px: 2,
  py: 0.75,
  typography: typographyVariants.medium16,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  fontSize: 11,
  color: "rgba(255,255,255,0.45)",
};

export const navItemSx: SxProps<Theme> = {
  mx: 1.25,
  my: 0.35,
  py: 1,
  borderRadius: 0,
  boxSizing: "border-box",
  whiteSpace: "nowrap",
  transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, justify-content 0.25s ease",

  "&:hover": {
    background: "rgba(255,255,255,0.06)",
  },

  /** Reference: light frosted pill on active item */
  "&.Mui-selected": {
    background: "rgba(255,255,255,0.14)",
    backdropFilter: "blur(14px) saturate(140%)",
    WebkitBackdropFilter: "blur(14px) saturate(140%)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",

    "& .MuiListItemText-primary": {
      fontWeight: 600,
    },
  },
};

/** Collapsed: icon-centered rows */
export const navItemCollapsedSx: SxProps<Theme> = {
  justifyContent: "center",
  mx: 1,
  px: 0.5,
};

export const sidebarInnerBaseSx: SxProps<Theme> = {
  height: "100%",
  minHeight: 0,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  isolation: "isolate",
  transition: "width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
};

export const logoImgSx: SxProps<Theme> = {
  display: "block",
  height: 36,
  width: "auto",
  maxWidth: "100%",
  flexShrink: 0,
};

export const closeButtonSx: SxProps<Theme> = {
  color: "rgba(255,255,255,0.8)",
};

export const listSx: SxProps<Theme> = {
  px: 0,
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  "&::-webkit-scrollbar": { display: "none" },
};

export const listIconSelectedSx: SxProps<Theme> = {
  minWidth: 40,
  color: "rgba(255,255,255,0.95)",
};

export const listIconDefaultSx: SxProps<Theme> = {
  minWidth: 40,
  color: "rgba(255,255,255,0.65)",
};

export const listIconCollapsedSx: SxProps<Theme> = {
  minWidth: "0 !important",
  margin: "auto",
  justifyContent: "center",
};

/** Outer rail: inset floating glass panel */
export function railOuterSx(contentWidth: number): SxProps<Theme> {
  return {
    position: "sticky",
    top: 0,
    alignSelf: "flex-start",
    height: "100vh",
    flexShrink: 0,
    py: 2,
    pl: 2,
    pr: 0.5,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    width: { xs: "auto", md: `calc(${contentWidth}px + 20px)` },
    minWidth: { md: `calc(${contentWidth}px + 20px)` },
    transition: "min-width 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
  };
}

export const backdropSx: SxProps<Theme> = {
  display: "block",
  position: "fixed",
  inset: 0,
  bgcolor: "rgba(0,0,0,0.5)",
  zIndex: 1200,
  transition: "opacity 0.2s ease",
};

export const mobileDrawerSx: SxProps<Theme> = {
  position: "fixed",
  left: 0,
  top: 0,
  height: "100vh",
  zIndex: 1300,
  transition: "transform 0.25s ease-out",
};
