"use client";

import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button } from "@/components/common/Button";
import type { ButtonProps } from "@/components/common/Button/Button.types";
import { searchSubmitButtonToolbarMetrics } from "./searchToolbarMetrics";

export type SearchSubmitButtonProps = Pick<ButtonProps, "disabled" | "onClick" | "sx" | "type">;

const searchSubmitButtonLayoutSx = {
  minWidth: 132,
  whiteSpace: "nowrap",
  alignSelf: { xs: "stretch", sm: "center" },
} as const;

/** Applied search matches draft — muted pill (matches {@link SearchBar}). */
export const searchSubmitButtonIdleSx = (theme: Theme): SxProps<Theme> => {
  const app = (theme as AppTheme).app;
  return {
    ...searchSubmitButtonLayoutSx,
    "&&": {
      backgroundColor: "transparent",
      borderColor: app.dashboard.cardBorder,
      color: app.text.primary,
    },
    "&&:hover": {
      backgroundColor: "transparent",
      borderColor: app.dashboard.cardBorder,
    },
  };
};

/** Draft differs from applied search — accent primary (theme yellow/blue). */
export const searchSubmitButtonActiveSx = (): SxProps<Theme> => searchSubmitButtonLayoutSx;

/** Primary toolbar “Search” action — text only (no magnifier icon). */
export function SearchSubmitButton({
  disabled = false,
  onClick,
  sx,
  type = "button",
}: SearchSubmitButtonProps) {
  const theme = useTheme();
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];

  return (
    <Button
      type={type}
      variant={disabled ? "outlined" : "primary"}
      disabled={disabled}
      onClick={onClick}
      sx={[
        searchSubmitButtonToolbarMetrics,
        disabled ? searchSubmitButtonIdleSx(theme) : searchSubmitButtonActiveSx(),
        ...extraSx,
      ]}
    >
      Search
    </Button>
  );
}
