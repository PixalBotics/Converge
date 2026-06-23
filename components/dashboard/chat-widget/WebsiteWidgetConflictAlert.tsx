"use client";

import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import {
  apiWidgetTypeToHumanLabel,
  widgetKindToHumanLabel,
  type WebsiteWidgetSummary,
} from "@/lib/chat-widget/widget-type-conflicts";
import type { WidgetKind } from "@/lib/chat-widget/widgetDraft";

export function WebsiteWidgetConflictAlert({
  conflicts,
  selectedKind,
  mode,
}: {
  conflicts: WebsiteWidgetSummary[];
  selectedKind: WidgetKind;
  mode: "create" | "edit";
}) {
  const theme = useTheme() as AppTheme;
  if (conflicts.length === 0) return null;

  const list = conflicts
    .map((w) => {
      const label = w.widgetTypeLabel || apiWidgetTypeToHumanLabel(w.widgetType);
      return `${label} (${w.widgetKey})`;
    })
    .join(", ");

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.25,
        alignItems: "flex-start",
        p: 1.5,
        borderRadius: 1.5,
        border: `1px solid ${theme.palette.warning.main}`,
        bgcolor: "rgba(234, 179, 8, 0.08)",
      }}
    >
      <WarningAmberOutlined sx={{ color: theme.palette.warning.main, fontSize: 22, mt: 0.1 }} />
      <Box>
        <Typography variant="body2" sx={{ color: theme.app.text.primary, fontWeight: 600 }}>
          {mode === "create"
            ? "This website already has a widget with overlapping surfaces"
            : "Changing type may overlap with another widget on this website"}
        </Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.5 }}>
          You selected <strong>{widgetKindToHumanLabel(selectedKind)}</strong>, but this site already
          has: {list}. Visitors may see two embeds or duplicate chat/Text Us entry points. Prefer editing
          the existing widget or use <strong>Chat + Text Us</strong> in one script when you need both.
        </Typography>
      </Box>
    </Box>
  );
}
