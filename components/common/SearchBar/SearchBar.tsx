"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { SearchBarProps } from "./SearchBar.types";
import { SearchIcon } from "@/components/dashboard/icons/SearchIcon";
import { resolveSx } from "@/utils/resolveSx";

export function SearchBar({ value, onChange, placeholder = "Search anything..", sx }: SearchBarProps) {
  const theme = useTheme() as AppTheme;
  const app = theme.app;
  const handleClear = () => onChange("");

  return (
    <Box
      sx={
        [
          {
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: "9999px",
            bgcolor: app.dashboard.pillBg,
            border: `1px solid ${app.dashboard.cardBorder}`,
            minWidth: { xs: 200, md: 260 },
          },
          resolveSx(sx, theme),
        ] as SxProps<Theme>
      }
    >
      <SearchIcon sx={{ color: app.dashboard.iconMuted, fontSize: 18 }} width={18} height={18} />
      <InputBase
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          color: app.text.primary,
          fontSize: 14,
          flex: 1,
          "& input::placeholder": { color: app.text.iconMuted, opacity: 1 },
        }}
      />
      {value && (
        <IconButton
          size="small"
          onClick={handleClear}
          sx={{
            color: app.dashboard.textMuted,
            p: 0.25,
          }}
        >
          ✕
        </IconButton>
      )}
    </Box>
  );
}
