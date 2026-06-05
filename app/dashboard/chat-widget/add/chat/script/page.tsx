"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChatRounded from "@mui/icons-material/ChatRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import SendRounded from "@mui/icons-material/SendRounded";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { getWidgetEmbedSnippet } from "@/api/widgets/widgets.api";
import { Button, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/features/chat-widget";
import { WidgetEmbedArchitectureHint } from "@/features/chat-widget/components/WidgetEmbedArchitectureHint";
import { WidgetEmbedTestLink } from "@/features/chat-widget/components/WidgetEmbedTestLink";
import { WidgetWizardSiteChromePreview } from "@/features/chat-widget/components/WidgetWizardSiteChromePreview";
import {
  WidgetWizardSaveTracePanel,
  useWidgetWizardSaveTrace,
} from "@/features/chat-widget/components/WidgetWizardSaveTraceContext";
import { LauncherPresetIcon } from "@/lib/chat-widget/launcherIcons";
import type { WidgetDraft } from "@/lib/chat-widget/widgetDraft";
import {
  readChatWizardDraft,
  resolveEditWidgetKeyForNavigation,
  saveChatWizardDraft,
  useChatWidgetWizardEdit,
} from "@/lib/chat-widget/chat-wizard-edit";
import { mergeWizardDraftForPublish } from "@/lib/chat-widget/merge-wizard-draft-for-publish";
import {
  createRemoteWidgetDraftWithMeta,
  patchRemoteWidgetConfigurationWithMeta,
} from "@/lib/chat-widget/widget-remote-sync";
import {
  pickInstallWidgetKeys,
  pickRequiresPublishBeforeEmbed,
  readEmbedSnippetMarkup,
} from "@/lib/chat-widget/widget-install-response";
import { uploadDraftWidgetAssets } from "@/lib/chat-widget/upload-widget-draft-assets";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";
import {
  buildApiWidgetEmbedScript,
  normalizeEmbedSnippetForApi,
  resolveWidgetEmbedAppOrigin,
} from "@/lib/chat-widget/widget-embed-api-origin";

function launcherSandboxHorizontalSx(position: WidgetDraft["buttonPosition"], sidePx: number): Record<string, string | number> {
  if (position === "left") return { left: sidePx, right: "auto", transform: "none" };
  if (position === "right") return { right: sidePx, left: "auto", transform: "none" };
  return { left: "50%", right: "auto", transform: `translateX(calc(-50% + ${sidePx}px))` };
}

type InstallUiState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; draft: WidgetDraft; embedMarkup: string };

