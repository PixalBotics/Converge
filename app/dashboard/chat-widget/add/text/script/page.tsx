"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatRounded from "@mui/icons-material/ChatRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import ContentCopy from "@mui/icons-material/ContentCopy";
import SendRounded from "@mui/icons-material/SendRounded";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { getWidgetEmbedSnippet } from "@/api/widgets/widgets.api";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/features/chat-widget";
import { WidgetEmbedArchitectureHint } from "@/features/chat-widget/components/WidgetEmbedArchitectureHint";
import {
  createRemoteWidgetDraft,
  patchRemoteWidgetConfiguration,
} from "@/lib/chat-widget/widget-remote-sync";
import {
  pickInstallWidgetKeys,
  pickRequiresPublishBeforeEmbed,
  readEmbedSnippetMarkup,
} from "@/lib/chat-widget/widget-install-response";
import { uploadDraftWidgetAssets } from "@/lib/chat-widget/upload-widget-draft-assets";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import {
  readChatWizardDraft,
  saveChatWizardDraft,
} from "@/lib/chat-widget/chat-wizard-edit";
import { buildUnifiedWidgetEmbedScript } from "@/lib/chat-widget/widgetDraft";
import type { WidgetDraft } from "@/lib/chat-widget/widgetDraft";
import {
  buildApiWidgetEmbedScript,
  normalizeEmbedSnippetForApi,
  resolveWidgetEmbedAppOrigin,
} from "@/lib/chat-widget/widget-embed-api-origin";

const TEXT_WIDGET_ENABLED_KEY = "text_widget_enabled_v1";

type InstallUiState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; embedMarkup: string; draft: WidgetDraft };

