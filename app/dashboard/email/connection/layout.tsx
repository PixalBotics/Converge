"use client";

import Box from "@mui/material/Box";

export default function EmailConnectionLayout({ children }: { children: React.ReactNode }) {
  return <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>{children}</Box>;
}
