"use client";

import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import OpenInNewOutlined from "@mui/icons-material/OpenInNewOutlined";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { VisitorLocation } from "../utils/visitor-info";
import { LocationMapFrame } from "../styles/chat-operations.styled";

interface VisitorLocationMapProps {
  location: VisitorLocation | null;
}

function buildMapEmbedSrc(location: VisitorLocation): string | null {
  const { latitude, longitude, label } = location;
  if (latitude != null && longitude != null) {
    const pad = 0.04;
    const minLon = longitude - pad;
    const maxLon = longitude + pad;
    const minLat = latitude - pad;
    const maxLat = latitude + pad;
    const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  }
  if (label.trim()) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(label)}&z=11&output=embed`;
  }
  return null;
}

function buildExternalMapHref(location: VisitorLocation): string {
  const { latitude, longitude, label } = location;
  if (latitude != null && longitude != null) {
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=12/${latitude}/${longitude}`;
  }
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(label)}`;
}

export function VisitorLocationMap({ location }: VisitorLocationMapProps) {
  const theme = useTheme() as AppTheme;

  if (!location?.label && location?.latitude == null) {
    return (
      <Box
        sx={{
          py: 2,
          px: 1.5,
          borderRadius: 2,
          border: `1px dashed ${alpha(theme.app.dashboard.cardBorder, 0.65)}`,
          textAlign: "center",
        }}
      >
        <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted, fontSize: 12 }}>
          Location unavailable for this session
        </Typography>
      </Box>
    );
  }

  const embedSrc = buildMapEmbedSrc(location);
  const externalHref = buildExternalMapHref(location);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
        <LocationOnOutlined sx={{ fontSize: 18, color: theme.palette.primary.light }} />
        <Typography variant="medium" color="white" fontWeight={600} sx={{ fontSize: 14 }}>
          {location.label}
        </Typography>
      </Box>

      {embedSrc ? (
        <LocationMapFrame>
          <iframe
            title={`Map — ${location.label}`}
            src={embedSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </LocationMapFrame>
      ) : null}

      <Link
        href={externalHref}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          mt: 1,
          fontSize: 12,
          fontWeight: 600,
          color: theme.app.dashboard.accentBlue,
          textDecoration: "none",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        Open in maps
        <OpenInNewOutlined sx={{ fontSize: 14 }} />
      </Link>
    </Box>
  );
}

