"use client";

import { useState } from "react";
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
  const theme = useTheme() as AppTheme;
  const app = theme.app;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const items = normalizeOptions(options);
  const selected = items.find((o) => o.value === value);
  const label = triggerLabel ?? selected?.label ?? value;
  const open = Boolean(anchorEl);

  const defaultPaperSx = {
    mt: 1.5,
    minWidth: 160,
    bgcolor: app.dashboard.menuSurfaceBg,
    border: `1px solid ${app.dashboard.cardBorder}`,
    borderRadius: 2,
    "& .MuiMenuItem-root": {
      color: app.text.primary,
      fontSize: 14,
    },
    "& .MuiMenuItem-root:hover": {
      bgcolor: app.dashboard.overlayMedium,
    },
  };

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

  const paperSx = menuPaperSx
    ? { ...defaultPaperSx, ...(typeof menuPaperSx === "object" && menuPaperSx !== null ? menuPaperSx : {}) }
    : defaultPaperSx;

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
