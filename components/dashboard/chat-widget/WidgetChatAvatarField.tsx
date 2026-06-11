"use client";

import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { ChangeEvent, RefObject } from "react";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import type {
  AgentAvatarPresetId,
  VisitorAvatarPresetId,
} from "@/lib/chat-widget/chat-avatar-presets";
import { WidgetChatAvatarBubble } from "@/lib/chat-widget/widget-chat-avatar-svg";
import { WidgetChatAvatarPicker } from "./WidgetChatAvatarPicker";

export function WidgetChatAvatarField({
  title,
  subtitle,
  enabled,
  onEnabledChange,
  fileName,
  dataUrl,
  preset,
  accentColor,
  uploadRef,
  onUpload,
  onClear,
  onSelectPreset,
  variant = "agent",
}: {
  title: string;
  subtitle: string;
  enabled: boolean;
  onEnabledChange: (checked: boolean) => void;
  fileName: string;
  dataUrl: string;
  preset: AgentAvatarPresetId | VisitorAvatarPresetId;
  accentColor: string;
  uploadRef: RefObject<HTMLInputElement | null>;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onSelectPreset: (id: AgentAvatarPresetId | VisitorAvatarPresetId) => void;
  variant?: "agent" | "visitor";
}) {
  const theme = useTheme() as AppTheme;
  const hasCustomImage = Boolean(dataUrl?.trim());

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
        <Box>
          <Typography variant="body2" sx={{ color: theme.app.text.primary, fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            {subtitle}
          </Typography>
        </Box>
        <Switch checked={enabled} onChange={(_, checked) => onEnabledChange(checked)} color="success" />
      </Box>
      {enabled ? (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1 }}>
            <WidgetChatAvatarBubble
              avatarUrl={dataUrl}
              preset={preset}
              variant={variant}
              accentColor={accentColor}
              size={44}
            />
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
              {hasCustomImage ? "Custom image in use." : "Phosphor icon preset selected."}
            </Typography>
          </Box>
          <WidgetChatAvatarPicker
            variant={variant}
            preset={preset}
            accentColor={accentColor}
            hasCustomImage={hasCustomImage}
            onSelectPreset={onSelectPreset}
          />
          <Box
            role="button"
            tabIndex={0}
            onClick={() => uploadRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                uploadRef.current?.click();
              }
            }}
            sx={{
              border: `1px dashed ${theme.app.dashboard.accentBlue}`,
              borderRadius: 1.5,
              py: 1.5,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(6, 12, 54, 0.4)",
              gap: 0.5,
              cursor: "pointer",
            }}
          >
            <CloudUploadOutlined sx={{ color: theme.app.dashboard.accentBlue, fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              Or upload custom image
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              {fileName || "PNG, JPG, or SVG — max 10 MB"}
            </Typography>
          </Box>
          {hasCustomImage ? (
            <Button type="button" variant="secondary" size="small" onClick={onClear} sx={{ mt: 1 }}>
              Use icon preset
            </Button>
          ) : null}
          <input ref={uploadRef} type="file" accept="image/*,.svg" hidden onChange={onUpload} />
        </>
      ) : null}
    </Box>
  );
}
