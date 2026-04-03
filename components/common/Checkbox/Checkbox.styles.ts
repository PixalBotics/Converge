import type { Theme } from "@mui/material/styles";

export const checkboxStyles = (theme: Theme) =>
  ({
    width: "16px",
    height: "15.75px",
    padding: 0,
    borderRadius: "3px",
    border: `1.13px solid ${theme.app.grey.checkboxBorder}`,
    opacity: 1,
    "&:not(.Mui-checked) .MuiSvgIcon-root": {
      opacity: 0,
    },
    "& .MuiSvgIcon-root": {
      width: "18px",
      height: "18px",
    },
    "&.Mui-checked": {
      borderColor: theme.palette.primary.main,
    },
  }) as const;
