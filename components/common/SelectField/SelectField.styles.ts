import type { Theme } from "@mui/material/styles";

export const selectFieldStyles = (theme: Theme) =>
  [
    // Reuse pill input styling from InputField
    // and extend with select-specific tweaks
    {
      "& .MuiOutlinedInput-root": {
        borderRadius: "53px",
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

