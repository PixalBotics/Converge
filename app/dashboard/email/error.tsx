"use client";

import Box from "@mui/material/Box";
import { Button, Typography } from "@/components/common";

export default function EmailSectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Box
      sx={{
        py: 4,
        px: 2,
        maxWidth: 520,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Typography variant="regularLarge" fontWeight={700} color="white">
        Email section failed to load
      </Typography>
      <Typography variant="small" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
        {error.message?.trim() ||
          "An unexpected error occurred. Try again or return to the dashboard."}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
        <Button type="button" variant="primary" size="small" onClick={() => reset()}>
          Try again
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="small"
          onClick={() => {
            window.location.href = "/dashboard/email";
          }}
        >
          Email home
        </Button>
      </Box>
    </Box>
  );
}
