"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { alpha, useTheme } from "@mui/material/styles";
import {
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
} from "@mui/icons-material";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  DASHBOARD_WIDGET_LABELS,
  moveDashboardWidgetOrderItem,
} from "@/lib/permissions/dashboard-widget-layout";
import type { DashboardWidgetPermission } from "@/lib/permissions/dashboard-widget-permissions";

export type DashboardWidgetOrderEditorProps = {
  order: readonly string[];
  disabled?: boolean;
  onChange: (next: DashboardWidgetPermission[]) => void;
};

export function DashboardWidgetOrderEditor({
  order,
  disabled = false,
  onChange,
}: DashboardWidgetOrderEditorProps) {
  const theme = useTheme() as AppTheme;

  if (order.length === 0) {
    return (
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted }}>
        Select dashboard widgets below to arrange their order on the home screen.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      {order.map((code, index) => {
        const label =
          DASHBOARD_WIDGET_LABELS[code as DashboardWidgetPermission] ?? code;
        return (
          <Box
            key={code}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1,
              py: 0.75,
              borderRadius: 1.25,
              border: `1px solid ${alpha(theme.app.dashboard.cardBorder, 0.85)}`,
              bgcolor: alpha(theme.app.dashboard.cardBg, 0.35),
            }}
          >
            <Box
              sx={{
                minWidth: 24,
                height: 24,
                borderRadius: "999px",
                display: "grid",
                placeItems: "center",
                fontSize: 12,
                fontWeight: 800,
                color: theme.app.dashboard.accentBlue,
                bgcolor: alpha(theme.app.dashboard.accentBlue, 0.15),
              }}
            >
              {index + 1}
            </Box>
            <Typography
              variant="body2"
              sx={{ flex: 1, minWidth: 0, color: theme.app.text.primary, fontSize: 13 }}
            >
              {label}
            </Typography>
            <IconButton
              size="small"
              disabled={disabled || index === 0}
              aria-label={`Move ${label} up`}
              onClick={() => onChange(moveDashboardWidgetOrderItem(order, code, "up"))}
              sx={{ color: theme.app.dashboard.white95 }}
            >
              <ArrowUpwardIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              disabled={disabled || index === order.length - 1}
              aria-label={`Move ${label} down`}
              onClick={() => onChange(moveDashboardWidgetOrderItem(order, code, "down"))}
              sx={{ color: theme.app.dashboard.white95 }}
            >
              <ArrowDownwardIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      })}
    </Box>
  );
}
