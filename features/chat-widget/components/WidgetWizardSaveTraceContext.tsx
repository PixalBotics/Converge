"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { WidgetWizardSaveEntry } from "@/lib/chat-widget/widget-wizard-save-trace";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Typography } from "@/components/common";
import type { JsonRecord } from "@/api/types/common.types";
import type { ChatWidgetWizardPatchScope } from "@/lib/chat-widget/build-widget-install-body";
import {
  readWizardSaveTraceFromSession,
  summarizePatchRequest,
  summarizePatchResponse,
  writeWizardSaveTraceToSession,
} from "@/lib/chat-widget/widget-wizard-save-trace";

function saveTraceEntryKey(entry: WidgetWizardSaveEntry): string {
  return `${entry.stepKey}-${entry.savedAt}`;
}

type RecordSaveInput = {
  stepKey: string;
  stepLabel: string;
  method: "POST" | "PATCH";
  path: string;
  scope?: ChatWidgetWizardPatchScope | "full" | "create";
  publishNow?: boolean;
  requestBody: JsonRecord;
  responseBody: JsonRecord;
};

type WidgetWizardSaveTraceContextValue = {
  entries: WidgetWizardSaveEntry[];
  recordSave: (input: RecordSaveInput) => void;
  clear: () => void;
};

const WidgetWizardSaveTraceContext = createContext<WidgetWizardSaveTraceContextValue | null>(
  null,
);

export function WidgetWizardSaveTraceProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<WidgetWizardSaveEntry[]>(() =>
    readWizardSaveTraceFromSession(),
  );

  const recordSave = useCallback((input: RecordSaveInput) => {
    const entry: WidgetWizardSaveEntry = {
      stepKey: input.stepKey,
      stepLabel: input.stepLabel,
      savedAt: new Date().toISOString(),
      method: input.method,
      path: input.path,
      scope: input.scope,
      publishNow: input.publishNow ?? false,
      requestBody: input.requestBody,
      responseBody: input.responseBody,
    };
    setEntries((prev) => {
      const without = prev.filter((e) => e.stepKey !== input.stepKey);
      const next = [entry, ...without].slice(0, 8);
      writeWizardSaveTraceToSession(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
    writeWizardSaveTraceToSession([]);
  }, []);

  const value = useMemo(
    () => ({ entries, recordSave, clear }),
    [entries, recordSave, clear],
  );

  return (
    <WidgetWizardSaveTraceContext.Provider value={value}>
      {children}
    </WidgetWizardSaveTraceContext.Provider>
  );
}

export function useWidgetWizardSaveTrace(): WidgetWizardSaveTraceContextValue {
  const ctx = useContext(WidgetWizardSaveTraceContext);
  if (!ctx) {
    throw new Error("useWidgetWizardSaveTrace must be used inside WidgetWizardSaveTraceProvider");
  }
  return ctx;
}

/** Optional hook for pages outside the provider (no-op record). */
export function useWidgetWizardSaveTraceOptional(): WidgetWizardSaveTraceContextValue | null {
  return useContext(WidgetWizardSaveTraceContext);
}

export function WidgetWizardSaveTracePanel() {
  const theme = useTheme() as AppTheme;
  const ctx = useWidgetWizardSaveTraceOptional();
  const latestKey = ctx?.entries[0] ? saveTraceEntryKey(ctx.entries[0]) : null;
  const [expandedKey, setExpandedKey] = useState<string | false>(false);

  useEffect(() => {
    if (latestKey) setExpandedKey(latestKey);
  }, [latestKey]);

  if (process.env.NODE_ENV !== "development") return null;
  if (!ctx || ctx.entries.length === 0) return null;

  const latest = ctx.entries[0];

  return (
    <Box
      sx={{
        mb: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.info.main, 0.35)}`,
        bgcolor: alpha(theme.palette.info.main, theme.palette.mode === "light" ? 0.06 : 0.1),
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 1.5, py: 1, borderBottom: `1px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
        <Typography variant="body2" fontWeight={700} sx={{ color: theme.app.text.primary }}>
          Saved on this step (API)
        </Typography>
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
          Same data as Network tab — last save: {latest.stepLabel}
        </Typography>
      </Box>

      {ctx.entries.map((entry, idx) => {
        const entryKey = saveTraceEntryKey(entry);
        return (
        <Accordion
          key={entryKey}
          expanded={expandedKey === entryKey}
          onChange={(_e, isExpanded) => setExpandedKey(isExpanded ? entryKey : false)}
          disableGutters
          elevation={0}
          sx={{
            bgcolor: "transparent",
            "&:before": { display: "none" },
            borderTop: idx > 0 ? `1px solid ${alpha(theme.palette.divider, 0.08)}` : "none",
          }}
        >
          <AccordionSummary expandIcon={<ExpandMore sx={{ fontSize: 20 }} />}>
            <Typography variant="caption" fontWeight={600} sx={{ color: theme.app.text.primary }}>
              {entry.stepLabel}
              <Box component="span" sx={{ color: theme.app.dashboard.textMuted, fontWeight: 400, ml: 1 }}>
                {entry.method} · {new Date(entry.savedAt).toLocaleTimeString()}
              </Box>
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 1.5 }}>
            <Typography
              variant="caption"
              component="pre"
              sx={{
                display: "block",
                color: theme.palette.success.light,
                fontFamily: "ui-monospace, monospace",
                fontSize: 11,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                mb: 1,
              }}
            >
              {summarizePatchRequest(entry).join("\n")}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 0.5 }}>
              Response
            </Typography>
            <Typography
              variant="caption"
              component="pre"
              sx={{
                display: "block",
                color: theme.app.dashboard.textMuted,
                fontFamily: "ui-monospace, monospace",
                fontSize: 11,
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                mb: 1,
              }}
            >
              {summarizePatchResponse(entry).join("\n")}
            </Typography>
            <Accordion disableGutters elevation={0} sx={{ bgcolor: alpha(theme.palette.common.black, 0.15) }}>
              <AccordionSummary expandIcon={<ExpandMore sx={{ fontSize: 18 }} />}>
                <Typography variant="caption">Raw JSON (request + response)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 10,
                    maxHeight: 220,
                    overflow: "auto",
                    m: 0,
                    color: theme.app.dashboard.textMuted,
                  }}
                >
                  {JSON.stringify(
                    { request: entry.requestBody, response: entry.responseBody },
                    null,
                    2,
                  )}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </AccordionDetails>
        </Accordion>
        );
      })}
    </Box>
  );
}
