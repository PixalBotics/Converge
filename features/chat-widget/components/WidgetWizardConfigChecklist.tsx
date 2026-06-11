"use client";

import CheckCircle from "@mui/icons-material/CheckCircle";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import { readChatWizardDraft, resolveEditWidgetKeyForNavigation } from "@/lib/chat-widget/chat-wizard-edit";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { buildWidgetWizardChecklist } from "@/features/chat-widget/widget-wizard-readiness";

export function WidgetWizardConfigChecklist({ refreshKey = 0 }: { refreshKey?: number }) {
  const theme = useTheme() as AppTheme;
  const searchParams = useSearchParams();
  const editKey = (searchParams.get("edit") ?? "").trim();

  const items = useMemo(() => {
    const draft = readChatWizardDraft(resolveEditWidgetKeyForNavigation(editKey) || undefined);
    return buildWidgetWizardChecklist(draft);
    // refreshKey bumps after each step save so checklist updates in sidebar
  }, [editKey, refreshKey]);

  const done = items.filter((i) => i.ok).length;

  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${theme.app.dashboard.cardBorder}`,
        bgcolor: "rgba(255,255,255,0.03)",
        p: 2,
      }}
    >
      <Typography fontWeight={700} sx={{ fontSize: 15, mb: 0.25 }}>
        Configuration checklist
      </Typography>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1.5 }}>
        {done} of {items.length} ready — SaaS-style pre-publish review
      </Typography>
      <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
        {items.map((item) => (
          <Box
            component="li"
            key={item.id}
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "flex-start",
              py: 0.75,
              borderBottom: `1px solid ${theme.app.dashboard.cardBorder}`,
              "&:last-child": { borderBottom: "none" },
            }}
          >
            {item.ok ? (
              <CheckCircle sx={{ fontSize: 18, color: theme.palette.success.light, mt: 0.15 }} />
            ) : (
              <RadioButtonUnchecked
                sx={{ fontSize: 18, color: theme.app.dashboard.textMuted, mt: 0.15 }}
              />
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.35 }}>
                {item.label}
              </Typography>
              {item.detail ? (
                <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, lineHeight: 1.4 }}>
                  {item.detail}
                </Typography>
              ) : null}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
