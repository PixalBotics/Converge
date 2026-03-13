"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import type { Theme } from "@mui/material/styles";
import type { SearchBarProps } from "./SearchBar.types";
import { SearchIcon } from "@/components/dashboard/icons/SearchIcon";

export function SearchBar({ value, onChange, placeholder = "Search anything..", sx }: SearchBarProps) {
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
        bgcolor: "#16123F",
        border: "0.51px solid #FFFFFF0F",
        minWidth: { xs: 200, md: 260 },
        ...(typeof sx === "function" ? (sx as (theme: Theme) => object) : sx),
      }}
    >
      <SearchIcon sx={{ fontSize: 18 }} width={18} height={18} />
      <InputBase
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          color: "white",
          fontSize: 14,
          flex: 1,
          "& input::placeholder": { opacity: 0.75 },
        }}
      />
      {value && (
        <IconButton
          size="small"
          onClick={handleClear}
          sx={{
            color: "rgba(148,163,184,0.9)",
            p: 0.25,
          }}
        >
          ✕
        </IconButton>
      )}
    </Box>
  );
}

