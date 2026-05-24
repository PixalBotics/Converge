"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import HubOutlined from "@mui/icons-material/HubOutlined";
import MailOutline from "@mui/icons-material/MailOutline";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  DISTRIBUTION_METHOD_OPTIONS,
  type DistributionMethodOption,
} from "../distribution-method.constants";
import type { DistributionWizardMethod } from "../wizard-storage";

export type DistributionMethodPickerProps = {
  value: DistributionWizardMethod | null;
  onChange: (method: DistributionWizardMethod) => void;
};

function MethodIcon({ option }: { option: DistributionMethodOption }) {
  const theme = useTheme() as AppTheme;
  const Icon = option.id === "email" ? MailOutline : HubOutlined;
  return (
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
  );
}

export function DistributionMethodPicker({ value, onChange }: DistributionMethodPickerProps) {
  const theme = useTheme() as AppTheme;

  const handleSelect = (option: DistributionMethodOption) => {
    if (!option.available) return;
    onChange(option.id);
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
        gap: 1.5,
      }}
    >
      {DISTRIBUTION_METHOD_OPTIONS.map((option) => {
        const selected = value === option.id;
        const disabled = !option.available;
        return (
          <Box
            key={option.id}
            component="button"
            type="button"
            onClick={() => handleSelect(option)}
            aria-pressed={selected}
            aria-disabled={disabled}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.25,
              p: 1.5,
              textAlign: "left",
              borderRadius: 1.5,
              border: `1px solid ${
                selected
                  ? alpha(theme.palette.primary.main, 0.65)
                  : alpha(theme.app.dashboard.cardBorder, 0.9)
              }`,
              bgcolor: selected
                ? alpha(theme.palette.primary.main, 0.12)
                : alpha(theme.app.dashboard.pillBg, 0.35),
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.72 : 1,
              transition: "border-color 0.15s ease, background-color 0.15s ease",
              "&:hover": disabled
                ? {}
                : {
                    borderColor: alpha(theme.palette.primary.main, 0.45),
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
            }}
          >
            <MethodIcon option={option} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.35 }}>
                <Typography variant="medium" fontWeight={700} color="white">
                  {option.label}
                </Typography>
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
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`,
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
