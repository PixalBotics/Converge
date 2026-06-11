"use client";

import { useState } from "react";
import Menu from "@mui/material/Menu";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { hideScrollbarsSx } from "@/lib/ui/hideScrollbars";
import type { DropdownProps, DropdownOption } from "./Dropdown.types";
import { DropdownMenuRow, DropdownTrigger } from "./Dropdown.styled";

function normalizeOptions(options: string[] | DropdownOption[]): DropdownOption[] {
  return options.map((opt) => (typeof opt === "string" ? { label: opt, value: opt } : opt));
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

  const blur = String(app.dashboard.cardBackdropBlur ?? "").trim();
  const defaultPaperSx = {
    ...hideScrollbarsSx,
    mt: 1.5,
    minWidth: 180,
    maxHeight: 320,
    overflowY: "auto" as const,
    bgcolor: app.dashboard.menuSurfaceBg,
    border: `1px solid ${app.dashboard.cardBorder}`,
    borderRadius: 2,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 18px 48px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)"
        : "0 12px 32px rgba(15,23,42,0.12)",
    ...(blur && blur !== "none"
      ? { backdropFilter: blur, WebkitBackdropFilter: blur }
      : {}),
    paddingBlock: theme.spacing(0.5),
    "& .MuiList-root": { py: 0 },
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
      <DropdownTrigger
        variant={variant}
        size={size}
        sx={buttonSx}
        onClick={handleOpen}
        endIcon={endIcon ? <span style={{ marginLeft: 4, opacity: 0.85 }}>{endIcon}</span> : undefined}
        aria-controls={open ? id : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        {label}
      </DropdownTrigger>
      <Menu
        id={id}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: { sx: paperSx, elevation: 0 },
        }}
      >
        {items.map((option) => (
          <DropdownMenuRow
            key={option.value}
            onClick={() => handleSelect(option.value)}
            selected={option.value === value}
            disableRipple
          >
            {option.label}
          </DropdownMenuRow>
        ))}
      </Menu>
    </>
  );
}
