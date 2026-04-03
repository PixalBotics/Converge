"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import { useTheme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { SearchBarProps } from "./SearchBar.types";
import { SearchIcon } from "@/components/dashboard/icons/SearchIcon";

export function SearchBar({ value, onChange, placeholder = "Search anything..", sx }: SearchBarProps) {
  const theme = useTheme();
  const handleClear = () => onChange("");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 2,
        py: 1,
        borderRadius: "9999px",
        bgcolor: theme.app.dashboard.pillBg,
        border: `0.51px solid ${alpha(theme.palette.text.primary, 0.06)}`,
        minWidth: { xs: 200, md: 260 },
        ...(typeof sx === "function" ? (sx as (theme: Theme) => object)(theme) : sx),
      }}
    >
      <SearchIcon sx={{ fontSize: 18, color: theme.app.text.iconMuted }} width={18} height={18} />
      <InputBase
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          color: theme.palette.text.primary,
          fontSize: 14,
          flex: 1,
          "& input::placeholder": { color: theme.app.text.placeholder, opacity: 1 },
        }}
      />
      {value && (
        <IconButton
          size="small"
          onClick={handleClear}
          sx={{
            color: theme.palette.text.secondary,
            p: 0.25,
          }}
        >
          ✕
        </IconButton>
      )}
    </Box>
  );
}
