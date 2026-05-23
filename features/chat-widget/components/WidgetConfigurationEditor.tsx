"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { JsonRecord } from "@/api/types/common.types";
import type { WidgetAiTypeApi, WidgetChatModeApi, WidgetTypeApi } from "@/api/types/widgets.types";
import {
  deleteWidget,
  getAdminWidget,
  getWidgetSnapshot,
  patchWidgetConfiguration,
  widgetResponseData,
} from "@/api/widgets/widgets.api";
import { Button, DashboardCard, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  buildPatchWidgetBody,
  editorStateFromApis,
  type WidgetPatchEditorState,
} from "@/lib/chat-widget/widget-patch-editor-model";
import { shouldShowWidgetAiType } from "@/lib/chat-widget/widget-ai-type";
import { WidgetAiTypeField } from "@/components/dashboard/chat-widget/WidgetAiTypeField";
import { unwrapWidgetInstallEnvelope } from "@/lib/chat-widget/widget-install-response";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";

const WIDGET_TYPE_OPTIONS = [
  { value: "CHAT", label: "CHAT" },
  { value: "TEXT_US", label: "TEXT_US" },
  { value: "BOTH", label: "BOTH" },
];

const CHAT_MODE_OPTIONS = [
  { value: "AI_ONLY", label: "AI_ONLY" },
  { value: "AGENT_ONLY", label: "AGENT_ONLY" },
  { value: "HYBRID", label: "HYBRID" },
];

const jsonFieldSx = {
  "& .MuiInputBase-input": {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: "0.8rem",
  },
} as const;