export default function ChatWidgetScriptPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { recordSave } = useWidgetWizardSaveTrace();
  const { editWidgetKey, draftReady, hydrateError } = useChatWidgetWizardEdit();
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [installUi, setInstallUi] = useState<InstallUiState>({ phase: "loading" });

  const waitingHydrate = Boolean(resolveEditWidgetKeyForNavigation(editWidgetKey)) && !draftReady;

  useEffect(() => {
    if (!draftReady) return;

    let cancelled = false;

    async function runInstall() {
      const editKey = resolveEditWidgetKeyForNavigation(editWidgetKey);
      const current = readChatWizardDraft(editKey || undefined);
      const typed = { ...current, type: "chat" as const };

      if (!typed.websiteId?.trim()) {
        setInstallUi({
          phase: "error",
          message: editKey
            ? "This widget has no websiteId in the API response. Contact support or set website on the widget record."
            : "Choose a website on the first step (Add Widget → Website) before finishing install.",
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
          publishAppToast({
            variant: "error",
            message: assetErrors.join(" "),
          });
        }

        let widgetKey = typed.remoteWidgetKey?.trim() || "";

        if (editKey) {
          widgetKey = editKey;
        } else if (!widgetKey) {
          const created = await createRemoteWidgetDraftWithMeta({
            draft: typed,
            widgetKind: "chat",
          });
          widgetKey = created.widgetKey;
          saveChatWizardDraft(undefined, {
            ...typed,
            remoteWidgetKey: widgetKey,
            widgetId: widgetKey,
            requiresPublishBeforeEmbed: created.requiresPublishBeforeEmbed,
          });
        }

        const draftForPublish = mergeWizardDraftForPublish(
          readChatWizardDraft(editKey || undefined),
        );
        saveChatWizardDraft(editKey || undefined, draftForPublish);

        const patchMeta = await patchRemoteWidgetConfigurationWithMeta({
          widgetKey,
          widgetKind: "chat",
          draft: draftForPublish,
          publishNow: true,
          assetUrls,
          embedAllowAnyOrigin: false,
        });
        if (cancelled) return;

        recordSave({
          stepKey: "install",
          stepLabel: "Step 4 — Install (publish)",
          method: patchMeta.method,
          path: patchMeta.path,
          scope: patchMeta.scope,
          publishNow: patchMeta.publishNow,
          requestBody: patchMeta.requestBody,
          responseBody: patchMeta.inner,
        });

        const keys = pickInstallWidgetKeys(patchMeta.inner);

        const finalKey = keys.widgetKey || widgetKey;
        if (!finalKey) {
          throw new Error("Publish completed but widgetKey is missing.");
        }

        saveChatWizardDraft(editKey || undefined, {
          ...readChatWizardDraft(editKey || undefined),
          type: "chat",
          widgetId: finalKey,
          remoteWidgetKey: finalKey,
          completed: true,
          requiresPublishBeforeEmbed: pickRequiresPublishBeforeEmbed(patchMeta.inner),
        });

        const appOrigin = resolveWidgetEmbedAppOrigin();

        let embedMarkup: string | null = null;
        try {
          const snippetRes = await getWidgetEmbedSnippet(finalKey);
          if (!cancelled) embedMarkup = readEmbedSnippetMarkup(snippetRes);
        } catch {
          /* optional richer snippet */
        }

        const fallbackScript = buildApiWidgetEmbedScript({
          widgetKey: finalKey,
          appOrigin,
        });

        const rawMarkup =
          embedMarkup && embedMarkup.trim().length > 0 ? embedMarkup : fallbackScript;
        const finalMarkup = normalizeEmbedSnippetForApi(rawMarkup, appOrigin);

        if (!cancelled) {
          setInstallUi({
            phase: "ready",
            draft: { ...typed, widgetId: finalKey, remoteWidgetKey: finalKey, completed: true },
            embedMarkup: finalMarkup,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setInstallUi({
            phase: "error",
            message: extractApiErrorMessageForToast(err) ?? "Install request failed.",
          });
        }
      }
    }

    void runInstall();
    return () => {
      cancelled = true;
    };
  }, [draftReady, editWidgetKey, recordSave]);

  const draft =
    installUi.phase === "ready"
      ? installUi.draft
      : readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined);

  const appOrigin = resolveWidgetEmbedAppOrigin();

  const chatScript =
    installUi.phase === "ready"
      ? installUi.embedMarkup
      : buildApiWidgetEmbedScript({
          widgetKey: draft.widgetId?.startsWith("wgt_") ? draft.widgetId : "YOUR_WIDGET_KEY",
          appOrigin,
        });

  const previewPanelHeight = draft ? Math.max(320, Math.min(640, draft.boxHeight)) : 400;
  const previewPanelWidth = draft ? Math.max(280, Math.min(520, draft.boxWidth)) : 320;
  const previewSandboxMinHeight = draft
    ? Math.max(320, draft.launcherInsetBottomPx + previewPanelHeight + 24)
    : 400;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(chatScript);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <WidgetFlowShell
      pageTitle="Widget Script"
      subtitle="Publish to production, then paste the embed snippet on your site"
      cardTitle="Install & publish"
      currentStep={3}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => setShowPreview((prev) => !prev)}>Preview Widget</Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            onClick={handleCopy}
            disabled={installUi.phase === "loading" || waitingHydrate}
            startIcon={<ContentCopy sx={{ fontSize: 16 }} />}
          >
            {copied ? "Copied" : "Copy Script"}
          </Button>
        </>
      }
    >
      <WidgetWizardSaveTracePanel />

      {waitingHydrate ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          Loading widget…
        </Typography>
      ) : null}

      {hydrateError ? (
        <Typography variant="body2" sx={{ color: theme.palette.error.main, mb: 1 }}>
          {hydrateError}
        </Typography>
      ) : null}

      {installUi.phase === "loading" && !waitingHydrate ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          Publishing widget (PATCH publishNow true → optional POST publish → embed snippet)…
        </Typography>
      ) : null}

      {installUi.phase === "error" ? (
        <Typography variant="body2" sx={{ color: theme.palette.error.main, mb: 1 }}>
          {installUi.message}
        </Typography>
      ) : null}

      <Box sx={{ minWidth: 0 }}>
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.2 }}>Embed Code</Typography>
      <WidgetEmbedArchitectureHint />
      <Box
        sx={{
          border: `1px solid ${theme.app.dashboard.cardBorder}`,
          borderRadius: 2,
          p: 1.5,
          bgcolor: theme.app.dashboard.overlayLight,
        }}
      >
        <Typography component="pre" variant="body2" sx={{ color: theme.app.dashboard.textMuted, wordBreak: "break-word", whiteSpace: "pre-wrap", m: 0 }}>
          {chatScript}
        </Typography>
      </Box>
      {installUi.phase === "ready" && draft.remoteWidgetKey ? (
        <WidgetEmbedTestLink
          widgetKey={draft.remoteWidgetKey}
          websiteId={draft.websiteId}
          requiresPublishBeforeEmbed={draft.requiresPublishBeforeEmbed}
        />
      ) : null}
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 1 }}>
        {installUi.phase === "ready"
          ? "Deployed from dashboard. Rotate deploy keys from Widget admin APIs when needed."
          : installUi.phase === "error"
            ? "Fix the issue above or verify chat-widget:create / chat-widget:update permissions."
            : "Fetching embed snippet…"}
      </Typography>

      {showPreview ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: 1 }}>
            Live preview
          </Typography>
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1.25 }}>
            Closed-state chrome matches your Button step; open panel is a static mock — use Open embed preview for the real runtime.
          </Typography>
          <Box sx={{ mb: 2 }}>
            <WidgetWizardSiteChromePreview draft={draft} />
          </Box>
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
              aria-label="Chat widget preview"
              sx={{
                position: "absolute",
                ...launcherSandboxHorizontalSx(draft.buttonPosition, draft.launcherInsetSidePx),
                bottom: draft.launcherInsetBottomPx,
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
            <Box sx={{ px: 2, py: 1.5, bgcolor: draft.buttonColor, color: draft.textColor, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="mediumLarge" sx={{ color: "inherit", textAlign: draft.headerTitleAlign === "Left" ? "left" : "center" }}>
                  {draft.headerTitle}
                </Typography>
                <Typography variant="body2" sx={{ color: "inherit", opacity: 0.9, textAlign: draft.headerTitleAlign === "Left" ? "left" : "center" }}>
                  Online now
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
              <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                <Box sx={{ bgcolor: "#DDE3EC", borderRadius: 2, p: 1.2 }}>
                  <Typography variant="body2" sx={{ color: "#1B2A3D" }}>
                    {draft.greetingMessage}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "#FFFFFF", border: "1px solid #CCD6E6", borderRadius: "22px", px: 1.2, py: 0.75, flexShrink: 0 }}>
                {draft.iconDataUrl ? (
                  <Box component="img" src={draft.iconDataUrl} alt="" sx={{ width: 20, height: 20, objectFit: "contain" }} />
                ) : draft.launcherIconPreset ? (
                  <LauncherPresetIcon presetId={draft.launcherIconPreset} color={draft.iconColor} fontSizePx={20} />
                ) : (
                  <ChatRounded sx={{ color: draft.iconColor, fontSize: 20 }} />
                )}
                <Typography variant="body2" sx={{ color: "#5B6B82", flex: 1 }}>
                  {draft.sendPlaceholder}
                </Typography>
                <IconButton
                  type="button"
                  aria-label="Send message"
                  size="small"
                  tabIndex={-1}
                  disableRipple
                  sx={{
                    bgcolor: draft.buttonColor,
                    color: "#FFFFFF",
                    width: 42,
                    height: 42,
                    flexShrink: 0,
                    "&:hover": { bgcolor: draft.buttonHoverColor || draft.buttonColor, filter: "brightness(1.06)" },
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

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>
          Go to Widget Dashboard
        </Button>
      </Box>
      </Box>
    </WidgetFlowShell>
  );
}
