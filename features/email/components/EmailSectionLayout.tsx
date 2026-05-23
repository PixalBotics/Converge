"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
/** Optional page title for screens like Email design (main nav lives in email layout). */
export function EmailSectionLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const theme = useTheme() as AppTheme;

  return (
    <>
      <Box sx={{ mb: 1.5 }}>
        <Typography
          variant="regularLarge"
          fontWeight={700}
          sx={{ color: theme.app.text.primary, mb: description ? 0.5 : 0 }}
        >
          {title}
        </Typography>
        {description ? (
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {children}
    </>
  );
}
