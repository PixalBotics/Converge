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
        color: "rgba(255,255,255,0.6)",
      }}
    >
      <Typography variant="h6" color="inherit">
        Coming Soon....
      </Typography>
    </Box>
  );
}
