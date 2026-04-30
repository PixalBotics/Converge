"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ArrowBack from "@mui/icons-material/ArrowBack";
import CloudUpload from "@mui/icons-material/CloudUpload";
import ImageOutlined from "@mui/icons-material/ImageOutlined";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, DashboardCard, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import {
  integrationsMainCardSx,
  integrationsPageHeader,
  integrationsPageWrapper,
} from "../../integrations/integrations.styles";
import { useAuth } from "@/lib/auth";
import { OP } from "@/lib/permissions";
import {
  usePatchWidgetDraftMutation,
  usePublishWidgetDraftMutation,
  useRollbackWidgetMutation,
  useUploadWidgetLogoMutation,
  useWidgetDraftConfigQuery,
  useWidgetPublishedConfigQuery,
} from "@/lib/hooks/query";
import {
  adminConfigToWidgetDraftPartial,
  defaultWidgetAdminConfig,
  logoUrlFromUploadResponse,
  type WidgetAdminConfig,
  widgetAdminConfigFromApi,
  widgetAdminConfigFromWidgetDraft,
  widgetAdminConfigToApiBody,
} from "@/lib/chat-widget/widgetAdminConfig";
import { readWidgetDraft, saveWidgetDraft } from "@/lib/chat-widget/widgetDraft";
import { publishAppToast } from "@/lib/notify";
import type { JsonRecord } from "@/api";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ""));
    r.onerror = () => reject(new Error("read failed"));
    r.readAsDataURL(file);
  });
}

