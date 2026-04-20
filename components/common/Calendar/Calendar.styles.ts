import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";

export const calendarFieldStyles = (theme: Theme) => {
  const app = (theme as AppTheme).app;
  const hoverTintBase = app.dashboard.overlayLight ?? app.dashboard.overlayMedium ?? app.dashboard.pillBg ?? "#1f2a44";
  return {
    "& .MuiPickersOutlinedInput-root": {
      borderRadius: "12px",
      position: "relative",
      overflow: "hidden",
      "& fieldset": {
        border: "none",
      },
      "& .MuiPickersOutlinedInput-notchedOutline": {
        border: "none",
      },
      "&::before": {
        content: '""',
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "2px",
        backgroundColor: app.border.input,
        pointerEvents: "none",
      },
      "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        padding: "1.5px",
        borderRadius: "12px",
        opacity: 0,
        transition: "opacity 0.1s ease",
        background: `radial-gradient(180px at var(--input-cursor-x, 50%) var(--input-cursor-y, 50%), ${app.dashboard.accentBlue} 0%, ${app.dashboard.accentBlue} 28%, transparent 82%)`,
        WebkitMask:
          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        filter: `drop-shadow(0 0 6px ${app.dashboard.accentBlue})`,
        pointerEvents: "none",
      },
      "&:hover::after, &.Mui-focused::after": {
        opacity: 1,
      },
    },
    "& .MuiInputBase-input": {
      color: app.text.primary,
      fontFamily: "Manrope",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "20px",
      colorScheme: theme.palette.mode,
    },
    "& .MuiPickersInputBase-input": {
      color: app.text.primary,
      fontFamily: "Manrope",
      fontWeight: 500,
      fontSize: "14px",
      lineHeight: "20px",
      "&::placeholder": {
        color: app.text.placeholder,
        opacity: 1,
      },
    },
    "& .MuiInputAdornment-root .MuiIconButton-root": {
      color: app.text.placeholder,
      borderRadius: "9999px",
      "&:hover": {
        backgroundColor: alpha(hoverTintBase, 0.7),
        color: app.text.primary,
      },
    },
  } as const;
};
