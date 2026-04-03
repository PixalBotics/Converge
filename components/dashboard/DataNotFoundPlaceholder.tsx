"use client";

import Box from "@mui/material/Box";
import { Typography } from "@/components/common";

export function DataNotFoundPlaceholder() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        color: "text.secondary",
      }}
    >
      <Typography variant="h6" color="inherit">
        Coming Soon....
      </Typography>
    </Box>
  );
}