function WidgetConfigureContent() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasOperational: h } = useAuth();
  const canEdit = h(OP.chatWidget.update);

  const initialWidgetId = useMemo(() => {
    const q = searchParams.get("widgetId")?.trim();
    if (q) return q;
    return readWidgetDraft().widgetId || "default-widget";
  }, [searchParams]);

  const [widgetId, setWidgetId] = useState(initialWidgetId);
  const [form, setForm] = useState<WidgetAdminConfig>(() => defaultWidgetAdminConfig(initialWidgetId));

  useEffect(() => {
    setForm((f) => ({ ...f, widgetId }));
  }, [widgetId]);

  const draftQuery = useWidgetDraftConfigQuery(widgetId, { enabled: Boolean(widgetId), scope: "admin-config" });
  const publishedQuery = useWidgetPublishedConfigQuery(widgetId, { enabled: Boolean(widgetId), scope: "admin-config" });

  const patchDraft = usePatchWidgetDraftMutation(widgetId);
  const publishDraft = usePublishWidgetDraftMutation(widgetId);
  const rollback = useRollbackWidgetMutation(widgetId);
  const uploadLogo = useUploadWidgetLogoMutation(widgetId);

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const iconInputRef = useRef<HTMLInputElement | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    hydratedRef.current = false;
  }, [widgetId]);

  useEffect(() => {
    if (draftQuery.isSuccess && draftQuery.data !== undefined && !hydratedRef.current) {
      hydratedRef.current = true;
      try {
        setForm(widgetAdminConfigFromApi(draftQuery.data, widgetId));
      } catch {
        setForm(widgetAdminConfigFromWidgetDraft(readWidgetDraft()));
      }
      return;
    }
    if (draftQuery.isError && !hydratedRef.current) {
      hydratedRef.current = true;
      setForm(widgetAdminConfigFromWidgetDraft({ ...readWidgetDraft(), widgetId }));
      publishAppToast({
        variant: "error",
        message: "Could not load draft from API. Showing local defaults until the backend is available.",
      });
    }
  }, [draftQuery.data, draftQuery.isSuccess, draftQuery.isError, widgetId]);

  const update = useCallback(<K extends keyof WidgetAdminConfig>(key: K, value: WidgetAdminConfig[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSaveDraft = () => {
    if (!canEdit) return;
    const body = widgetAdminConfigToApiBody(form) as unknown as JsonRecord;
    patchDraft.mutate(body, {
      onSuccess: () => {
        saveWidgetDraft(adminConfigToWidgetDraftPartial(form));
        publishAppToast({ variant: "success", message: "Draft saved." });
      },
      onError: () => publishAppToast({ variant: "error", message: "Draft save failed." }),
    });
  };

  const handlePublish = () => {
    if (!canEdit) return;
    publishDraft.mutate(undefined, {
      onSuccess: () => {
        saveWidgetDraft(adminConfigToWidgetDraftPartial(form));
        publishAppToast({ variant: "success", message: "Published." });
      },
      onError: () => publishAppToast({ variant: "error", message: "Publish failed." }),
    });
  };

  const handleRollback = () => {
    if (!canEdit) return;
    rollback.mutate(undefined, {
      onSuccess: (data) => {
        const next = widgetAdminConfigFromApi(data, widgetId);
        setForm(next);
        saveWidgetDraft(adminConfigToWidgetDraftPartial(next));
        publishAppToast({ variant: "success", message: "Rolled back to previous published version." });
      },
      onError: () => publishAppToast({ variant: "error", message: "Rollback failed." }),
    });
  };

  const onPickLogo = async (file: File | null) => {
    if (!file || !canEdit) return;
    try {
      const preview = await fileToDataUrl(file);
      setForm((p) => ({ ...p, logoDataUrl: preview }));
      uploadLogo.mutate(file, {
        onSuccess: (res) => {
          const url = logoUrlFromUploadResponse(res);
          if (url) {
            setForm((p) => ({ ...p, logoUrl: url, logoDataUrl: "" }));
            publishAppToast({ variant: "success", message: "Logo uploaded." });
          } else {
            publishAppToast({ variant: "success", message: "Upload completed; confirm logo URL from API response." });
          }
        },
        onError: () => publishAppToast({ variant: "error", message: "Logo upload failed." }),
      });
    } catch {
      publishAppToast({ variant: "error", message: "Could not read file." });
    }
  };

  const onPickIcon = async (file: File | null) => {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      update("iconDataUrl", dataUrl);
    } catch {
      publishAppToast({ variant: "error", message: "Could not read launcher icon." });
    }
  };

  const fieldSx = { "& .MuiInputBase-input, & .MuiInputLabel-root": { color: theme.app.text.primary } };

  const busy =
    patchDraft.isPending || publishDraft.isPending || rollback.isPending || uploadLogo.isPending;

  return (
    <Box sx={integrationsPageWrapper}>
      <Box sx={integrationsPageHeader}>
        <Box>
          <Button
            type="button"
            variant="secondary"
            startIcon={<ArrowBack />}
            onClick={() => router.push("/dashboard/chat-widget")}
            sx={{ mb: 1 }}
          >
            Widget list
          </Button>
          <Typography variant="regularLarge" fontWeight={700} color="white" sx={{ mb: 0.5 }}>
            Widget configuration (admin)
          </Typography>
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
            Branding, launcher, pre-chat, domains, and lifecycle: draft → publish → rollback. Integrates with{" "}
            <Typography component="span" variant="medium" sx={{ color: theme.app.dashboard.textMuted, fontFamily: "monospace" }}>
              /chat/widget/admin/widgets/:id/*
            </Typography>{" "}
            endpoints.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center", justifyContent: "flex-end" }}>
          <Button type="button" variant="secondary" disabled={busy || !canEdit} onClick={handleSaveDraft}>
            Save draft
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} disabled={busy || !canEdit} onClick={handlePublish}>
            Publish
          </Button>
          <Button type="button" variant="secondary" disabled={busy || !canEdit} onClick={handleRollback}>
            Rollback
          </Button>
        </Box>
      </Box>

      {!canEdit ? (
        <DashboardCard sx={integrationsMainCardSx}>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, p: 2 }}>
            You have view-only access. Ask an admin for the chat-widget:update permission to change settings.
          </Typography>
        </DashboardCard>
      ) : null}

      <DashboardCard sx={{ ...integrationsMainCardSx, mb: 2 }}>
        <Box sx={{ p: 2, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "flex-end" }}>
          <TextField
            label="Widget ID"
            value={widgetId}
            onChange={(e) => setWidgetId(e.target.value.trim())}
            disabled={busy}
            sx={{ ...fieldSx, minWidth: 260, maxWidth: 400 }}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={busy || !widgetId}
            onClick={() => {
              void (async () => {
                hydratedRef.current = false;
                const d = await draftQuery.refetch();
                if (d.data !== undefined) {
                  try {
                    setForm(widgetAdminConfigFromApi(d.data, widgetId));
                  } catch {
                    setForm(widgetAdminConfigFromWidgetDraft({ ...readWidgetDraft(), widgetId }));
                  }
                }
                hydratedRef.current = true;
                void publishedQuery.refetch();
              })();
            }}
          >
            Reload from API
          </Button>
          <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
            Draft: {draftQuery.isFetching ? "loading…" : draftQuery.isError ? "error" : "ok"} · Published:{" "}
            {publishedQuery.isFetching ? "loading…" : publishedQuery.isError ? "error" : "ok"}
          </Typography>
        </Box>
      </DashboardCard>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <DashboardCard sx={integrationsMainCardSx}>
          <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              Branding & colors
            </Typography>
            <TextField
              label="Header title"
              value={form.headerTitle}
              onChange={(e) => update("headerTitle", e.target.value)}
              disabled={!canEdit}
              fullWidth
              sx={fieldSx}
            />
            <FormControl fullWidth disabled={!canEdit}>
              <InputLabel id="align-label" sx={{ color: theme.app.dashboard.textMuted }}>
                Title alignment
              </InputLabel>
              <Select
                labelId="align-label"
                label="Title alignment"
                value={form.headerTitleAlign}
                onChange={(e) => update("headerTitleAlign", e.target.value as WidgetAdminConfig["headerTitleAlign"])}
              >
                <MenuItem value="Center">Center</MenuItem>
                <MenuItem value="Left">Left</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
              {form.logoDataUrl || form.logoUrl ? (
                <Box
                  component="img"
                  src={form.logoDataUrl || form.logoUrl}
                  alt="Logo preview"
                  sx={{
                    width: 120,
                    height: 120,
                    objectFit: "contain",
                    borderRadius: 1,
                    bgcolor: alpha(theme.app.dashboard.overlayLight, 0.3),
                    border: `1px dashed ${theme.app.dashboard.cardBorder}`,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: 1,
                    bgcolor: alpha(theme.app.dashboard.overlayLight, 0.2),
                    border: `1px dashed ${theme.app.dashboard.cardBorder}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, px: 1, textAlign: "center" }}>
                    No logo
                  </Typography>
                </Box>
              )}
              <Box>
                <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={(e) => void onPickLogo(e.target.files?.[0] ?? null)} />
                <Button
                  type="button"
                  variant="secondary"
                  startIcon={<CloudUpload />}
                  disabled={!canEdit || busy}
                  onClick={() => logoInputRef.current?.click()}
                >
                  Upload logo
                </Button>
                <Typography variant="caption" display="block" sx={{ color: theme.app.dashboard.textMuted, mt: 0.5 }}>
                  POST {`/chat/widget/admin/widgets/{id}/assets/logo`}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <TextField
                label="Primary color"
                value={form.buttonColor}
                onChange={(e) => update("buttonColor", e.target.value)}
                disabled={!canEdit}
                sx={fieldSx}
              />
              <TextField
                label="Hover color"
                value={form.buttonHoverColor}
                onChange={(e) => update("buttonHoverColor", e.target.value)}
                disabled={!canEdit}
                sx={fieldSx}
              />
              <TextField label="Icon color" value={form.iconColor} onChange={(e) => update("iconColor", e.target.value)} disabled={!canEdit} sx={fieldSx} />
              <TextField label="Header text color" value={form.textColor} onChange={(e) => update("textColor", e.target.value)} disabled={!canEdit} sx={fieldSx} />
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <FormControl fullWidth disabled={!canEdit}>
                <InputLabel id="shape-label">Launcher shape</InputLabel>
                <Select
                  labelId="shape-label"
                  label="Launcher shape"
                  value={form.buttonShape}
                  onChange={(e) => update("buttonShape", e.target.value as WidgetAdminConfig["buttonShape"])}
                >
                  <MenuItem value="circle">Circle</MenuItem>
                  <MenuItem value="rounded">Rounded</MenuItem>
                  <MenuItem value="square">Square</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth disabled={!canEdit}>
                <InputLabel id="pos-label">Launcher position</InputLabel>
                <Select
                  labelId="pos-label"
                  label="Launcher position"
                  value={form.buttonPosition}
                  onChange={(e) => update("buttonPosition", e.target.value as WidgetAdminConfig["buttonPosition"])}
                >
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
              {(form.iconDataUrl ? (
                <Box
                  component="img"
                  src={form.iconDataUrl}
                  alt="Launcher icon"
                  sx={{ width: 56, height: 56, objectFit: "contain", borderRadius: 1, bgcolor: alpha(theme.app.dashboard.overlayLight, 0.25) }}
                />
              ) : (
                <ImageOutlined sx={{ fontSize: 48, color: theme.app.dashboard.textMuted }} />
              ))}
              <Box>
                <input ref={iconInputRef} type="file" accept="image/*" hidden onChange={(e) => void onPickIcon(e.target.files?.[0] ?? null)} />
                <Button type="button" variant="secondary" disabled={!canEdit} onClick={() => iconInputRef.current?.click()}>
                  Launcher icon (file)
                </Button>
                <Typography variant="caption" display="block" sx={{ color: theme.app.dashboard.textMuted, mt: 0.5 }}>
                  Stored as data URL in draft JSON unless your API adds a dedicated asset endpoint.
                </Typography>
              </Box>
            </Box>
          </Box>
        </DashboardCard>

        <DashboardCard sx={integrationsMainCardSx}>
          <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              Welcome, bot & banner
            </Typography>
            <TextField
              label="Welcome text"
              value={form.greetingMessage}
              onChange={(e) => update("greetingMessage", e.target.value)}
              disabled={!canEdit}
              multiline
              minRows={3}
              fullWidth
              sx={fieldSx}
            />
            <TextField label="Send button label" value={form.startChatLabel} onChange={(e) => update("startChatLabel", e.target.value)} disabled={!canEdit} fullWidth sx={fieldSx} />
            <TextField
              label="Composer placeholder"
              value={form.sendPlaceholder}
              onChange={(e) => update("sendPlaceholder", e.target.value)}
              disabled={!canEdit}
              fullWidth
              sx={fieldSx}
            />
            <FormControlLabel
              control={<Switch checked={form.botEnabled} onChange={(_, v) => update("botEnabled", v)} disabled={!canEdit} />}
              label={<Typography color="white">AI / bot enabled for this widget</Typography>}
            />
            <FormControlLabel
              control={<Switch checked={form.bannerOn} onChange={(_, v) => update("bannerOn", v)} disabled={!canEdit} />}
              label={<Typography color="white">Show promo banner</Typography>}
            />
            <TextField label="Banner title" value={form.bannerTitle} onChange={(e) => update("bannerTitle", e.target.value)} disabled={!canEdit || !form.bannerOn} fullWidth sx={fieldSx} />
            <TextField
              label="Banner description"
              value={form.bannerDescription}
              onChange={(e) => update("bannerDescription", e.target.value)}
              disabled={!canEdit || !form.bannerOn}
              multiline
              minRows={2}
              fullWidth
              sx={fieldSx}
            />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <TextField
                label="Panel width (px)"
                type="number"
                value={form.boxWidth}
                onChange={(e) => update("boxWidth", Math.max(200, Number(e.target.value) || 350))}
                disabled={!canEdit}
                sx={fieldSx}
              />
              <TextField
                label="Panel height (px)"
                type="number"
                value={form.boxHeight}
                onChange={(e) => update("boxHeight", Math.max(240, Number(e.target.value) || 430))}
                disabled={!canEdit}
                sx={fieldSx}
              />
            </Box>
          </Box>
        </DashboardCard>

        <DashboardCard sx={integrationsMainCardSx}>
          <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              Operating hours & privacy
            </Typography>
            <TextField
              label="Operating hours (JSON)"
              value={form.operatingHoursJson}
              onChange={(e) => update("operatingHoursJson", e.target.value)}
              disabled={!canEdit}
              multiline
              minRows={8}
              fullWidth
              sx={{ ...fieldSx, "& textarea": { fontFamily: "ui-monospace, monospace", fontSize: 13 } }}
            />
            <TextField
              label="Privacy notice"
              value={form.privacyNotice}
              onChange={(e) => update("privacyNotice", e.target.value)}
              disabled={!canEdit}
              multiline
              minRows={4}
              fullWidth
              sx={fieldSx}
            />
          </Box>
        </DashboardCard>

        <DashboardCard sx={integrationsMainCardSx}>
          <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="mediumLarge" fontWeight={600} color="white">
              Allowed domains & pre-chat
            </Typography>
            <TextField
              label="Allowed domains (one per line)"
              value={form.allowedDomainsText}
              onChange={(e) => update("allowedDomainsText", e.target.value)}
              disabled={!canEdit}
              multiline
              minRows={4}
              fullWidth
              placeholder={"example.com\nwww.example.com"}
              sx={fieldSx}
            />
            <Typography variant="small" sx={{ color: theme.app.dashboard.textMuted }}>
              Pre-chat fields (visitor form before chat starts)
            </Typography>
            <FormControlLabel
              control={<Checkbox checked={form.prechatNameEnabled} onChange={(_, v) => update("prechatNameEnabled", v)} disabled={!canEdit} />}
              label={<Typography color="white">Name</Typography>}
            />
            <FormControlLabel
              control={<Checkbox checked={form.prechatEmailEnabled} onChange={(_, v) => update("prechatEmailEnabled", v)} disabled={!canEdit} />}
              label={<Typography color="white">Email</Typography>}
            />
            <FormControlLabel
              control={<Checkbox checked={form.prechatPhoneEnabled} onChange={(_, v) => update("prechatPhoneEnabled", v)} disabled={!canEdit} />}
              label={<Typography color="white">Phone</Typography>}
            />
            <FormControlLabel
              control={<Checkbox checked={form.prechatMessageEnabled} onChange={(_, v) => update("prechatMessageEnabled", v)} disabled={!canEdit} />}
              label={<Typography color="white">Message field</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.prechatMessageRequired}
                  onChange={(_, v) => update("prechatMessageRequired", v)}
                  disabled={!canEdit || !form.prechatMessageEnabled}
                />
              }
              label={<Typography color="white">Message required</Typography>}
            />
          </Box>
        </DashboardCard>
      </Box>
    </Box>
  );
}

export default function WidgetConfigurePage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ ...integrationsPageWrapper, p: 3 }}>
          <Typography color="white">Loading…</Typography>
        </Box>
      }
    >
      <WidgetConfigureContent />
    </Suspense>
  );
}