export function WidgetConfigurationEditor({ widgetKey }: { widgetKey: string }) {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [state, setState] = useState<WidgetPatchEditorState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!widgetKey.trim()) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [adminRes, snapRes] = await Promise.all([
        getAdminWidget(widgetKey),
        getWidgetSnapshot(widgetKey),
      ]);
      const a = widgetResponseData<JsonRecord>(adminRes);
      const s = widgetResponseData<JsonRecord>(snapRes);
      setState(editorStateFromApis(a, s));
    } catch (e) {
      setLoadError(extractApiErrorMessageForToast(e) ?? "Failed to load widget.");
      setState(null);
    } finally {
      setLoading(false);
    }
  }, [widgetKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = async (publishNow: boolean) => {
    if (!state) return;
    const body = buildPatchWidgetBody(state, { publishNow });
    if ("error" in body && typeof body.error === "string") {
      publishAppToast({ variant: "error", message: body.error });
      return;
    }
    setSaving(true);
    try {
      const res = await patchWidgetConfiguration(widgetKey, body as JsonRecord);
      unwrapWidgetInstallEnvelope(res);
      publishAppToast({
        variant: "success",
        message: publishNow
          ? "Configuration saved and published."
          : "Draft configuration saved.",
      });
      await load();
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "PATCH failed.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteWidget(widgetKey);
      publishAppToast({ variant: "success", message: "Widget removed." });
      setDeleteOpen(false);
      router.replace("/dashboard/chat-widget");
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Delete failed.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const update = <K extends keyof WidgetPatchEditorState>(
    key: K,
    value: WidgetPatchEditorState[K],
  ) => {
    setState((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 960,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        py: 1,
        px: { xs: 1.5, sm: 2 },
      }}
    >
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
        <Button
          type="button"
          variant="outlined"
          startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
          onClick={() => router.push("/dashboard/chat-widget")}
        >
          All widgets
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(`/dashboard/chat-widget/${encodeURIComponent(widgetKey)}`)}
        >
          View details
        </Button>
        <Typography variant="regularLarge" fontWeight={700} color="white">
          Edit widget
        </Typography>
        <Box
          component="code"
          sx={{
            ml: { xs: 0, sm: "auto" },
            px: 1.25,
            py: 0.5,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.common.white, 0.06),
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            color: theme.app.dashboard.textMuted,
            fontSize: "0.8rem",
            wordBreak: "break-all",
            maxWidth: "100%",
          }}
        >
          {widgetKey}
        </Box>
      </Box>

      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
        Updates use{" "}
        <Box component="span" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
          PATCH /widgets/{"{widgetKey}"}
        </Box>
        . Save as draft or publish in one step. JSON sections must be objects {"{}"}.
      </Typography>

      {loadError ? (
        <DashboardCard sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ color: theme.palette.error.main, mb: 1 }}>
            {loadError}
          </Typography>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => void load()}>
            Retry
          </Button>
        </DashboardCard>
      ) : null}

      {loading ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          Loading…
        </Typography>
      ) : null}

      {!loading && !loadError && state ? (
        <>
          <DashboardCard sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="mediumLarge" color="white" fontWeight={600}>
              Top-level options
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <SelectField
                label="Widget type"
                value={state.widgetType}
                onChange={(v) => update("widgetType", v as WidgetTypeApi)}
                options={WIDGET_TYPE_OPTIONS}
                searchable={false}
              />
              <SelectField
                label="Chat mode (config)"
                value={state.chatMode}
                onChange={(v) => update("chatMode", v as WidgetChatModeApi)}
                options={CHAT_MODE_OPTIONS}
                searchable={false}
              />
            </Box>
            {(state.widgetType === "CHAT" || state.widgetType === "BOTH") &&
            shouldShowWidgetAiType(state.chatMode) ? (
              <WidgetAiTypeField
                value={state.aiType as WidgetAiTypeApi}
                onChange={(v) => update("aiType", v)}
                disabled={state.widgetType !== "CHAT" && state.widgetType !== "BOTH"}
              />
            ) : null}
            <FormControlLabel
              control={
                <Switch
                  checked={state.embedAllowAnyOrigin}
                  onChange={(_, c) => update("embedAllowAnyOrigin", c)}
                />
              }
              label="Embed allow any origin"
            />
            <TextField
              label="Allowed domains (one per line or comma-separated)"
              value={state.allowedDomainsText}
              onChange={(e) => update("allowedDomainsText", e.target.value)}
              multiline
              minRows={3}
              fullWidth
              placeholder="app.example.com&#10;www.example.com"
            />
          </DashboardCard>

          <DashboardCard sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="mediumLarge" color="white" fontWeight={600}>
              Config JSON (theme, ui, behavior, session, form, response)
            </Typography>
            {(
              [
                ["themeJson", "theme"],
                ["uiJson", "ui"],
                ["behaviorJson", "behavior"],
                ["sessionJson", "session"],
                ["formJson", "form"],
                ["responseJson", "response"],
              ] as const
            ).map(([stateKey, label]) => (
              <TextField
                key={stateKey}
                label={label}
                value={state[stateKey]}
                onChange={(e) => update(stateKey, e.target.value)}
                multiline
                minRows={stateKey === "themeJson" || stateKey === "uiJson" ? 10 : 6}
                fullWidth
                sx={jsonFieldSx}
              />
            ))}
          </DashboardCard>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={() => void patch(false)}
            >
              {saving ? "Saving…" : "Save draft"}
            </Button>
            <Button
              type="button"
              variant="primary"
              sx={gradientPrimaryButtonSx}
              disabled={saving}
              onClick={() => void patch(true)}
            >
              {saving ? "Saving…" : "Save & publish"}
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              type="button"
              variant="outlined"
              disabled={saving || deleting}
              onClick={() => setDeleteOpen(true)}
              sx={{
                borderColor: theme.palette.error.main,
                color: theme.palette.error.light,
                "&:hover": {
                  borderColor: theme.palette.error.dark,
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                },
              }}
            >
              Delete widget
            </Button>
          </Box>
        </>
      ) : null}

      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete this widget?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            This performs a soft delete on the server (widget configuration, versions, deploy keys, and embed
            snippets). The website row is kept.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1.5, fontFamily: "monospace", wordBreak: "break-all" }}>
            {widgetKey}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button type="button" variant="secondary" disabled={deleting} onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={deleting}
            onClick={() => void handleDelete()}
            sx={{
              bgcolor: theme.palette.error.main,
              "&:hover": { bgcolor: theme.palette.error.dark },
            }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
