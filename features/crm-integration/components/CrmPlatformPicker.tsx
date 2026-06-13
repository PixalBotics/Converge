"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { CrmPlatformItem } from "@/api/crm/crm-integration.api";
import { getCrmPlatformMeta } from "../crm-platform-meta";
import { crmPlatformCardSx, crmPlatformGridSx } from "../styles/crm-wizard-ui.styles";
import { CrmPlatformLogo } from "./CrmPlatformLogo";

export type CrmPlatformPickerProps = {
  platforms: CrmPlatformItem[];
  value: string;
  onChange: (code: string) => void;
};

export function CrmPlatformPicker({ platforms, value, onChange }: CrmPlatformPickerProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={crmPlatformGridSx}>
      {platforms.map((platform) => {
        const selected = value === platform.code;
        const meta = getCrmPlatformMeta(platform.code);
        const blurb = meta?.blurb ?? "Connect and map fields";
        const displayName = meta?.name ?? platform.name;

        return (
          <Box
            key={platform.id}
            component="button"
            type="button"
            onClick={() => onChange(platform.code)}
            aria-pressed={selected}
            sx={crmPlatformCardSx(selected)}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <CrmPlatformLogo platformCode={platform.code} size={48} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="medium" fontWeight={700} color="white">
                  {displayName}
                </Typography>
                {selected ? (
                  <Chip
                    label="Selected"
                    size="small"
                    sx={{
                      mt: 0.5,
                      height: 22,
                      fontSize: 11,
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                      color: theme.palette.primary.light,
                    }}
                  />
                ) : null}
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
              {blurb}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
