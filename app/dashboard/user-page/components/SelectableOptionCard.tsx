"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import { alpha } from "@mui/material/styles";
import { DashboardCard, Typography } from "@/components/common";
import type { AppTheme } from "@/theme/theme";

export type SelectableOptionAccent = "green" | "blue" | "purple" | "indigo" | "neutral";

function accentColor(theme: AppTheme, accent: SelectableOptionAccent): string {
  const d = theme.app.dashboard;
  switch (accent) {
    case "green":
      return d.accentGreen;
    case "blue":
      return d.accentBlue;
    case "purple":
      return d.accentPurple;
    case "indigo":
      return d.accentIndigo;
    default:
      return d.accentBlue;
  }
}

export function selectableRadioIcons(theme: AppTheme, accent: SelectableOptionAccent) {
  const d = theme.app.dashboard;
  const tint = accentColor(theme, accent);
  return {
    icon: (
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: "9999px",
          border: `2px solid ${d.radioInactiveBorder}`,
          bgcolor: "transparent",
        }}
      />
    ),
    checkedIcon: (
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: "9999px",
          bgcolor: tint,
          boxShadow: `0 0 0 3px ${alpha(tint, 0.35)}`,
        }}
      />
    ),
  };
}

export function selectableOptionCardSx(
  theme: AppTheme,
  params: {
    selected: boolean;
    disabled: boolean;
    inactive: boolean;
    accent: SelectableOptionAccent;
  },
) {
  const tint = accentColor(theme, params.accent);
  const d = theme.app.dashboard;

  return {
    p: { xs: 1.5, sm: 1.75 },
    height: "100%",
    borderRadius: 2,
    cursor: params.inactive ? "default" : "pointer",
    opacity: params.disabled ? 0.5 : 1,
    pointerEvents: params.inactive ? "none" : "auto",
    background: params.selected ? d.pillActive : d.menuSurfaceBg,
    boxShadow: params.selected
      ? `inset 3px 0 0 0 ${tint}, 0 0 0 1px ${alpha(tint, 0.5)}`
      : `inset 0 0 0 1px ${alpha(d.cardBorder, 0.35)}`,
    transition: "box-shadow 0.15s ease, background 0.15s ease",
    ...(!params.inactive && {
      "&:hover": {
        boxShadow: params.selected
          ? `inset 3px 0 0 0 ${tint}, 0 0 0 1px ${alpha(tint, 0.65)}`
          : `inset 0 0 0 1px ${alpha(tint, 0.4)}`,
      },
    }),
  };
}

type SelectableOptionCardProps = {
  theme: AppTheme;
  title: string;
  /** Short subtitle only — keep under ~40 characters. */
  subtitle?: string;
  selected: boolean;
  disabled?: boolean;
  selectionLocked?: boolean;
  onSelect: () => void;
  accent?: SelectableOptionAccent;
  value?: string;
};

export function SelectableOptionCard({
  theme,
  title,
  subtitle,
  selected,
  disabled = false,
  selectionLocked = false,
  onSelect,
  accent = "neutral",
  value,
}: SelectableOptionCardProps) {
  const inactive = disabled || selectionLocked;
  const d = theme.app.dashboard;
  const { icon, checkedIcon } = selectableRadioIcons(theme, accent);

  return (
    <DashboardCard
      sx={selectableOptionCardSx(theme, { selected, disabled, inactive, accent })}
      onClick={() => {
        if (inactive) return;
        onSelect();
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
        <Radio
          checked={selected}
          onChange={onSelect}
          value={value ?? title}
          disabled={inactive}
          disableRipple
          icon={icon}
          checkedIcon={checkedIcon}
          sx={{ p: 0.25, mt: 0.05, flexShrink: 0 }}
        />
        <Box sx={{ minWidth: 0, pt: 0.1 }}>
          <Typography
            variant="medium"
            sx={{
              color: d.white95,
              lineHeight: 1.3,
              fontWeight: selected ? 600 : 500,
              fontSize: "0.9rem",
            }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography
              variant="small"
              sx={{
                color: d.white65,
                lineHeight: 1.35,
                mt: 0.35,
                fontSize: "0.75rem",
              }}
            >
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </DashboardCard>
  );
}

export function SelectableOptionsSection({
  theme,
  title,
  hint,
  children,
  lockedHint,
}: {
  theme: AppTheme;
  title: string;
  hint?: string;
  children: ReactNode;
  lockedHint?: string;
}) {
  const d = theme.app.dashboard;

  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography
        variant="body2"
        fontWeight={600}
        sx={{ color: d.white95, mb: hint || lockedHint ? 0.35 : 1.25 }}
      >
        {title}
      </Typography>
      {hint ? (
        <Typography
          variant="caption"
          sx={{ color: d.white65, display: "block", mb: 1.25, lineHeight: 1.45 }}
        >
          {hint}
        </Typography>
      ) : null}
      {lockedHint ? (
        <Typography
          variant="caption"
          sx={{
            color: d.accentBlue,
            display: "block",
            mb: 1.25,
            lineHeight: 1.45,
          }}
        >
          {lockedHint}
        </Typography>
      ) : null}
      {children}
    </Box>
  );
}
