"use client";

import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";

type ChatMessageAttachmentCardProps = {
  href: string;
  title: string;
  subtitle?: string;
  formKind?: "distribution" | "close" | string;
};

function formKindLabel(kind: string | undefined): string {
  if (kind === "distribution") return "Distribution form";
  if (kind === "close") return "Wrap-up form";
  return "Form";
}

export function ChatMessageAttachmentCard({
  href,
  title,
  subtitle,
  formKind,
}: ChatMessageAttachmentCardProps) {
  const theme = useTheme() as AppTheme;
  const accent = theme.app.dashboard.accentBlue;

  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.25,
        mt: 0.75,
        p: 1.25,
        borderRadius: 1.5,
        textDecoration: "none",
        color: "inherit",
        border: `1px solid ${alpha(accent, 0.35)}`,
        bgcolor: alpha(accent, 0.1),
        transition: "background-color 0.15s ease, border-color 0.15s ease",
        "&:hover": {
          bgcolor: alpha(accent, 0.16),
          borderColor: alpha(accent, 0.55),
        },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(accent, 0.2),
          color: accent,
        }}
      >
        <DescriptionOutlined sx={{ fontSize: 20 }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.3,
            textTransform: "uppercase",
            color: accent,
            mb: 0.25,
          }}
        >
          {formKindLabel(formKind)}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, color: "inherit" }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 0.35,
              color: theme.app.dashboard.textMuted,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      <OpenInNewOutlined sx={{ fontSize: 18, flexShrink: 0, opacity: 0.75, mt: 0.25 }} />
    </Box>
  );
}
