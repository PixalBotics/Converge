import type { SxProps, Theme } from "@mui/material/styles";

export type WidgetLauncherStyleId = "solid" | "gradient" | "glass" | "glow";

export const WIDGET_LAUNCHER_STYLE_OPTIONS: {
  id: WidgetLauncherStyleId;
  label: string;
  description: string;
}[] = [
  { id: "solid", label: "Solid", description: "Flat brand color" },
  { id: "gradient", label: "Gradient", description: "Two-tone shine" },
  { id: "glass", label: "Glass", description: "Frosted translucent" },
  { id: "glow", label: "Glow", description: "Soft colored halo" },
];

export function normalizeLauncherStyle(value: unknown): WidgetLauncherStyleId {
  const s = String(value ?? "").toLowerCase();
  if (s === "gradient" || s === "glass" || s === "glow") return s;
  return "solid";
}

/** Panel shell — glow is not offered in the wizard; keep legacy configs on solid. */
export function normalizePanelSurfaceStyle(value: unknown): WidgetLauncherStyleId {
  const style = normalizeLauncherStyle(value);
  return style === "glow" ? "solid" : style;
}

function launcherShapeRadius(shape: string): string {
  if (shape === "square") return "10px";
  if (shape === "rounded") return "16px";
  return "50%";
}

export { launcherShapeRadius };

