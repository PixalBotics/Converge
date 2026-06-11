"use client";

import Box from "@mui/material/Box";

export function EmbedTypingDots({ color }: { color: string }) {
  return (
    <Box
      aria-label="Agent is typing"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        py: 0.25,
        color,
        "& span": {
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: "currentColor",
          opacity: 0.45,
          animation: "embedTypingBounce 1.2s ease-in-out infinite",
          "&:nth-of-type(2)": { animationDelay: "0.15s" },
          "&:nth-of-type(3)": { animationDelay: "0.3s" },
        },
        "@keyframes embedTypingBounce": {
          "0%, 60%, 100%": { opacity: 0.35, transform: "translateY(0)" },
          "30%": { opacity: 1, transform: "translateY(-3px)" },
        },
      }}
    >
      <span />
      <span />
      <span />
    </Box>
  );
}
