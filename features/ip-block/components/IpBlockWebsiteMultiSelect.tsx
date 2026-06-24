"use client";

import { useState } from "react";
import Add from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Label, Typography } from "@/components/common";
import { selectMenuItemSx, selectMenuPaperSx } from "@/components/common/SelectField/SelectField.styles";

export type WebsiteOption = { value: string; label: string };

export interface IpBlockWebsiteMultiSelectProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: WebsiteOption[];
  disabled?: boolean;
}

export function IpBlockWebsiteMultiSelect({
  label,
  values,
  onChange,
  options,
  disabled = false,
}: IpBlockWebsiteMultiSelectProps) {
  const theme = useTheme() as AppTheme;
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const fieldId = `ip-block-websites-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const labelById = new Map(options.map((o) => [o.value, o.label]));
  const addable = options.filter((o) => o.value && !values.includes(o.value));

  return (
    <Box sx={{ width: "100%" }}>
      <Label htmlFor={fieldId} variant="mediumLarge" sx={{ mb: 0.75 }}>
        {label}
      </Label>
      <Box
        id={fieldId}
        component="div"
        role="group"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          minHeight: 44,
          p: 1.25,
          borderRadius: 1.5,
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          bgcolor: theme.app.dashboard.overlayLight,
        }}
      >
        {values.map((id) => (
          <Chip
            key={id}
            label={labelById.get(id) ?? id}
            onDelete={
              disabled
                ? undefined
                : () => onChange(values.filter((v) => v !== id))
            }
            size="small"
            sx={{
              bgcolor: theme.app.dashboard.overlayMedium,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
              color: theme.app.text.primary,
            }}
          />
        ))}
        {values.length === 0 ? (
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, px: 0.5 }}>
            {disabled ? "Complete previous steps first" : "Add from list"}
          </Typography>
        ) : null}
        <IconButton
          size="small"
          disabled={disabled || addable.length === 0}
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label={`Add ${label}`}
          sx={{
            border: `1px dashed ${theme.app.dashboard.cardBorder}`,
            borderRadius: 1,
            ml: values.length ? 0 : "auto",
          }}
        >
          <Add fontSize="small" />
        </IconButton>
      </Box>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: selectMenuPaperSx(theme) } }}
      >
        {addable.length === 0 ? (
          <MenuItem disabled sx={selectMenuItemSx(theme)}>
            No more websites
          </MenuItem>
        ) : (
          addable.map((o) => (
            <MenuItem
              key={o.value}
              sx={selectMenuItemSx(theme)}
              onClick={() => {
                onChange([...values, o.value]);
                setAnchor(null);
              }}
            >
              {o.label}
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
}
