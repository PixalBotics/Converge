"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { alpha, useTheme } from "@mui/material/styles";
import PlayArrowRounded from "@mui/icons-material/PlayArrowRounded";
import type { AppTheme } from "@/theme/theme";
import { Label, Typography } from "@/components/common";
import {
  playWidgetSound,
  unlockWidgetAudio,
  WIDGET_NOTIFICATION_SOUND_OPTIONS,
  type WidgetSoundId,
} from "@/lib/widget-runtime/widget-notifications";

export function WidgetSoundStylePicker({
  value,
  onChange,
}: {
  value: WidgetSoundId;
  onChange: (soundId: Exclude<WidgetSoundId, "none">) => void;
}) {
  const theme = useTheme() as AppTheme;
  const d = theme.app.dashboard;

  const previewSound = (soundId: Exclude<WidgetSoundId, "none">) => {
    unlockWidgetAudio();
    playWidgetSound(soundId);
  };

  return (
    <Box>
      <Label variant="mediumSmall" sx={{ mb: 0.75, color: d.textMuted, fontWeight: 600, display: "block" }}>
        Sound style
      </Label>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1,
        }}
      >
        {WIDGET_NOTIFICATION_SOUND_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <Box
              key={opt.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                p: 1,
                borderRadius: 1.5,
                border: `1px solid ${selected ? theme.palette.primary.main : d.cardBorder}`,
                bgcolor: selected ? alpha(theme.palette.primary.main, 0.08) : alpha(d.overlayLight ?? "#fff", 0.04),
                cursor: "pointer",
                transition: "border-color 0.15s ease, background-color 0.15s ease",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                },
              }}
              onClick={() => {
                onChange(opt.id);
                previewSound(opt.id);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(opt.id);
                  previewSound(opt.id);
                }
              }}
            >
              <IconButton
                type="button"
                size="small"
                aria-label={`Play ${opt.label} sound`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.id);
                  previewSound(opt.id);
                }}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                }}
              >
                <PlayArrowRounded sx={{ fontSize: 18 }} />
              </IconButton>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                  {opt.label}
                </Typography>
                <Typography variant="caption" sx={{ color: d.textMuted, lineHeight: 1.35 }}>
                  {opt.description}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
      <Typography variant="caption" sx={{ color: d.textMuted, display: "block", mt: 0.75 }}>
        Tap a sound to select and hear a preview.
      </Typography>
    </Box>
  );
}