/** Shared FAB surface styles for embed + dashboard preview. */
export function resolveLauncherFabSurfaceSx(params: {
  style: WidgetLauncherStyleId;
  buttonColor: string;
  buttonHoverColor: string;
  iconColor: string;
  shape: string;
  sizePx: number;
  glowColor?: string;
}): SxProps<Theme> {
  const radius = launcherShapeRadius(params.shape);
  const base = params.buttonColor || "#1E63D5";
  const hover = params.buttonHoverColor || base;
  const glow = params.glowColor?.trim() || base;
  const glowHover = params.glowColor?.trim() ? glow : hover;
  const icon = params.iconColor || "#ffffff";
  const hoverDistinct = hover.trim().toLowerCase() !== base.trim().toLowerCase();
  const hoverLift = {
    transform: "translateY(-2px) scale(1.05)",
    ...(hoverDistinct ? {} : { filter: "brightness(1.08)" }),
  };

  const sizeBlock = {
    width: params.sizePx,
    height: params.sizePx,
    minWidth: params.sizePx,
    minHeight: params.sizePx,
    flexShrink: 0,
    borderRadius: radius,
    color: `${icon} !important`,
    overflow: "hidden" as const,
    transition: "transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease",
  };

  if (params.style === "gradient") {
    const gradient = `linear-gradient(135deg, ${base} 0%, ${hover} 100%)`;
    return {
      ...sizeBlock,
      background: `${gradient} !important`,
      bgcolor: "transparent !important",
      border: "none",
      boxShadow: "0 4px 14px rgba(15, 23, 42, 0.18)",
      "&:hover": {
        background: `linear-gradient(135deg, ${hover} 0%, ${base} 100%) !important`,
        color: `${icon} !important`,
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.22)",
        ...hoverLift,
      },
    };
  }

  if (params.style === "glass") {
    return {
      ...sizeBlock,
      bgcolor: "transparent !important",
      background: `linear-gradient(145deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.08) 100%), ${base} !important`,
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.45)",
      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.16)",
      "&:hover": {
        background: `linear-gradient(145deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 100%), ${hover} !important`,
        color: `${icon} !important`,
        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.2)",
        ...hoverLift,
      },
    };
  }

  if (params.style === "glow") {
    return {
      ...sizeBlock,
      bgcolor: `${base} !important`,
      border: "none",
      boxShadow: `0 0 0 1px rgba(255,255,255,0.2), 0 0 22px ${glow}88, 0 8px 20px rgba(15, 23, 42, 0.2)`,
      "&:hover": {
        bgcolor: `${hover} !important`,
        color: `${icon} !important`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.28), 0 0 28px ${glowHover}aa, 0 10px 24px rgba(15, 23, 42, 0.24)`,
        ...hoverLift,
      },
    };
  }

  return {
    ...sizeBlock,
    bgcolor: `${base} !important`,
    border: "none",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.14)",
    "&:hover": {
      bgcolor: `${hover} !important`,
      color: `${icon} !important`,
      boxShadow: "0 6px 16px rgba(15, 23, 42, 0.18)",
      ...hoverLift,
    },
    "&:active": { boxShadow: "0 2px 8px rgba(15, 23, 42, 0.12)" },
    "&:focus": { boxShadow: "0 4px 12px rgba(15, 23, 42, 0.14)" },
    "&:focus-visible": {
      outline: `2px solid ${base}`,
      outlineOffset: 2,
    },
  };
}

/** Chat panel shell — mirrors launcher preset on the full widget window. */
export function resolveWidgetPanelSurfaceSx(params: {
  style: WidgetLauncherStyleId;
  buttonColor: string;
  buttonHoverColor: string;
  panelBackground: string;
  borderRadiusPx: number;
  glowColor?: string;
}): SxProps<Theme> {
  const radius = Math.max(12, params.borderRadiusPx);
  const base = params.buttonColor || "#1E63D5";
  const hover = params.buttonHoverColor || base;
  const glow = params.glowColor?.trim() || base;
  const panelBg = params.panelBackground || "#f8fafc";

  if (params.style === "glass") {
    return {
      borderRadius: `${radius}px`,
      bgcolor: "rgba(255, 255, 255, 0.55)",
      background: `linear-gradient(165deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.38) 42%, ${panelBg}cc 100%)`,
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      border: "1px solid rgba(255, 255, 255, 0.55)",
      boxShadow: "0 16px 48px rgba(15, 23, 42, 0.2)",
    };
  }

  if (params.style === "gradient") {
    return {
      borderRadius: `${radius}px`,
      background: `linear-gradient(168deg, ${base}22 0%, ${panelBg} 36%, ${hover}18 100%)`,
      border: `1px solid ${base}40`,
      boxShadow: `0 14px 40px ${base}24`,
    };
  }

  if (params.style === "glow") {
    return {
      borderRadius: `${radius}px`,
      bgcolor: panelBg,
      border: `1px solid ${glow}55`,
      boxShadow: `0 0 0 1px ${glow}20, 0 14px 36px ${glow}30`,
    };
  }

  return {
    borderRadius: `${radius}px`,
    bgcolor: panelBg,
    border: "1px solid rgba(15, 23, 42, 0.08)",
    boxShadow: "0 10px 32px rgba(15, 23, 42, 0.14)",
  };
}

export function resolveWidgetPanelHeaderSurfaceSx(params: {
  style: WidgetLauncherStyleId;
  headerBg: string;
  buttonHoverColor?: string;
}): SxProps<Theme> {
  const headerBg = params.headerBg || "#1E63D5";
  const hover = params.buttonHoverColor?.trim() || headerBg;
  if (params.style === "glass") {
    return {
      bgcolor: "transparent",
      background: `linear-gradient(180deg, ${headerBg}f0 0%, ${headerBg}d9 100%)`,
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    };
  }
  if (params.style === "gradient") {
    return {
      background: `linear-gradient(135deg, ${headerBg} 0%, ${hover} 100%)`,
    };
  }
  if (params.style === "glow") {
    return {
      bgcolor: headerBg,
      boxShadow: `inset 0 -1px 0 ${headerBg}66`,
    };
  }
  return { bgcolor: headerBg };
}

/** Message bubble surface — glass / gradient / glow on top of role colors. */
export function resolveBubbleSurfaceSx(params: {
  style: WidgetLauncherStyleId;
  role: "visitor" | "assistant" | "greeting";
  baseBg: string;
  baseText: string;
  primary: string;
  hover: string;
}): SxProps<Theme> {
  const baseBg = params.baseBg || "#f1f5f9";
  const primary = params.primary || "#1E63D5";
  const hover = params.hover || primary;

  if (params.style === "glass") {
    return {
      bgcolor: "transparent !important",
      background: `linear-gradient(145deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 100%), ${baseBg}cc !important`,
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      border: "1px solid rgba(255, 255, 255, 0.42) !important",
      boxShadow: "0 2px 10px rgba(15, 23, 42, 0.1)",
      color: `${params.baseText} !important`,
    };
  }

  if (params.style === "gradient") {
    const gradient =
      params.role === "visitor"
        ? `linear-gradient(135deg, ${baseBg} 0%, ${hover}44 100%)`
        : `linear-gradient(135deg, ${primary}22 0%, ${baseBg} 55%, ${hover}18 100%)`;
    return {
      background: `${gradient} !important`,
      bgcolor: "transparent !important",
      border: `1px solid ${primary}33 !important`,
      color: `${params.baseText} !important`,
    };
  }

  if (params.style === "glow") {
    return {
      bgcolor: `${baseBg} !important`,
      color: `${params.baseText} !important`,
      border: `1px solid ${primary}55 !important`,
      boxShadow: `0 0 0 1px ${primary}22, 0 0 14px ${primary}44, 0 2px 10px ${primary}30`,
    };
  }

  return {
    bgcolor: `${baseBg} !important`,
    color: `${params.baseText} !important`,
    border: `1px solid ${primary}22 !important`,
    boxShadow: `0 2px 6px ${primary}14`,
  };
}
