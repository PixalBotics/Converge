"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import HubOutlined from "@mui/icons-material/HubOutlined";
import LinkOutlined from "@mui/icons-material/LinkOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { CrmConnectionMethod } from "@/api/crm/crm-integration.api";
import { mergeSx } from "@/lib/mui/merge-sx";
import { emailFormTypeChoiceCardSx } from "@/features/email/styles/email-form-builder.styles";

export type CrmConnectionMethodPickerProps = {
  options: CrmConnectionMethod[];
  value: string | null;
  onChange: (methodId: string) => void;
};

export function CrmConnectionMethodPicker({
  options,
  value,
  onChange,
}: CrmConnectionMethodPickerProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
        gap: 1.5,
      }}
    >
      {options.map((option) => {
        const selected = value === option.id;
        const disabled = !option.available;
        const Icon =
          option.id.includes("form") || option.id.includes("web") ? LinkOutlined : HubOutlined;

        return (
          <Box
            key={option.id}
            component="button"
            type="button"
            onClick={() => {
              if (!disabled) onChange(option.id);
            }}
            aria-pressed={selected}
            aria-disabled={disabled}
            sx={mergeSx(emailFormTypeChoiceCardSx(selected), {
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 1.25,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.72 : 1,
              minHeight: 112,
            })}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                bgcolor: alpha(theme.palette.primary.main, 0.22),
                color: theme.palette.primary.light,
              }}
            >
              <Icon />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.35 }}>
                <Typography variant="medium" fontWeight={700} color="white">
                  {option.label}
                </Typography>
                {option.recommended ? (
                  <Chip
                    label="Recommended"
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 11,
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.success.main, 0.18),
                      color: theme.palette.success.light,
                    }}
                  />
                ) : null}
                {option.comingSoonLabel ? (
                  <Chip
                    label={option.comingSoonLabel}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: 11,
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.warning.main, 0.18),
                      color: theme.palette.warning.light,
                    }}
                  />
                ) : null}
              </Box>
              <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.45 }}>
                {option.description}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
