"use client";

import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { SchedulingSectionCard } from "@/features/website-assignments/components/ServiceSchedulingSections";

export function IpBlockRuleToggleCard({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const theme = useTheme() as AppTheme;

  return (
    <SchedulingSectionCard
      title="Rule status"
      subtitle="When active, matching visitors cannot start or continue chat on the selected websites."
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 0.5,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            bgcolor: checked ? `${theme.palette.primary.main}33` : theme.app.dashboard.overlayLight,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: checked ? theme.palette.primary.light : theme.app.dashboard.textMuted,
          }}
          aria-hidden
        >
          <ShieldOutlined sx={{ fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="medium" fontWeight={600} sx={{ mb: 0.25 }}>
            {checked ? "Blocking active" : "Rule paused"}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.5 }}>
            {checked
              ? "Visitors from this IP are rejected on the selected websites."
              : "The rule is saved but not enforced until you turn it on."}
          </Typography>
        </Box>
        <Switch
          checked={checked}
          onChange={(_, v) => onChange(v)}
          color="primary"
          inputProps={{ "aria-label": "Rule status" }}
        />
      </Box>
    </SchedulingSectionCard>
  );
}
