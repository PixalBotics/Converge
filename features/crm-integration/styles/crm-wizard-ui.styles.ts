import { alpha } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export {
  distributionStepperRootSx as crmStepperRootSx,
  distributionStepperProgressTrackSx as crmStepperProgressTrackSx,
  distributionStepperProgressFillSx as crmStepperProgressFillSx,
  distributionStepCardSx as crmStepCardSx,
  distributionStepNumberSx as crmStepNumberSx,
  distributionWizardFooterActionsSx as crmWizardFooterActionsSx,
  distributionChannelCardSx as crmChannelCardSx,
  distributionSettingsLayoutSx as crmWizardLayoutSx,
} from "@/features/distribution-setup/styles/distribution-wizard-ui.styles";

export const crmStepperGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: {
    xs: "repeat(2, minmax(0, 1fr))",
    sm: "repeat(3, minmax(0, 1fr))",
    lg: "repeat(5, minmax(0, 1fr))",
  },
  gap: { xs: 1, md: 1.25 },
};

export const crmPlatformGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
  gap: 1.5,
};

export const crmPlatformCardSx =
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
      gap: 1,
      minHeight: 128,
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

export const crmPlatformIconSx = (accent: string): SxProps<Theme> => ({
  width: 44,
  height: 44,
  borderRadius: 1.75,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  bgcolor: alpha(accent, 0.18),
  color: accent,
  fontWeight: 800,
  fontSize: 15,
  letterSpacing: -0.5,
});

export const crmGuidePanelSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    mb: 2.5,
    p: 2,
    borderRadius: 2,
    border: `1px solid ${alpha(t.palette.info.main, 0.35)}`,
    bgcolor: alpha(t.palette.info.main, 0.08),
  };
};

export const crmMappingPanelSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    p: { xs: 1.5, md: 2 },
    borderRadius: 2,
    border: `1px solid ${alpha(t.app.dashboard.cardBorder, 0.9)}`,
    bgcolor: alpha(t.app.dashboard.pillBg, 0.35),
  };
};

export const crmMappingRowSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  alignItems: { xs: "stretch", sm: "center" },
  gap: { xs: 0.75, sm: 1.5 },
  mb: 2,
  position: "relative",
  "&:last-of-type": { mb: 0 },
};

export const crmMappingPillSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    px: 1.75,
    py: 1,
    borderRadius: "53px",
    border: `1px solid ${t.app.dashboard.cardBorder}`,
    backgroundColor: t.app.dashboard.overlayMedium,
    color: t.app.text.primary,
    fontSize: 14,
    fontWeight: 500,
    minWidth: 0,
    flex: 1,
  };
};

export const crmMappingConnectorSx: SxProps<Theme> = (theme) => {
  const t = theme as AppTheme;
  return {
    display: { xs: "none", sm: "block" },
    height: 2,
    width: 32,
    flexShrink: 0,
    borderRadius: 1,
    background: `linear-gradient(90deg, ${t.palette.primary.main}, ${t.palette.primary.dark})`,
    opacity: 0.95,
  };
};
