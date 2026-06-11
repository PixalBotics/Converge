"use client";

import { useMemo } from "react";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { SegmentedControlProps, SegmentedControlOption } from "./SegmentedControl.types";
import { getSegmentedControlDefaultSx, getSegmentedControlSecondarySx } from "./SegmentedControl.styles";

function normalizeOptions(
  options: string[] | SegmentedControlOption[]
): SegmentedControlOption[] {
  return options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );
}

export function SegmentedControl({
  options,
  value,
  onChange,
  variant = "default",
  size = "small",
  sx = {},
}: SegmentedControlProps) {
  const muiTheme = useTheme() as AppTheme;
  const items = normalizeOptions(options);
  const groupSx = useMemo(
    () =>
      variant === "secondary"
        ? getSegmentedControlSecondarySx(muiTheme.app)
        : getSegmentedControlDefaultSx(muiTheme.app),
    [variant, muiTheme.app]
  );

  return (
    <ToggleButtonGroup
      size={size}
      exclusive
      value={value}
      onChange={(_e, newValue) => {
        if (newValue != null) onChange(newValue);
      }}
      sx={([groupSx, sx].filter(Boolean) as SxProps<Theme>)}
      aria-label="Segment selection"
    >
      {items.map((opt) => (
        <ToggleButton key={opt.value} value={opt.value} aria-label={opt.label}>
          {opt.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
