import type { SxProps, Theme } from "@mui/material/styles";
import { typographyVariants } from "@/components/common/Typography/typography.styles";

export const SIDEBAR_WIDTH = 260;

export const navTextProps = {
  color: "#B6A0EA" as const,
  ...typographyVariants.medium16,
};

export const sectionLabelSx: SxProps<Theme> = {
  px: 2,
  py: 1,
  typography: "caption",
  fontWeight: 700,
  letterSpacing: 1.2,
  color: "#B6A0EA",
};

export const navItemSx: SxProps<Theme> = {
  mx: 1,
  my: 2.25,
  borderRadius: 1.5,
  boxSizing: "border-box",

  "&.Mui-selected": {
    width: 210,
    height: 57,
    background: "#33333373",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    boxShadow: `
      0px 0px 16px 0px #F2F2F2 inset,
      0px 0px 3px 0px #FFFFFF80 inset,
      -1px -1px 0.5px -1px #FFFFFF inset,
      1px 1px 0.5px -1px #FFFFFF inset,
      -1px -1px 0px -0.5px #262626 inset,
      1px 1px 0px -0.5px #333333 inset
    `,

    "& .MuiListItemIcon-root": {
      color: "#93C5FD",
    },

    "& .MuiListItemText-primary": {
      fontWeight: 600,
    },
  },
};

const defaultBackground =
  "radial-gradient(50% 50% at 50% 50%, #09013F 0%, #00011A 100%)";

export const getSidebarBackground = (theme: Theme) =>
  (theme as Theme & { appBackground?: string }).appBackground ?? defaultBackground;

export const sidebarInnerSx: SxProps<Theme> = {
  width: SIDEBAR_WIDTH,
  height: "100%",
  background: (t) => getSidebarBackground(t as Theme),
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

export const headerBoxSx: SxProps<Theme> = {
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
    background: "linear-gradient(90deg, #0F0747 0%, #0F0557 100%)",
  },
};

export const logoImgSx: SxProps<Theme> = {
  display: "block",
  height: 36,
  width: "auto",
  maxWidth: "100%",
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
  color: "rgba(255,255,255,0.9)",
};

export const listIconDefaultSx: SxProps<Theme> = {
  minWidth: 40,
  color: "rgba(255,255,255,0.7)",
};

export const desktopWrapperSx: SxProps<Theme> = {
  width: SIDEBAR_WIDTH,
  height: "100vh",
  position: "sticky",
  top: 0,
  flexShrink: 0,
};

export const backdropSx: SxProps<Theme> = {
  display: "block", // overridden by component for open/closed
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
  width: SIDEBAR_WIDTH,
  zIndex: 1300,
  transition: "transform 0.25s ease-out",
  // transform and boxShadow set inline based on open state
};
