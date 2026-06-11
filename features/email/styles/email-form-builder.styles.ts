import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import type { AppTheme } from "@/theme/theme";

type ThemeSxCallback = (theme: Theme) => SystemStyleObject<Theme>;

export const emailFormBuilderPageSx: SxProps<Theme> = {
  maxWidth: 1280,
  width: "100%",
  mx: "auto",
};

export const emailFormTypeChoiceCardSx =
  (selected: boolean): SxProps<Theme> =>
  (theme) => {
    const t = theme as AppTheme;
    return {
      p: 2,
      borderRadius: 2.5,
      cursor: "pointer",
      textAlign: "left",
      display: "flex",
      flexDirection: "column",
      gap: 0.75,
      minHeight: 132,
      border: `2px solid ${selected ? alpha(t.palette.primary.main, 0.65) : t.app.dashboard.cardBorder}`,
      bgcolor: selected ? alpha(t.palette.primary.main, 0.14) : alpha(t.app.dashboard.pillBg, 0.4),
      boxShadow: selected ? `0 8px 28px ${alpha(t.palette.primary.main, 0.18)}` : "none",
      transition: "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
      "&:hover": {
        borderColor: alpha(t.palette.primary.main, 0.5),
        transform: "translateY(-1px)",
      },
    };
  };

export const emailFormWebsiteScopeSx: ThemeSxCallback = (theme) => {
  const t = theme as AppTheme;
  return {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
    p: 2,
    borderRadius: 2.5,
    border: `1px solid ${alpha(t.palette.primary.main, 0.35)}`,
    background: `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.14)} 0%, ${alpha(t.app.dashboard.pillBg, 0.85)} 100%)`,
  };
};

export const emailFormFieldTableSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    borderRadius: 2,
    border: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.9)}`,
    overflow: "hidden",
    bgcolor: alpha(t.palette.common.white, 0.02),
  };
};

export const emailFormFieldTableHeadSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: "grid",
    gridTemplateColumns: "1fr 120px 88px",
    gap: 1,
    px: 2,
    py: 1.25,
    bgcolor: alpha(t.palette.common.white, 0.04),
    borderBottom: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.75)}`,
  };
};

export const emailFormFieldTableRowSx =
  (active: boolean): SxProps<Theme> =>
  (theme) => {
    const t = theme as AppTheme;
    return {
      display: "grid",
      gridTemplateColumns: "1fr 120px 88px",
      gap: 1,
      alignItems: "center",
      px: 2,
      py: 1.15,
      borderBottom: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.45)}`,
      bgcolor: active ? alpha(t.palette.primary.main, 0.06) : "transparent",
      transition: "background-color 0.15s ease",
      "&:last-of-type": { borderBottom: "none" },
    };
  };

export const emailFormPreviewDeviceSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    borderRadius: 2.5,
    border: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.9)}`,
    overflow: "hidden",
    bgcolor: "#ffffff",
    boxShadow: `0 20px 50px ${alpha(t.palette.common.black, 0.35)}`,
  };
};

export const emailFormPreviewHeaderSx: SxProps<Theme> = {
  px: 2.5,
  py: 2,
  bgcolor: "#1a57a5",
  color: "#fff",
};

export const emailFormPreviewBodySx: SxProps<Theme> = {
  px: 2.5,
  py: 2,
  bgcolor: "#f8fafc",
  minHeight: 280,
};

export const emailFormStickyFooterSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    position: "sticky",
    bottom: 0,
    zIndex: 2,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 1.5,
    flexWrap: "wrap",
    mt: 2,
    pt: 2,
    borderTop: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.75)}`,
    bgcolor: alpha(t.app.dashboard.cardBg ?? t.palette.background.paper, 0.92),
    backdropFilter: "blur(8px)",
  };
};
