"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { TextUsLauncherChip } from "@/components/embed/TextUsLauncherChip";
import type { LauncherIconPresetId } from "@/lib/chat-widget/launcher-icon-presets";
import type { WidgetLauncherStyleId } from "@/lib/chat-widget/launcher-style";
import type { TextUsFormFieldDraft } from "@/lib/chat-widget/widgetDraft";

export type TextUsWizardLivePreviewProps = {
  buttonColor: string;
  buttonHoverColor?: string;
  iconColor?: string;
  buttonLabel?: string;
  launcherIconPreset?: LauncherIconPresetId | string;
  launcherIconEnabled?: boolean;
  launcherStyle?: WidgetLauncherStyleId | string;
  panelBackground?: string;
  position: string;
  verticalAnchor: "top" | "bottom";
  insetBottomPx: number;
  insetTopPx: number;
  insetSidePx: number;
  boxWidth: number;
  boxHeight: number;
  headerTitle: string;
  headerLogoDataUrl?: string;
  welcomeMessage: string;
  welcomeEnabled: boolean;
  fields: TextUsFormFieldDraft[];
};

function scaledInset(px: number, max = 52): number {
  return Math.min(max, Math.max(10, Math.round(px * 0.38)));
}

function cornerPosition(
  position: string,
  verticalAnchor: "top" | "bottom",
  insetBottomPx: number,
  insetTopPx: number,
  insetSidePx: number,
) {
  const side = scaledInset(insetSidePx);
  const bottom = scaledInset(insetBottomPx);
  const top = scaledInset(insetTopPx);
  const vertical =
    verticalAnchor === "top"
      ? { top, bottom: "auto" as const }
      : { bottom: top, top: "auto" as const };

  if (position === "left") {
    return { ...vertical, left: side, right: "auto" as const, alignItems: "flex-start" as const };
  }
  if (position === "center") {
    return {
      ...vertical,
      left: "50%",
      right: "auto" as const,
      transform: "translateX(-50%)",
      alignItems: "center" as const,
    };
  }
  return { ...vertical, right: side, left: "auto" as const, alignItems: "flex-end" as const };
}

export function TextUsWizardLivePreview({
  buttonColor,
  buttonHoverColor,
  iconColor = "#ffffff",
  buttonLabel = "Text us",
  launcherIconPreset = "phosphor-chat-circle",
  launcherIconEnabled = true,
  launcherStyle = "solid",
  panelBackground = "#ffffff",
  position,
  verticalAnchor,
  insetBottomPx,
  insetTopPx,
  insetSidePx,
  boxWidth,
  boxHeight,
  headerTitle,
  headerLogoDataUrl,
  welcomeMessage,
  welcomeEnabled,
  fields,
}: TextUsWizardLivePreviewProps) {
  const theme = useTheme() as AppTheme;
  const btn = buttonColor.trim() || "#1E63D5";
  const title = headerTitle.trim() || "Text us";
  const welcome = welcomeEnabled ? welcomeMessage.trim() : "";
  const previewWidth = Math.min(300, Math.max(232, Math.round(boxWidth * 0.78)));
  const previewHeight = Math.min(340, Math.max(200, Math.round(boxHeight * 0.58)));
  const corner = cornerPosition(position, verticalAnchor, insetBottomPx, insetTopPx, insetSidePx);
  const stackDirection = verticalAnchor === "bottom" ? "column-reverse" : "column";

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 460,
        borderRadius: 2.5,
        background: `linear-gradient(165deg, #eef2f8 0%, #e2e8f0 55%, #d8dee8 100%)`,
        overflow: "hidden",
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
      }}
    >
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          top: 10,
          left: 12,
          color: theme.app.dashboard.textMuted,
          zIndex: 1,
          fontWeight: 600,
        }}
      >
        Live preview
      </Typography>

      {/* Page mock */}
      <Box
        sx={{
          position: "absolute",
          inset: "36px 16px 16px",
          borderRadius: 1.5,
          bgcolor: alpha("#fff", 0.55),
          border: `1px dashed ${alpha(theme.app.dashboard.cardBorder, 0.9)}`,
        }}
      />

      <Box
        sx={{
          position: "absolute",
          display: "flex",
          flexDirection: stackDirection,
          gap: 1.25,
          maxWidth: "92%",
          zIndex: 5,
          ...corner,
        }}
      >
        <TextUsLauncherChip
          size="preview"
          buttonColor={btn}
          buttonHoverColor={buttonHoverColor}
          iconColor={iconColor}
          iconPreset={launcherIconPreset}
          iconEnabled={launcherIconEnabled}
          launcherStyle={launcherStyle}
          buttonLabel={buttonLabel}
        />

        <Box
          sx={{
            width: previewWidth,
            height: previewHeight,
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: `0 16px 48px ${alpha("#0f172a", 0.22)}`,
            bgcolor: panelBackground,
            border: `1px solid ${alpha("#000", 0.06)}`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              bgcolor: btn,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 1,
              minHeight: 44,
            }}
          >
            {headerLogoDataUrl ? (
              <Box
                component="img"
                src={headerLogoDataUrl}
                alt=""
                sx={{ height: 24, width: "auto", maxWidth: 80, objectFit: "contain" }}
              />
            ) : null}
            <Typography
              variant="mediumLarge"
              sx={{ color: "inherit", fontWeight: 700, minWidth: 0, fontSize: 14 }}
            >
              {title}
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              p: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              bgcolor: panelBackground,
            }}
          >
            {welcome ? (
              <Box
                sx={{
                  px: 1.25,
                  py: 0.85,
                  borderRadius: 1.5,
                  bgcolor: alpha(btn, 0.08),
                  border: `1px solid ${alpha(btn, 0.12)}`,
                }}
              >
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
                  {welcome}
                </Typography>
              </Box>
            ) : null}

            {fields.slice(0, 3).map((field) => {
              const low = String(field.fieldType).toLowerCase();
              const isTextarea = low === "textarea";
              return (
                <TextField
                  key={field.key}
                  label={field.label || field.key}
                  placeholder={field.placeholder?.trim() || undefined}
                  fullWidth
                  size="small"
                  variant="outlined"
                  multiline={isTextarea}
                  minRows={isTextarea ? 2 : undefined}
                  disabled
                  value=""
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: 12,
                      bgcolor: "#fff",
                      borderRadius: 1.25,
                    },
                    "& .MuiInputLabel-root": { fontSize: 12 },
                  }}
                />
              );
            })}
            {fields.length > 3 ? (
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                +{fields.length - 3} more field{fields.length - 3 === 1 ? "" : "s"}
              </Typography>
            ) : null}

            <Box
              component="button"
              type="button"
              disabled
              sx={{
                mt: "auto",
                border: "none",
                borderRadius: 1.5,
                py: 1,
                px: 1.5,
                bgcolor: btn,
                color: "#fff",
                fontWeight: 700,
                fontSize: 12,
                cursor: "default",
                boxShadow: `0 4px 14px ${alpha(btn, 0.35)}`,
              }}
            >
              Send message
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
