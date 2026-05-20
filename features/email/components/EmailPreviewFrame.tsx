"use client";

import Box from "@mui/material/Box";

export function EmailPreviewFrame({ html, title }: { html: string; title?: string }) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.12)",
        bgcolor: "#fff",
        minHeight: 360,
      }}
    >
      <iframe
        title={title ?? "Email preview"}
        srcDoc={html}
        sandbox=""
        style={{ width: "100%", minHeight: 360, border: 0, display: "block" }}
      />
    </Box>
  );
}
