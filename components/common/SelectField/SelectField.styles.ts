import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

/** MUI Select menu panel — matches header/surface theme (not fixed navy). */
export function selectMenuPaperSx(theme: Theme) {
  const app = (theme as AppTheme).app;
  return {
    // Higher opacity so the table behind doesn't "bleed" through.
    bgcolor: app.dashboard.menuSurfaceBg,
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    borderRadius: 2,
    mt: 1,
    border: `1px solid ${app.dashboard.cardBorder}`,
    boxShadow: "0 18px 45px rgba(0,0,0,0.35)",
  };
}

/** MUI Select menu rows — text + accent-tinted selection. */
export function selectMenuItemSx(theme: Theme) {
  const app = (theme as AppTheme).app;
  const accent = app.dashboard.accentBlue;
  return {
    fontFamily: "Manrope",
    fontSize: 14,
    color: app.text.primary,
    cursor: "pointer",
    "&.Mui-selected": {
      bgcolor: alpha(accent, 0.32),
    },
    "&.Mui-selected:hover": {
      bgcolor: alpha(accent, 0.42),
    },
  };
}

export const selectFieldStyles = (theme: Theme) =>
  [
    // Reuse pill input styling from InputField
    // and extend with select-specific tweaks
    {
      "& .MuiOutlinedInput-root": {
        borderRadius: "12px",
        "&::after": {
          borderRadius: "12px",
        },
      },
      "& .MuiSelect-select": {
        color: theme.app.text.placeholder,
        fontFamily: "Manrope",
        fontWeight: 500,
        fontSize: "14px",
      },
      "& .MuiSelect-icon": {
        color: theme.app.text.placeholder,
      },
    },
  ] as const;

