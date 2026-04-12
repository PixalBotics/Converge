import type { Theme } from "@mui/material/styles";

/** Uses `app.border` + `palette.primary` so unchecked/checked colors follow appearance / accent presets. */
export const checkboxStyles = (theme: Theme) => {
  const app = theme.app;
  const primary = theme.palette.primary.main;
  return {
    width: "16px",
    height: "15.75px",
    padding: 0,
    borderRadius: "3px",
    border: `1.13px solid ${app.border.input}`,
    opacity: 1,
    "&:not(.Mui-checked) .MuiSvgIcon-root": {
      opacity: 0,
    },
    "& .MuiSvgIcon-root": {
      width: "18px",
      height: "18px",
    },
    "&.Mui-checked, &.MuiCheckbox-indeterminate": {
      borderColor: primary,
      color: primary,
    },
  } as const;
};
