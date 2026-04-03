import type { SxProps, Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const headerBaseSx: SxProps<Theme> = {
  minHeight: { xs: 60, sm: 68, md: 78 },
  px: { xs: 1.5, sm: 2, md: 2.75 },
  py: { xs: 1, md: 1.125 },
  display: "flex",
  alignItems: "center",
  gap: { xs: 1, sm: 1.5, md: 2 },
  position: "relative",
  zIndex: 2,
  overflow: "hidden",
  mt: { xs: 0, md: 2 },
  mr: { xs: 0, md: 2 },
  borderTopRightRadius: { md: 16 },
  borderBottomRightRadius: { md: 16 },
  boxShadow: {
    md: "0 4px 6px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
    xs: "none",
  },
};

export function toolbarIconSx(
  theme: AppTheme,
  borderOpacity: number,
  opts?: { hideBelow?: "sm" | "md" }
): SxProps<Theme> {
  const hide = opts?.hideBelow === "md" ? { display: { xs: "none", md: "inline-flex" } } : {};
  const hideSm = opts?.hideBelow === "sm" ? { display: { xs: "none", sm: "inline-flex" } } : {};
  return {
    ...hide,
    ...hideSm,
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: `1px solid rgba(255,255,255,${Math.min(0.22, borderOpacity + 0.04)})`,
    background: "linear-gradient(165deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 100%)",
    backdropFilter: "blur(18px) saturate(180%)",
    WebkitBackdropFilter: "blur(18px) saturate(180%)",
    color: theme.app.text.primary,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 2px 8px rgba(0,0,0,0.12)",
    transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
    "&:hover": {
      background: "linear-gradient(165deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.07) 100%)",
      borderColor: `rgba(255,255,255,${Math.min(0.36, borderOpacity + 0.12)})`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.16), 0 4px 16px ${alpha(theme.palette.primary.main, 0.12)}`,
      transform: "translateY(-1px)",
    },
  };
}

export function userCapsuleSx(theme: AppTheme, borderOpacity: number): SxProps<Theme> {
  return {
    display: "flex",
    alignItems: "center",
    gap: 1.125,
    pl: 1,
    pr: 1.125,
    py: 0.625,
    borderRadius: "9999px",
    border: `1px solid rgba(255,255,255,${Math.min(0.2, borderOpacity + 0.03)})`,
    background: "linear-gradient(155deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.035) 55%, rgba(255,255,255,0.05) 100%)",
    backdropFilter: "blur(20px) saturate(185%)",
    WebkitBackdropFilter: "blur(20px) saturate(185%)",
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 20px rgba(0,0,0,0.12), 0 0 0 1px ${alpha(theme.palette.primary.main, 0.06)}`,
    transition: "background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease",
    "&:hover": {
      background: "linear-gradient(155deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.055) 55%, rgba(255,255,255,0.07) 100%)",
      borderColor: `rgba(255,255,255,${Math.min(0.34, borderOpacity + 0.1)})`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.14), 0 8px 28px rgba(0,0,0,0.16), 0 0 0 1px ${alpha(theme.palette.primary.main, 0.12)}`,
      transform: "translateY(-1px)",
    },
  };
}

export function searchShellSx(
  fillOpacity: number,
  borderOpacity: number,
  focusRingRgb: string
): SxProps<Theme> {
  const fill = Math.min(0.16, fillOpacity + 0.02);
  return {
    display: "flex",
    alignItems: "center",
    gap: 1.25,
    px: 2,
    py: 1,
    minHeight: 44,
    borderRadius: "9999px",
    bgcolor: `rgba(255,255,255,${fillOpacity})`,
    border: `1px solid rgba(255,255,255,${Math.min(0.22, borderOpacity + 0.02)})`,
    backgroundImage: `linear-gradient(180deg, rgba(255,255,255,${fill * 0.35}) 0%, rgba(255,255,255,0) 48%)`,
    backdropFilter: "blur(20px) saturate(190%)",
    WebkitBackdropFilter: "blur(20px) saturate(190%)",
    width: "100%",
    boxSizing: "border-box",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 2px 12px rgba(0,0,0,0.08)",
    transition: "border-color 0.22s ease, box-shadow 0.22s ease, background-color 0.22s ease",
    "&:focus-within": {
      borderColor: `rgba(${focusRingRgb},0.55)`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.16), 0 0 0 3px rgba(${focusRingRgb},0.2), 0 8px 28px rgba(${focusRingRgb},0.12)`,
      bgcolor: `rgba(255,255,255,${Math.min(0.15, fillOpacity + 0.035)})`,
    },
  };
}

/** Soft vertical rule between zones */
export const headerDividerSx: SxProps<Theme> = {
  display: { xs: "none", md: "block" },
  width: "1px",
  height: 40,
  alignSelf: "center",
  borderRadius: 1,
  background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)",
  opacity: 0.85,
  flexShrink: 0,
};
