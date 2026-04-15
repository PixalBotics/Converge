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
import { Label } from "@/components/common";
import {
  applyOutlineFieldCursorPosition,
  resetOutlineFieldCursorPosition,
} from "@/components/common/InputField/outlineFieldCursor";
import { selectMenuItemSx, selectMenuPaperSx } from "@/components/common/SelectField/SelectField.styles";

export interface SmtpChipTagFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
}

export function SmtpChipTagField({ label, values, onChange, options }: SmtpChipTagFieldProps) {
  const theme = useTheme() as AppTheme;
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const fieldId = `chip-field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  const addable = options.filter((o) => !values.includes(o));

  const handleAdd = (v: string) => {
    onChange([...values, v]);
    setAnchor(null);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Label htmlFor={fieldId} variant="mediumLarge" sx={{ mb: 0.75 }}>
        {label}
      </Label>
      <Box
        id={fieldId}
        component="div"
        role="group"
        onMouseMove={applyOutlineFieldCursorPosition}
        onMouseLeave={resetOutlineFieldCursorPosition}
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 0,
          backgroundColor: "transparent",
          boxShadow: "none",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 1,
          py: 0,
          px: 0,
          minHeight: 56,
          boxSizing: "border-box",
          "&::before": {
            content: '""',
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "2px",
            backgroundColor: theme.app.border.input,
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            padding: "1.5px",
            borderRadius: 0,
            opacity: 0,
            transition: "opacity 0.1s ease",
            background: `radial-gradient(180px at var(--input-cursor-x, 50%) var(--input-cursor-y, 50%), ${theme.app.dashboard.accentBlue} 0%, ${theme.app.dashboard.accentBlue} 28%, transparent 82%)`,
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            filter: `drop-shadow(0 0 6px ${theme.app.dashboard.accentBlue})`,
            pointerEvents: "none",
          },
          "&:hover::after, &:focus-within::after": {
            opacity: 1,
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            flex: 1,
            minWidth: 0,
            alignItems: "center",
          }}
        >
          {values.map((v) => (
            <Chip
              key={v}
              label={v}
              size="small"
              onDelete={() => onChange(values.filter((x) => x !== v))}
              sx={{
                bgcolor: theme.app.dashboard.overlayMedium,
                color: theme.app.text.primary,
                border: `1px solid ${theme.app.dashboard.cardBorder}`,
                borderRadius: "6px",
                "& .MuiChip-deleteIcon": { color: theme.app.dashboard.textMuted },
              }}
            />
          ))}
        </Box>
        <IconButton
          type="button"
          size="small"
          aria-label={`Add ${label}`}
          disabled={addable.length === 0}
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{
            position: "relative",
            zIndex: 1,
            width: 36,
            height: 36,
            flexShrink: 0,
            m: 0,
            border: "none",
            color: theme.app.text.iconMuted,
            "&:hover": { bgcolor: theme.app.dashboard.overlayLight },
          }}
        >
          <Add sx={{ fontSize: 20 }} />
        </IconButton>
        <Menu
          anchorEl={anchor}
          open={Boolean(anchor)}
          onClose={() => setAnchor(null)}
          PaperProps={{ sx: selectMenuPaperSx(theme) }}
        >
          {addable.map((opt) => (
            <MenuItem key={opt} onClick={() => handleAdd(opt)} sx={selectMenuItemSx(theme)}>
              {opt}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Box>
  );
}
