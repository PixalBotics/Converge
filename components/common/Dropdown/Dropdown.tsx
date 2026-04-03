"use client";

import { useMemo, useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { DropdownProps, DropdownOption } from "./Dropdown.types";

function normalizeOptions(options: string[] | DropdownOption[]): DropdownOption[] {
  return options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );
}

/** Spacing only — `MuiMenu` theme override supplies glass + borders from dashboard tokens */
function defaultPaperSx(theme: AppTheme) {
  return {
    mt: 1.5,
    minWidth: 168,
    "& .MuiMenuItem-root": {
      fontSize: 14,
    },
  };
}

export function Dropdown({
  options,
  value,
  onChange,
  triggerLabel,
  endIcon = "▾",
  buttonSx,
  menuPaperSx,
  size = "small",
  variant = "outlined",
  id = "dropdown-menu",
}: DropdownProps) {
  const theme = useTheme<AppTheme>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const items = normalizeOptions(options);
  const selected = items.find((o) => o.value === value);
  const label = triggerLabel ?? selected?.label ?? value;
  const open = Boolean(anchorEl);

  const paperSx = useMemo(() => {
    const base = defaultPaperSx(theme);
    if (!menuPaperSx) return base;
    const extra = typeof menuPaperSx === "object" && menuPaperSx !== null ? menuPaperSx : {};
    return { ...base, ...extra };
  }, [theme, menuPaperSx]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    handleClose();
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        sx={buttonSx}
        onClick={handleOpen}
        endIcon={endIcon ? <span style={{ marginLeft: 4 }}>{endIcon}</span> : undefined}
        aria-controls={open ? id : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        {label}
      </Button>
      <Menu
        id={id}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: { sx: paperSx },
        }}
      >
        {items.map((option) => (
          <MenuItem key={option.value} onClick={() => handleSelect(option.value)}>
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
