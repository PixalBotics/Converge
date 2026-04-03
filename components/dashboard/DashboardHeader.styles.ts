import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const headerBaseSx: SxProps<Theme> = {
  minHeight: { xs: 60, sm: 68, md: 72 },
  px: { xs: 1.5, sm: 2, md: 2.5 },
  py: { xs: 1, md: 1 },
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: { xs: 1, sm: 1.25, md: 2 },
  position: "relative",
  zIndex: 2,
  overflow: "hidden",
  mt: { xs: 0, md: 2 },
  mr: { xs: 0, md: 2 },
  borderTopRightRadius: { md: 6 },
  borderBottomRightRadius: { md: 6 },
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
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: `1px solid rgba(255,255,255,${borderOpacity})`,
    background: "rgba(255,255,255,0.06)",
    backdropFilter: "blur(14px) saturate(160%)",
    WebkitBackdropFilter: "blur(14px) saturate(160%)",
    color: theme.app.text.primary,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
    transition: "background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
    "&:hover": {
      background: "rgba(255,255,255,0.1)",
      borderColor: `rgba(255,255,255,${Math.min(0.34, borderOpacity + 0.1)})`,
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
    },
  };
}

export function userCapsuleSx(theme: AppTheme, borderOpacity: number): SxProps<Theme> {
  return {
    display: "flex",
    alignItems: "center",
    gap: 1,
    pl: 0.875,
    pr: 1,
    py: 0.5,
    borderRadius: "9999px",
    border: `1px solid rgba(255,255,255,${borderOpacity})`,
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(12px) saturate(150%)",
    WebkitBackdropFilter: "blur(12px) saturate(150%)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
    transition: "background 0.2s ease, border-color 0.2s ease",
    "&:hover": {
      background: "rgba(255,255,255,0.09)",
      borderColor: `rgba(255,255,255,${Math.min(0.32, borderOpacity + 0.08)})`,
    },
  };
}

export function searchShellSx(
  fillOpacity: number,
  borderOpacity: number,
  focusRingRgb: string
): SxProps<Theme> {
  return {
    display: "flex",
    alignItems: "center",
    gap: 1.125,
    px: 1.875,
    py: 0.875,
    borderRadius: "9999px",
    bgcolor: `rgba(255,255,255,${fillOpacity})`,
    border: `1px solid rgba(255,255,255,${borderOpacity})`,
    backdropFilter: "blur(16px) saturate(165%)",
    WebkitBackdropFilter: "blur(16px) saturate(165%)",
    width: "100%",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
    "&:focus-within": {
      borderColor: `rgba(${focusRingRgb},0.42)`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.14), 0 0 0 2px rgba(${focusRingRgb},0.18)`,
      bgcolor: `rgba(255,255,255,${Math.min(0.14, fillOpacity + 0.03)})`,
    },
  };
}

/** Soft vertical rule between zones */
export const headerDividerSx: SxProps<Theme> = {
  display: { xs: "none", md: "block" },
  width: "1px",
  height: 36,
  alignSelf: "center",
  background: "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
  flexShrink: 0,
};
