"use client";

import Box from "@mui/material/Box";

/** Served from `public/assets/video/login-background.mp4` — replace that file to change the backdrop. */
export const LOGIN_BACKGROUND_VIDEO = "/assets/video/login-background.mp4";

/**
 * Full-viewport looping video behind login (muted + playsInline for autoplay policies).
 */
export function LoginVideoBackdrop() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        backgroundColor: "#000",
      }}
    >
      <Box
        component="video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        sx={{
          position: "absolute",
          left: "50%",
          top: "50%",
          minWidth: "100%",
          minHeight: "100%",
          width: "auto",
          height: "auto",
          transform: "translate(-50%, -50%)",
          objectFit: "cover",
        }}
      >
        <source src={LOGIN_BACKGROUND_VIDEO} type="video/mp4" />
      </Box>
    </Box>
  );
}
