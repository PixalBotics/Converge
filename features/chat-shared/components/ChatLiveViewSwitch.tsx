"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { alpha } from "@mui/material/styles";
import {
  chatLiveViewSwitchBtnSx,
  chatLiveViewSwitchRowSx,
} from "../styles/chat-live.styles";

export type ChatLiveViewOption = {
  id: string;
  label: string;
};

type ChatLiveViewSwitchProps = {
  options: ChatLiveViewOption[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
};

/** Underline view switch — no card wrapper (Intercom-style). */
export function ChatLiveViewSwitch({
  options,
  value,
  onChange,
  ariaLabel = "View",
}: ChatLiveViewSwitchProps) {
  const theme = useTheme() as AppTheme;

  return (
    <Box sx={chatLiveViewSwitchRowSx} role="tablist" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <Box
            key={opt.id}
            component="button"
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            sx={chatLiveViewSwitchBtnSx(active)}
          >
            {opt.label}
          </Box>
        );
      })}
      <Box
        sx={{
          flex: 1,
          borderBottom: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.2)}`,
          mb: "-1px",
        }}
      />
    </Box>
  );
}
