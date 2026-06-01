"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ContentCopy from "@mui/icons-material/ContentCopy";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { alpha, useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import type { JsonRecord } from "@/api/types/common.types";
import {
  deleteWidget,
  getAdminWidget,
  getWidgetEmbedSnippet,
  getWidgetSnapshot,
  widgetResponseData,
} from "@/api/widgets/widgets.api";
import { Button, DashboardCard, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { buildUnifiedWidgetEmbedScript } from "@/lib/chat-widget/widgetDraft";
import {
  normalizeEmbedSnippetForApi,
  resolveWidgetEmbedAppOrigin,
} from "@/lib/chat-widget/widget-embed-api-origin";
import {
  pickEmbedSessionExpiresIn,
  readEmbedSnippetMarkup,
} from "@/lib/chat-widget/widget-install-response";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { parseSnapshotForPreview } from "@/lib/chat-widget/snapshot-preview-model";
import { WidgetSnapshotPreview } from "./WidgetSnapshotPreview";
import { WidgetDeployStatusCard } from "./WidgetDeployStatusCard";

type SummaryRow = { label: string; value: string };

function formatIsoDate(value: unknown): string {
  if (!value) return "—";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

function deployStateLabel(state: unknown): string {
  const s = String(state ?? "");
  if (s === "live") return "Live";
  if (s === "live_with_pending_draft") return "Live (unsaved draft)";
  if (s === "draft_only") return "Draft only";
  return s || "—";
}

function formatWidgetAdminSummary(admin: JsonRecord): SummaryRow[] {
  const website = admin.website as JsonRecord | undefined;
  const deploy = admin.deploy as JsonRecord | undefined;
  const surfaces = Array.isArray(admin.surfaces)
    ? (admin.surfaces as string[]).join(", ")
    : "";
  const domains = Array.isArray(admin.allowedDomains)
    ? (admin.allowedDomains as string[]).join(", ")
    : "";

  return [
    {
      label: "Website",
      value: String(website?.name ?? website?.url ?? "—"),
    },
    {
      label: "Website URL",
      value: String(website?.url ?? "—"),
    },
    {
      label: "Widget type",
      value: String(admin.widgetType ?? "—"),
    },
    ...(surfaces
      ? [{ label: "Surfaces", value: surfaces }]
      : []),
    {
      label: "Status",
      value: deployStateLabel(deploy?.state),
    },
    {
      label: "Published",
      value: formatIsoDate(deploy?.liveAt),
    },
    {
      label: "Last saved",
      value: formatIsoDate(deploy?.draftSavedAt),
    },
    {
      label: "Allowed domains",
      value: admin.embedAllowAnyOrigin
        ? "Any website (embed unrestricted)"
        : domains || "None configured",
    },
  ];
}

export type ChatWidgetDetailVariant = "view" | "manage";

export function ChatWidgetDetailClient({
  widgetKey,
  variant,
}: {
  widgetKey: string;
  variant: ChatWidgetDetailVariant;
}) {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [admin, setAdmin] = useState<JsonRecord | null>(null);
  const [snapshot, setSnapshot] = useState<JsonRecord | null>(null);
  const [snippetHtml, setSnippetHtml] = useState<string | null>(null);
  const [sessionExpiresIn, setSessionExpiresIn] = useState("");
  const [iframeKey, setIframeKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const embedAppOrigin = resolveWidgetEmbedAppOrigin();

  const load = useCallback(async () => {
    if (!widgetKey.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const [adminRes, snapRes] = await Promise.all([
        getAdminWidget(widgetKey),
        getWidgetSnapshot(widgetKey),
      ]);
      setAdmin(widgetResponseData<JsonRecord>(adminRes));
      setSnapshot(widgetResponseData<JsonRecord>(snapRes));

      let html: string | null = null;
      let ttl = "";
      try {
        const snippetRes = await getWidgetEmbedSnippet(widgetKey);
        html = readEmbedSnippetMarkup(snippetRes);
        ttl = pickEmbedSessionExpiresIn(snippetRes);
      } catch {
        /* optional for draft-only widgets */
      }
      setSessionExpiresIn(ttl);
      setSnippetHtml(html);
    } catch (e) {
      setError(extractApiErrorMessageForToast(e) ?? "Failed to load widget.");
      setAdmin(null);
      setSnapshot(null);
      setSessionExpiresIn("");
      setSnippetHtml(null);
    } finally {
      setLoading(false);
    }
  }, [widgetKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const adminSummary = useMemo(
    () => (admin ? formatWidgetAdminSummary(admin) : []),
    [admin],
  );

  const previewSrc = useMemo(() => {
    if (!widgetKey.trim() || !embedAppOrigin) return "";
    const parentHost =
      typeof window !== "undefined" ? window.location.hostname || "localhost" : "localhost";
    const parentPage =
      typeof window !== "undefined"
        ? `${window.location.origin}/dashboard/chat-widget/${encodeURIComponent(widgetKey)}`
        : "";
    const q = new URLSearchParams({
      widgetKey,
      parentHost,
      parentPage,
    });
    return `${embedAppOrigin}/embed/widget?${q.toString()}`;
  }, [widgetKey, embedAppOrigin]);

  const snapshotPreview = useMemo(
    () => parseSnapshotForPreview(snapshot),
    [snapshot],
  );

  const displayEmbedSnippet = useMemo(() => {
    if (!widgetKey.trim()) return "";
    const raw =
      snippetHtml?.trim() ||
      buildUnifiedWidgetEmbedScript({ widgetKey, appOrigin: embedAppOrigin });
    return normalizeEmbedSnippetForApi(raw, embedAppOrigin);
  }, [snippetHtml, widgetKey, embedAppOrigin]);

  const handleCopySnippet = async () => {
    const text = displayEmbedSnippet.trim();
    if (!text) {
      publishAppToast({
        variant: "error",
        message: "No embed snippet available. Publish the widget first.",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      publishAppToast({ variant: "success", message: "Embed snippet copied." });
    } catch {
      publishAppToast({ variant: "error", message: "Could not copy to clipboard." });
    }
  };

  const handleDeleteWidget = async () => {
    if (!widgetKey.trim()) return;
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

  const title = variant === "manage" ? "Manage widget" : "Widget details";

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1280,
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
        <Typography variant="regularLarge" fontWeight={700} color="white">
          {title}
        </Typography>
        {variant === "view" ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={() =>
                router.push(`/dashboard/chat-widget/${encodeURIComponent(widgetKey)}/edit`)
              }
            >
              Edit configuration
            </Button>
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() => setDeleteOpen(true)}
              sx={{
                borderColor: theme.palette.error.main,
                color: theme.palette.error.light,
              }}
            >
              Delete
            </Button>
          </>
        ) : null}
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

      {!loading && !error && widgetKey.trim() ? (
        <WidgetDeployStatusCard widgetKey={widgetKey} />
      ) : null}

      {variant === "manage" ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
          Copy the embed snippet below and paste it on your website. Use Edit configuration for the
          step-by-step wizard, then publish when you are ready.
        </Typography>
      ) : null}

      {error ? (
        <DashboardCard sx={{ p: 2 }}>
          <Typography variant="body2" sx={{ color: theme.palette.error.main, mb: 1 }}>
            {error}
          </Typography>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={() => void load()}>
            Retry
          </Button>
        </DashboardCard>
      ) : null}

      {loading ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          Loading widget…
        </Typography>
      ) : null}

      {!loading && !error ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr minmax(320px, 400px)" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <DashboardCard sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2, height: "auto" }}>
              <Typography variant="mediumLarge" color="white" fontWeight={600}>
                Widget summary
              </Typography>
              {adminSummary.length === 0 ? (
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                  No widget details available.
                </Typography>
              ) : (
                <Box
                  component="dl"
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "160px 1fr" },
                    gap: { xs: 0.5, sm: 1 },
                    m: 0,
                    "& dt": { color: theme.app.dashboard.textMuted, fontSize: "0.8rem" },
                    "& dd": {
                      m: 0,
                      color: theme.app.text.primary,
                      fontSize: "0.875rem",
                      wordBreak: "break-word",
                    },
                  }}
                >
                  {adminSummary.map(({ label, value }) => (
                    <Box key={label} sx={{ display: "contents" }}>
                      <Typography component="dt" variant="body2">
                        {label}
                      </Typography>
                      <Typography component="dd" variant="body2">
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </DashboardCard>

            <DashboardCard sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="mediumLarge" color="white" fontWeight={600}>
                Embed code
              </Typography>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                Paste this script before the closing <Box component="span">&lt;/body&gt;</Box> tag on
                your website.
              </Typography>
              {displayEmbedSnippet.trim() ? (
                <Box
                  sx={{
                    border: `1px solid ${theme.app.dashboard.cardBorder}`,
                    borderRadius: 1.5,
                    p: 1.5,
                    bgcolor: theme.app.dashboard.overlayLight,
                  }}
                >
                  <Typography
                    component="pre"
                    variant="body2"
                    sx={{
                      color: theme.app.dashboard.textMuted,
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      m: 0,
                      fontSize: "0.8rem",
                    }}
                  >
                    {displayEmbedSnippet}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                  Publish the widget to generate an embed snippet.
                </Typography>
              )}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Button
                  type="button"
                  variant="primary"
                  size="small"
                  sx={gradientPrimaryButtonSx}
                  startIcon={<ContentCopy sx={{ fontSize: 16 }} />}
                  onClick={() => void handleCopySnippet()}
                  disabled={!displayEmbedSnippet.trim()}
                >
                  Copy embed snippet
                </Button>
              </Box>
            </DashboardCard>

            {snapshotPreview?.hasRenderable ? (
              <DashboardCard sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography variant="mediumLarge" color="white" fontWeight={600}>
                  Saved design preview
                </Typography>
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                  Visual preview from your saved configuration (draft or published).
                </Typography>
                <WidgetSnapshotPreview parsed={snapshotPreview} />
              </DashboardCard>
            ) : null}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <DashboardCard sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2, height: "auto" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                <Typography variant="mediumLarge" color="white" fontWeight={600}>
                  Live preview
                </Typography>
                {previewSrc ? (
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshRounded sx={{ fontSize: 16 }} />}
                    onClick={() => setIframeKey((k) => k + 1)}
                  >
                    Refresh
                  </Button>
                ) : null}
              </Box>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                Same widget visitors see on your site after you publish and add your domain to the
                allow list.
                {sessionExpiresIn.trim()
                  ? ` Visitor sessions expire after ${sessionExpiresIn.trim()}.`
                  : null}
              </Typography>
              <Box
                sx={{
                  position: "relative",
                  mx: "auto",
                  width: "100%",
                  maxWidth: 380,
                  borderRadius: 3,
                  overflow: "hidden",
                  border: `12px solid ${alpha(theme.palette.common.white, 0.12)}`,
                  boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
                  bgcolor: "#0f172a",
                  minHeight: previewSrc ? 520 : 120,
                }}
              >
                {previewSrc ? (
                  <Box
                    component="iframe"
                    key={iframeKey}
                    title="Visitor embed preview"
                    src={previewSrc}
                    sx={{
                      width: "100%",
                      height: 560,
                      border: "none",
                      display: "block",
                      bgcolor: "#fff",
                    }}
                  />
                ) : (
                  <Box sx={{ py: 6, px: 2, textAlign: "center" }}>
                    <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                      Live preview unavailable — check embed host configuration.
                    </Typography>
                  </Box>
                )}
              </Box>
            </DashboardCard>
          </Box>
        </Box>
      ) : null}

      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete this widget?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            This removes the widget configuration from your account. Your website record is not
            deleted.
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
            onClick={() => void handleDeleteWidget()}
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
