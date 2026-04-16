import type { Theme } from "@mui/material/styles";

export const labelStyles = (theme: Theme) =>
  ({
    display: "block",
    color: theme.app.text.primary,
    fontFamily: "Manrope",
    fontWeight: 500,
    fontSize: "16px",
    mb: 0.75,
  }) as const;

export const textFieldStyles = (theme: Theme) =>
  ({
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      position: "relative",
      overflow: "hidden",
      "& fieldset": {
        border: "none",
      },
      "&::before": {
        content: '""',
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: "2px",
        backgroundColor: theme.app.border.input,
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
        background: `radial-gradient(180px at var(--input-cursor-x, 50%) var(--input-cursor-y, 50%), ${theme.app.dashboard.accentBlue} 0%, ${theme.app.dashboard.accentBlue} 28%, transparent 82%)`,
        WebkitMask:
          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        filter: `drop-shadow(0 0 6px ${theme.app.dashboard.accentBlue})`,
        pointerEvents: "none",
      },
      "&:hover::after, &.Mui-focused::after": {
        opacity: 1,
      },
      "&.Mui-error::before": {
        backgroundColor: theme.palette.error.main,
      },
      "&.Mui-error::after": {
        background: `radial-gradient(180px at var(--input-cursor-x, 50%) var(--input-cursor-y, 50%), ${theme.palette.error.main} 0%, ${theme.palette.error.main} 28%, transparent 82%)`,
        filter: `drop-shadow(0 0 6px ${theme.palette.error.main})`,
      },
      backgroundColor: "transparent",
      boxShadow: "none",
      "& input::placeholder": {
        color: theme.app.text.placeholder,
        opacity: 1,
        fontFamily: "Manrope",
        fontWeight: 500,
        fontSize: "14px",
        lineHeight: "20px",
        letterSpacing: 0,
      },
      "& input": {
        color: theme.app.text.primary,
        caretColor: theme.app.text.primary,
      },
      "& input:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 100px transparent inset",
        boxShadow: "0 0 0 100px transparent inset",
        WebkitTextFillColor: theme.app.text.primary,
        transition: "background-color 5000s ease-in-out 0s",
      },
      "& input:-webkit-autofill:hover": {
        WebkitBoxShadow: "0 0 0 100px transparent inset",
        boxShadow: "0 0 0 100px transparent inset",
        WebkitTextFillColor: theme.app.text.primary,
      },
      "& input:-webkit-autofill:focus": {
        WebkitBoxShadow: "0 0 0 100px transparent inset",
        boxShadow: "0 0 0 100px transparent inset",
        WebkitTextFillColor: theme.app.text.primary,
      },
    },
  }) as const;
