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
      borderRadius: "53px",
      "& fieldset": {
        borderRadius: "53px",
        borderColor: theme.app.border.input,
        transition: "border-color 0.2s ease, box-shadow 0.25s ease",
      },
      "&:hover fieldset": {
        borderColor: theme.app.border.input,
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.app.border.inputFocus,
        borderWidth: "1px",
        boxShadow: `0 0 14px ${theme.app.shadow.inputFocus}`,
      },
      backgroundColor: "transparent",
      boxShadow: `0px 0px 3px 0px ${theme.app.grey.inputShadowLight} inset, 0px 0px 3px 0px ${theme.app.grey.inputShadowWhite80} inset, -1px -1px 0.5px -1px ${theme.app.grey.inputShadowWhite} inset, 1px 1px 0.5px -1px ${theme.app.grey.inputShadowWhite} inset, -1px -1px 0px -0.5px ${theme.app.grey.inputShadowDark} inset, 1px 1px 0px -0.5px ${theme.app.grey.inputShadowDarker} inset`,
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
