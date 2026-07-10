"use client";

import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Typography } from "@/components/common";
import { resolveBannerMediaSx } from "@/lib/chat-widget/banner-media-height";

export function WidgetMediaUploadPreview({
  uploadLabel,
  fileName,
  previewUrl,
  mediaType = "image",
  previewHeightPx,
  onPick,
  onClear,
  clearLabel = "Remove",
}: {
  uploadLabel: string;
  fileName?: string;
  previewUrl?: string;
  mediaType?: "image" | "video";
  /** Omit or `0` = auto height from media aspect ratio. */
  previewHeightPx?: number;
  onPick: () => void;
  onClear?: () => void;
  clearLabel?: string;
}) {
  const theme = useTheme() as AppTheme;
  const hasPreview = Boolean(previewUrl?.trim());
  const fixedH = previewHeightPx != null && previewHeightPx > 0 ? previewHeightPx : 0;
  const mediaSx = resolveBannerMediaSx(fixedH, {
    bgcolor: mediaType === "video" ? "#000" : "rgba(15,23,42,0.06)",
  });

  return (
    <Box>
      <Box
        role="button"
        tabIndex={0}
        onClick={onPick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onPick();
          }
        }}
        sx={{
          border: `1px dashed ${theme.app.dashboard.accentBlue}`,
          borderRadius: 1.5,
          overflow: "hidden",
          bgcolor: "rgba(6, 12, 54, 0.4)",
          cursor: "pointer",
        }}
      >
        {hasPreview ? (
          <Box sx={{ position: "relative" }}>
            {mediaType === "video" ? (
              <Box
                component="video"
                src={previewUrl}
                muted
                playsInline
                controls
                onClick={(e) => e.stopPropagation()}
                sx={mediaSx}
              />
            ) : (
              <Box component="img" src={previewUrl} alt="" sx={mediaSx} />
            )}
            <Box
              sx={{
                px: 1.25,
                py: 0.75,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                borderTop: `1px solid ${theme.app.dashboard.cardBorder}`,
              }}
            >
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
                {fileName || "Uploaded file"} — click to replace
              </Typography>
              <CloudUploadOutlined sx={{ color: theme.app.dashboard.accentBlue, fontSize: 18 }} />
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              py: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.75,
              minHeight: 96,
            }}
          >
            <CloudUploadOutlined sx={{ color: theme.app.dashboard.accentBlue }} />
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              {uploadLabel}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
              {fileName || "Max 10 MB files are allowed"}
            </Typography>
          </Box>
        )}
      </Box>
      {hasPreview && onClear ? (
        <Button type="button" variant="secondary" size="small" onClick={onClear} sx={{ mt: 1 }}>
          {clearLabel}
        </Button>
      ) : null}
    </Box>
  );
}
