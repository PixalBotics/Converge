"use client";

import Box from "@mui/material/Box";
import { getCrmPlatformMeta } from "../crm-platform-meta";

export type CrmPlatformLogoProps = {
  platformCode: string;
  size?: number;
};

export function CrmPlatformLogo({ platformCode, size = 44 }: CrmPlatformLogoProps) {
  const meta = getCrmPlatformMeta(platformCode);
  if (!meta) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 1.75,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "action.hover",
          fontSize: 12,
          fontWeight: 700,
          color: "text.secondary",
        }}
      >
        {platformCode.slice(0, 2).toUpperCase()}
      </Box>
    );
  }

  const fullBleed = meta.logoFullBleed === true;
  const noChrome = meta.logoNoChrome === true;
  const wide = meta.logoWide === true;
  const boxWidth = wide ? Math.round(size * 2.35) : size;

  return (
    <Box
      sx={{
        width: boxWidth,
        height: size,
        borderRadius: fullBleed ? "50%" : 1.75,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        bgcolor: meta.logoBg,
        border: fullBleed || noChrome ? "none" : `1px solid ${meta.accent}33`,
        p: fullBleed || noChrome ? 0 : 0.75,
        overflow: "hidden",
      }}
    >
      <Box
        component="img"
        src={meta.logoSrc}
        alt={`${meta.name} logo`}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: fullBleed ? "cover" : "contain",
          display: "block",
        }}
      />
    </Box>
  );
}
