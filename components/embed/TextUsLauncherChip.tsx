"use client";

import CloseRounded from "@mui/icons-material/CloseRounded";
import Box from "@mui/material/Box";
import { Typography } from "@/components/common";
import { LauncherPresetIcon } from "@/lib/chat-widget/launcherIcons";
import type { LauncherIconPresetId } from "@/lib/chat-widget/launcher-icon-presets";
import {
  launcherShapeRadius,
  resolveLauncherFabSurfaceSx,
} from "@/lib/chat-widget/launcher-style";
import type { WidgetLauncherStyleId } from "@/lib/chat-widget/launcher-style";

export type TextUsLauncherChipProps = {
  buttonColor: string;
  buttonHoverColor?: string;
  iconColor?: string;
  iconPreset?: LauncherIconPresetId | string;
  iconDataUrl?: string;
  iconEnabled?: boolean;
  launcherStyle?: WidgetLauncherStyleId | string;
  glowColor?: string;
  buttonLabel?: string;
  buttonShape?: "circle" | "rounded" | "square";
  open?: boolean;
  size?: "preview" | "embed";
  ariaLabelPrefix?: string;
  onClick?: () => void;
};

const EMBED_SIZE_PX = 56;
const PREVIEW_SIZE_PX = 48;

/** Floating launcher — pill with icon + label, or shaped icon-only FAB. */
export function TextUsLauncherChip({
  buttonColor,
  buttonHoverColor,
  iconColor = "#ffffff",
  iconPreset = "phosphor-chat-circle",
  iconDataUrl = "",
  iconEnabled = true,
  launcherStyle = "solid",
  glowColor,
  buttonLabel,
  buttonShape = "circle",
  open = false,
  size = "embed",
  ariaLabelPrefix = "Open",
  onClick,
}: TextUsLauncherChipProps) {
  const label = buttonLabel?.trim() ?? "";
  const showLabel = label.length > 0 && !open;
  const customIcon = iconDataUrl?.trim() ?? "";
  const presetIcon = iconPreset?.trim() ?? "";
  const showIcon = iconEnabled && Boolean(customIcon || presetIcon);
  const textOnly = !showIcon && showLabel;
  const pill = showLabel || textOnly;
  const fabSize = size === "preview" ? PREVIEW_SIZE_PX : EMBED_SIZE_PX;
  const iconPx = size === "preview" ? 22 : 26;
  const fabShape = pill ? "rounded" : buttonShape;

  const surface = resolveLauncherFabSurfaceSx({
    style: (launcherStyle as WidgetLauncherStyleId) || "solid",
    buttonColor: buttonColor || "#1E63D5",
    buttonHoverColor: buttonHoverColor || buttonColor || "#164EB0",
    iconColor,
    shape: fabShape,
    sizePx: fabSize,
    glowColor,
  });

  const content = open ? (
    <CloseRounded sx={{ fontSize: iconPx + 4, color: iconColor }} />
  ) : (
    <>
      {showIcon ? (
        customIcon ? (
          <Box
            component="img"
            src={customIcon}
            alt=""
            sx={{ width: iconPx, height: iconPx, objectFit: "contain", display: "block" }}
          />
        ) : (
          <LauncherPresetIcon
            presetId={presetIcon as LauncherIconPresetId}
            color={iconColor}
            fontSizePx={iconPx}
          />
        )
      ) : null}
      {showLabel ? (
        <Typography
          component="span"
          sx={{
            color: iconColor,
            fontWeight: 700,
            fontSize: size === "preview" ? 12 : 14,
            lineHeight: 1.2,
            whiteSpace: "nowrap",
            maxWidth: size === "preview" ? 120 : 160,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </Typography>
      ) : null}
    </>
  );

  const widgetName = ariaLabelPrefix.trim() || "widget";
  const a11yLabel = open
    ? `Close ${widgetName}`
    : label || `Open ${widgetName === "widget" ? "chat" : widgetName}`;

  const interactive = Boolean(onClick) || size === "preview";

  return (
    <Box
      component={onClick ? "button" : "div"}
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={a11yLabel}
      sx={{
        ...(surface as object),
        display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          cursor: interactive ? "pointer" : "default",
          border: "none",
          transition: "transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease",
          ...(pill
            ? {
                gap: 0.75,
                width: "auto",
                minWidth: fabSize,
                height: fabSize,
                px: size === "preview" ? 1.5 : 2,
                borderRadius: "999px",
              }
            : {
                borderRadius: launcherShapeRadius(buttonShape),
              }),
      }}
    >
      {content}
    </Box>
  );
}
