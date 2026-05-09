"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Key from "@mui/icons-material/Key";
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
  rotateWidgetDeployKey,
  widgetResponseData,
} from "@/api/widgets/widgets.api";
import { Button, DashboardCard, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { buildUnifiedWidgetEmbedScript } from "@/lib/chat-widget/widgetDraft";
import {
  extractDeployKeyFromEmbedSnippetResponse,
  pickInstallWidgetKeys,
  readEmbedSnippetMarkup,
} from "@/lib/chat-widget/widget-install-response";
import { publishAppToast } from "@/lib/notify";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { parseSnapshotForPreview } from "@/lib/chat-widget/snapshot-preview-model";
import { WidgetSnapshotPreview } from "@/components/dashboard/chat-widget/WidgetSnapshotPreview";

function safePrettyJson(value: unknown, maxChars = 24_000): string {
  try {
    const s = JSON.stringify(value, null, 2);
    if (s.length <= maxChars) return s;
    return `${s.slice(0, maxChars)}\n… (truncated)`;
  } catch {
    return String(value);
  }
}

function pickScalarSummary(obj: JsonRecord): Array<{ k: string; v: string }> {
  const out: Array<{ k: string; v: string }> = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    const t = typeof v;
    if (t === "string" || t === "number" || t === "boolean") {
      out.push({ k, v: String(v) });
    }
  }
  return out.slice(0, 24);
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
  const [deployKey, setDeployKey] = useState("");
  const [rotating, setRotating] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

      let dk = "";
      let html: string | null = null;
      try {
        const snippetRes = await getWidgetEmbedSnippet(widgetKey);
        dk = extractDeployKeyFromEmbedSnippetResponse(snippetRes);
        html = readEmbedSnippetMarkup(snippetRes);
      } catch {
        /* optional for draft-only widgets */
      }
      setDeployKey(dk);
      setSnippetHtml(html);
    } catch (e) {
      setError(extractApiErrorMessageForToast(e) ?? "Failed to load widget.");
      setAdmin(null);
      setSnapshot(null);
      setDeployKey("");
      setSnippetHtml(null);
    } finally {
      setLoading(false);
    }
  }, [widgetKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const adminSummary = useMemo(
    () => (admin ? pickScalarSummary(admin) : []),
    [admin],
  );

  const previewSrc = useMemo(() => {
    if (typeof window === "undefined" || !deployKey.trim()) return "";
    const origin = window.location.origin;
    const parentHost = window.location.hostname || "localhost";
    const q = new URLSearchParams({
      widgetKey,
      deployKey: deployKey.trim(),
      parentHost,
      parentPage: `${origin}/dashboard/chat-widget/${encodeURIComponent(widgetKey)}`,
    });
    return `${origin}/embed/widget?${q.toString()}`;
  }, [widgetKey, deployKey]);

  const snapshotPreview = useMemo(
    () => parseSnapshotForPreview(snapshot),
    [snapshot],
  );

  const snapshotConfig =
    snapshot &&
    typeof snapshot.configSnapshot === "object" &&
    snapshot.configSnapshot !== null
      ? snapshot.configSnapshot
      : snapshot;

  const handleCopySnippet = async () => {
    const unified =
      deployKey.trim() && widgetKey.trim()
        ? buildUnifiedWidgetEmbedScript({
            widgetKey,
            deployKey: deployKey.trim(),
            appOrigin:
              typeof window !== "undefined"
                ? window.location.origin
                : process.env.NEXT_PUBLIC_WIDGET_EMBED_ORIGIN ?? "",
          })
        : "";
    const text =
      snippetHtml?.trim() || unified.trim() || "";
    if (!text) {
      publishAppToast({
        variant: "error",
        message: "No embed snippet available. Publish the widget or request a deploy key.",
      });
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      publishAppToast({ variant: "success", message: "Snippet copied." });
    } catch {
      publishAppToast({ variant: "error", message: "Could not copy to clipboard." });
    }
  };

  const handleRotateKey = async () => {
    if (!widgetKey.trim()) return;
    setRotating(true);
    try {
      const res = await rotateWidgetDeployKey(widgetKey);
      const inner = widgetResponseData<JsonRecord>(res);
      const next = pickInstallWidgetKeys(inner).deployKey.trim() || deployKey;
      if (next) setDeployKey(next);
      setIframeKey((k) => k + 1);
      try {
        const snippetRes = await getWidgetEmbedSnippet(widgetKey);
        setSnippetHtml(readEmbedSnippetMarkup(snippetRes));
        const fromSnip = extractDeployKeyFromEmbedSnippetResponse(snippetRes);
        if (fromSnip) setDeployKey(fromSnip);
      } catch {
        /* ignore */
      }
      publishAppToast({ variant: "success", message: "Deploy key rotated." });
    } catch (e) {
      publishAppToast({
        variant: "error",
        message: extractApiErrorMessageForToast(e) ?? "Rotate key failed.",
      });
    } finally {
      setRotating(false);
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

      {variant === "manage" ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, maxWidth: 720 }}>
          Copy the embed snippet or rotate the deploy key. Full step-by-step editing still uses{" "}
          <Box component="span" sx={{ fontWeight: 700 }}>
            Add Widget
          </Box>{" "}
          in the wizard; this screen is for inspection and operations.
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
                Administration summary
              </Typography>
              {adminSummary.length === 0 ? (
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                  No scalar fields returned. See raw JSON below.
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
                    "& dd": { m: 0, color: theme.app.text.primary, fontSize: "0.875rem", wordBreak: "break-word" },
                  }}
                >
                  {adminSummary.map(({ k, v }) => (
                    <Box key={k} sx={{ display: "contents" }}>
                      <Typography component="dt" variant="body2">
                        {k}
                      </Typography>
                      <Typography component="dd" variant="body2">
                        {v}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, mt: 1 }}>
                Raw (GET /widgets/:key)
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  borderRadius: 1,
                  maxHeight: 280,
                  overflow: "auto",
                  fontSize: "0.75rem",
                  bgcolor: alpha(theme.palette.common.black, 0.25),
                  border: `1px solid ${theme.app.dashboard.cardBorder}`,
                  color: theme.app.dashboard.textMuted,
                }}
              >
                {safePrettyJson(admin)}
              </Box>
            </DashboardCard>

            <DashboardCard sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography variant="mediumLarge" color="white" fontWeight={600}>
                Editor snapshot
              </Typography>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                Latest configuration row from GET /widgets/:key/snapshot (includes config snapshot for
                theming and behavior).
              </Typography>
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  borderRadius: 1,
                  maxHeight: 420,
                  overflow: "auto",
                  fontSize: "0.75rem",
                  bgcolor: alpha(theme.palette.common.black, 0.25),
                  border: `1px solid ${theme.app.dashboard.cardBorder}`,
                  color: theme.app.dashboard.textMuted,
                }}
              >
                {safePrettyJson(snapshotConfig ?? snapshot)}
              </Box>
            </DashboardCard>
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <DashboardCard sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2, height: "auto" }}>
              <Typography variant="mediumLarge" color="white" fontWeight={600}>
                Live preview
              </Typography>
              <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                Uses your latest saved version from{" "}
                <Box component="span" sx={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                  GET /widgets/…/snapshot
                </Box>{" "}
                (draft or published theme in DB)—not the generic visitor runtime unless you open the embed
                below.
              </Typography>
              <WidgetSnapshotPreview parsed={snapshotPreview} />

              <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, mt: 1 }}>
                Visitor embed (optional)
              </Typography>
              {!deployKey.trim() ? (
                <Typography variant="body2" sx={{ color: theme.palette.warning.light }}>
                  No deploy key yet—visitor iframe preview is unavailable until you publish or rotate a key.
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
                  Same loader as a live site when domains and publish state allow it (may differ from draft
                  snapshot above).
                </Typography>
              )}
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
                      Embed iframe unavailable (no deploy key)
                    </Typography>
                  </Box>
                )}
              </Box>

              {(variant === "manage" || snippetHtml || deployKey.trim()) && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="small"
                    startIcon={<ContentCopy sx={{ fontSize: 16 }} />}
                    onClick={() => void handleCopySnippet()}
                    disabled={!snippetHtml?.trim() && !deployKey.trim()}
                  >
                    Copy embed snippet
                  </Button>
                  {variant === "manage" ? (
                    <Button
                      type="button"
                      variant="primary"
                      sx={gradientPrimaryButtonSx}
                      size="small"
                      startIcon={<Key sx={{ fontSize: 16 }} />}
                      disabled={rotating}
                      onClick={() => void handleRotateKey()}
                    >
                      {rotating ? "Rotating…" : "Rotate deploy key"}
                    </Button>
                  ) : null}
                </Box>
              )}
              {variant !== "manage" && (snippetHtml?.trim() || deployKey.trim()) ? (
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<ContentCopy sx={{ fontSize: 16 }} />}
                  onClick={() => void handleCopySnippet()}
                >
                  Copy embed snippet
                </Button>
              ) : null}
            </DashboardCard>
          </Box>
        </Box>
      ) : null}

      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete this widget?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            Soft-deletes this widget on the server (configuration, versions, keys, snippets). The website row is
            not removed.
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
