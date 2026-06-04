"use client";

import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Link from "@mui/material/Link";
import { useTheme, alpha } from "@mui/material/styles";
import { Typography } from "@/components/common";
import type { AppTheme } from "@/theme/theme";
import type { PocListRow } from "../page";

function pocInitials(name: string): string {
  const parts = name
    .split(/\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
}

function DetailChip({ label }: { label: string }) {
  const theme = useTheme() as AppTheme;
  const text = label.trim() || "—";
  if (text === "—") return null;
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        px: 1,
        py: 0.25,
        borderRadius: "9999px",
        fontSize: "0.7rem",
        fontWeight: 500,
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        bgcolor:
          theme.palette.mode === "light"
            ? theme.app.dashboard.blueTintBg
            : "rgba(59, 130, 246, 0.2)",
        color: theme.palette.mode === "light" ? "#111827" : "#fff",
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
      }}
      title={text}
    >
      {text}
    </Box>
  );
}

type Props = {
  contact: PocListRow;
};

export function PocContactCard({ contact }: Props) {
  const theme = useTheme() as AppTheme;
  const email = contact.pocEmail.trim();
  const hasEmail = email.length > 0 && email !== "—";

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.95)}`,
        bgcolor: alpha(theme.app.dashboard.white95, 0.04),
        display: "flex",
        gap: 1.25,
        alignItems: "flex-start",
        transition: "border-color 160ms ease, background-color 160ms ease",
        "&:hover": {
          borderColor: alpha(theme.palette.primary.main, 0.45),
          bgcolor: alpha(theme.palette.primary.main, 0.06),
        },
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
          bgcolor: theme.app.dashboard.buttonIndigo,
          color: theme.app.text.primary,
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
        }}
      >
        {pocInitials(contact.pocName)}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" color="white" fontWeight={600} noWrap>
          {contact.pocName}
        </Typography>
        {hasEmail ? (
          <Link
            href={`mailto:${email}`}
            variant="caption"
            sx={{
              display: "block",
              color: theme.app.dashboard.accentBlue,
              fontWeight: 500,
              textDecoration: "none",
              mt: 0.25,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {email}
          </Link>
        ) : (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
            No email
          </Typography>
        )}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.75 }}>
          <DetailChip label={contact.designationTitle} />
          <DetailChip label={contact.departmentName} />
        </Box>
      </Box>
    </Box>
  );
}
