"use client";

import ChatRounded from "@mui/icons-material/ChatRounded";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { LauncherPresetIcon } from "@/lib/chat-widget/launcherIcons";
import {
  LAUNCHER_ICON_PRESETS,
  type LauncherIconPresetId,
} from "@/lib/chat-widget/launcher-icon-presets";

export function WidgetLauncherIconPicker({
  buttonColor,
  hoverColor,
  iconColor,
  launcherIconPreset,
  iconDataUrl,
  onSelectPreset,
  onSelectDefault,
}: {
  buttonColor: string;
  hoverColor: string;
  iconColor: string;
  launcherIconPreset: LauncherIconPresetId;
  iconDataUrl: string;
  onSelectPreset: (id: LauncherIconPresetId) => void;
  onSelectDefault: () => void;
}) {
  const theme = useTheme() as AppTheme;
  const fabBg = buttonColor || "#2AA9E0";
  const fabHover = hoverColor || "#1C8DC2";
  const glyph = iconColor || "#FFFFFF";

  const chipSx = (selected: boolean) => ({
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: `2px solid ${selected ? theme.app.dashboard.accentBlue : theme.app.dashboard.cardBorder}`,
    bgcolor: fabBg,
    "&:hover": { bgcolor: fabHover },
  });

  return (
    <Box>
      <Typography variant="medium" sx={{ color: theme.app.text.primary, fontWeight: 600, mb: 0.5 }}>
        Launcher icon
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
        Pick a built-in icon (chat, phone, message…). These are vector icons — not your header logo.
        Upload a custom launcher image on the chat button step if you use Chat + Text Us.
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(48px, 1fr))",
          gap: 1,
          maxHeight: 220,
          overflowY: "auto",
          pr: 0.5,
          mb: 1.25,
        }}
      >
        <IconButton
          type="button"
          onClick={onSelectDefault}
          title="Simple chat icon"
          sx={chipSx(launcherIconPreset === "" && !iconDataUrl)}
        >
          <ChatRounded sx={{ color: glyph, fontSize: 24 }} />
        </IconButton>
        {LAUNCHER_ICON_PRESETS.map((preset) => {
          const selected = !iconDataUrl && launcherIconPreset === preset.id;
          return (
            <IconButton
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.id)}
              title={preset.label}
              sx={chipSx(selected)}
            >
              <LauncherPresetIcon presetId={preset.id} color={glyph} fontSizePx={26} />
            </IconButton>
          );
        })}
      </Box>
    </Box>
  );
}