export default function TextWidgetScriptPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [installUi, setInstallUi] = useState<InstallUiState>({ phase: "loading" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TEXT_WIDGET_ENABLED_KEY, "1");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function runInstall() {
      const current = readChatWizardDraft(null);
      const typed: WidgetDraft = { ...current, type: "text" };

      if (!typed.websiteId?.trim()) {
        setInstallUi({
          phase: "error",
          message: "Choose a website on the first step before finishing install.",
        });
        return;
      }

      setInstallUi({ phase: "loading" });

      try {
        const { urls: assetUrls, errors: assetErrors } = await uploadDraftWidgetAssets({
          websiteId: typed.websiteId,
          draft: typed,
        });
        if (assetErrors.length > 0) {
          console.warn("[widget] asset upload:", assetErrors.join("; "));
        }

        let widgetKey = typed.remoteWidgetKey?.trim() || "";

        if (!widgetKey) {
          const created = await createRemoteWidgetDraft({
            draft: typed,
            widgetKind: "text",
          });
          widgetKey = created.widgetKey;
          saveChatWizardDraft(null, {
            ...typed,
            remoteWidgetKey: widgetKey,
            widgetId: widgetKey,
            requiresPublishBeforeEmbed: created.requiresPublishBeforeEmbed,
          });
        }

        const patchInner = await patchRemoteWidgetConfiguration({
          widgetKey,
          widgetKind: "text",
          draft: readChatWizardDraft(null),
          publishNow: true,
          assetUrls,
        });
        if (cancelled) return;

        const keys = pickInstallWidgetKeys(patchInner);

        const finalKey = keys.widgetKey || widgetKey;
        if (!finalKey) {
          throw new Error("Publish completed but widgetKey is missing.");
        }

        saveChatWizardDraft(null, {
          ...readChatWizardDraft(null),
          type: "text",
          widgetId: finalKey,
          remoteWidgetKey: finalKey,
          completed: true,
          requiresPublishBeforeEmbed: pickRequiresPublishBeforeEmbed(patchInner),
        });

        const appOrigin = resolveWidgetEmbedAppOrigin();

        let embedMarkup: string | null = null;
        try {
          const snippetRes = await getWidgetEmbedSnippet(finalKey);
          if (!cancelled) embedMarkup = readEmbedSnippetMarkup(snippetRes);
        } catch {
          /* optional */
        }

        const fallbackScript = buildApiWidgetEmbedScript({
          widgetKey: finalKey,
          appOrigin,
        });

        const finalMarkup = normalizeEmbedSnippetForApi(
          embedMarkup && embedMarkup.trim().length > 0 ? embedMarkup : fallbackScript,
          appOrigin,
        );

        if (!cancelled) {
          setInstallUi({
            phase: "ready",
            draft: { ...typed, widgetId: finalKey, remoteWidgetKey: finalKey, completed: true },
            embedMarkup: finalMarkup,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setInstallUi({
            phase: "error",
            message:
              extractApiErrorMessageForToast(e) ??
              "Text Us install failed. Check permissions and websiteId.",
          });
        }
      }
    }

    void runInstall();
    return () => {
      cancelled = true;
    };
  }, []);

  const previewDraft =
    installUi.phase === "ready" ? installUi.draft : readChatWizardDraft(null);

  const fallbackDraft = readChatWizardDraft(null);
  const chatScript =
    installUi.phase === "ready"
      ? installUi.embedMarkup
      : buildUnifiedWidgetEmbedScript({
          widgetKey: fallbackDraft.widgetId?.startsWith("wgt_")
            ? fallbackDraft.widgetId
            : "YOUR_WIDGET_KEY",
        });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(chatScript);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const previewPanelHeight = 360;
  const previewPanelWidth = 320;
  const previewInsetBottomPx = 16;
  const previewSandboxMinHeight = previewInsetBottomPx + previewPanelHeight + 24;

  return (
    <WidgetFlowShell
      pageTitle="Text Us Widget Script"
      subtitle="Unified widget.js loader (same runtime as Chat when both surfaces are enabled)."
      cardTitle="Your Text Widget is Ready"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => setShowPreview((prev) => !prev)}>
            Preview Widget
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} onClick={handleCopy} disabled={installUi.phase === "loading"} startIcon={<ContentCopy sx={{ fontSize: 16 }} />}>
            {copied ? "Copied" : "Copy Script"}
          </Button>
        </>
      }
    >
      {installUi.phase === "loading" ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          Publishing Text Us widget (PATCH publishNow true, then snippet)…
        </Typography>
      ) : null}
      {installUi.phase === "error" ? (
        <Typography variant="body2" sx={{ color: theme.palette.error.main, mb: 1 }}>
          {installUi.message}
        </Typography>
      ) : null}

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.2 }}>Embed Code</Typography>
      <WidgetEmbedArchitectureHint />
      <Box sx={{ border: `1px solid ${theme.app.dashboard.cardBorder}`, borderRadius: 1.5, p: 1.5, bgcolor: theme.app.dashboard.overlayLight }}>
        <Typography component="pre" variant="body2" sx={{ color: theme.app.dashboard.textMuted, wordBreak: "break-word", whiteSpace: "pre-wrap", m: 0 }}>
          {chatScript}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
        <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>
          Go to Widget Dashboard
        </Button>
      </Box>

      {showPreview ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: 1 }}>
            Live preview
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1.25 }}>
            Labels from your draft ({previewDraft.textUsHeaderTitle ?? "Title"}).
          </Typography>
          <Box
            sx={{
              position: "relative",
              borderRadius: 2.5,
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
              bgcolor: "#E5EAF2",
              minHeight: previewSandboxMinHeight,
              overflow: "hidden",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            <Box
              role="region"
              aria-label="Text widget preview"
              sx={{
                position: "absolute",
                bottom: previewInsetBottomPx,
                left: "50%",
                transform: "translateX(-50%)",
                width: `${previewPanelWidth}px`,
                height: `${previewPanelHeight}px`,
                maxWidth: "calc(100% - 16px)",
                borderRadius: 2.5,
                overflow: "hidden",
                border: `1px solid ${theme.app.dashboard.cardBorder}`,
                bgcolor: "#EEF1F7",
                boxShadow: "0 14px 32px rgba(3, 12, 37, 0.28)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ px: 2, py: 1.5, bgcolor: previewDraft.textUsButtonColor ?? "#da9b2f", color: "#FFFFFF", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="mediumLarge" sx={{ color: "inherit" }}>
                    {previewDraft.textUsHeaderTitle ?? "Special Offer"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "inherit", opacity: 0.92 }}>
                    {previewDraft.textUsWelcomeMessage ?? ""}
                  </Typography>
                </Box>
                <IconButton
                  type="button"
                  size="small"
                  aria-label="Close preview"
                  onClick={() => setShowPreview(false)}
                  sx={{
                    color: "inherit",
                    mt: -0.4,
                    mr: -0.6,
                    opacity: 0.92,
                    "&:hover": { opacity: 1, bgcolor: "rgba(0,0,0,0.12)" },
                  }}
                >
                  <CloseRounded sx={{ fontSize: 22 }} />
                </IconButton>
              </Box>
              <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1, flex: 1, minHeight: 0, overflow: "hidden" }}>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                  <Box sx={{ bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: 1.25, px: 1.2, py: 0.9 }}>
                    <Typography variant="body2" sx={{ color: "#5B6B82" }}>{previewDraft.textUsFormFields?.find((f) => f.key === "name")?.label ?? "Name"}</Typography>
                  </Box>
                  <Box sx={{ bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: 1.25, px: 1.2, py: 0.9 }}>
                    <Typography variant="body2" sx={{ color: "#5B6B82" }}>{previewDraft.textUsFormFields?.find((f) => f.key === "email")?.label ?? "Email"}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                  <Box sx={{ bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: 1.25, px: 1.2, py: 0.9 }}>
                    <Typography variant="body2" sx={{ color: "#5B6B82" }}>{previewDraft.textUsFormFields?.find((f) => f.key === "message")?.label ?? "Message"}</Typography>
                  </Box>
                  <Box sx={{ bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: 1.25, px: 1.2, py: 0.9 }}>
                    <Typography variant="body2" sx={{ color: "#5B6B82" }}>{previewDraft.textUsFormFields?.find((f) => f.key === "phone")?.label ?? "Phone"}</Typography>
                  </Box>
                </Box>
                <Box sx={{ mt: "auto", display: "flex", alignItems: "center", gap: 1, bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: "22px", px: 1.2, py: 0.75 }}>
                  <ChatRounded sx={{ color: previewDraft.textUsButtonColor ?? "#da9b2f", fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: "#5B6B82", flex: 1 }}>
                    Enter message...
                  </Typography>
                  <IconButton
                    type="button"
                    aria-label="Send message"
                    size="small"
                    tabIndex={-1}
                    disableRipple
                    sx={{
                      bgcolor: previewDraft.textUsButtonColor ?? "#da9b2f",
                      color: "#FFFFFF",
                      width: 42,
                      height: 42,
                      flexShrink: 0,
                      "&:hover": { filter: "brightness(1.06)" },
                    }}
                  >
                    <SendRounded sx={{ fontSize: 22 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      ) : null}
    </WidgetFlowShell>
  );
}
