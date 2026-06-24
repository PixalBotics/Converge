"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/features/chat-widget";
import { WidgetWizardPageLayout } from "@/features/chat-widget/components/WidgetWizardPageLayout";
import { SchedulingSectionCard } from "@/features/website-assignments/components/ServiceSchedulingSections";
import { WidgetLauncherIconPicker } from "@/components/dashboard/chat-widget/WidgetLauncherIconPicker";
import { mergeWizardDraftForPublish } from "@/lib/chat-widget/merge-wizard-draft-for-publish";
import {
  patchRemoteWidgetConfigurationWithMeta,
  resolveWizardKindFromDraft,
  summarizePatchResult,
} from "@/lib/chat-widget/widget-remote-sync";
import { persistAssetUrlsOnDraft } from "@/lib/chat-widget/resolve-widget-draft-asset-urls";
import { useWidgetWizardSaveTrace } from "@/features/chat-widget/components/WidgetWizardSaveTraceContext";
import { extractApiErrorMessageForToast } from "@/lib/notify/extract-api-message";
import { publishAppToast } from "@/lib/notify";
import {
  readChatWizardDraft,
  resolveEditWidgetKeyForNavigation,
  resolveRemoteWidgetKeyForChatWizard,
  saveChatWizardDraft,
  useChatWidgetWizardEdit,
  withChatEditQuery,
} from "@/lib/chat-widget/chat-wizard-edit";
import { normalizeAgentAvatarPreset } from "@/lib/chat-widget/chat-avatar-presets";
import {
  buildChatColorsFromWidgetDraft,
  readWidgetChatColorsFromDraft,
  widgetChatColorsDraftToPatch,
} from "@/lib/chat-widget/widget-colors-draft";
import { WidgetLauncherLivePreview } from "@/components/dashboard/chat-widget/WidgetLauncherLivePreview";
import { WidgetColorPickerField } from "@/components/dashboard/chat-widget/WidgetColorPickerField";
import { WIDGET_BRAND_COLOR_PRESETS } from "@/lib/chat-widget/brand-color-presets";
import {
  WIDGET_LAUNCHER_STYLE_OPTIONS,
  type WidgetLauncherStyleId,
} from "@/lib/chat-widget/launcher-style";
import { proactiveTeaserPreviewFromDraft } from "@/lib/chat-widget/proactive-teaser-from-draft";
import {
  normalizeWhatsAppHref,
  validateWhatsAppHref,
} from "@/lib/chat-widget/proactive-whatsapp";
import { WidgetWizardToggleRow } from "@/features/chat-widget/components/WidgetWizardToggleRow";
import {
  defaultWidgetDraft,
  normalizeButtonPosition,
  type LauncherIconPresetId,
  type WidgetDraft,
} from "@/lib/chat-widget/widgetDraft";
import { WidgetWizardStepGuide } from "@/features/chat-widget/components/WidgetWizardStepGuide";
import {
  WidgetTextField,
} from "@/features/chat-widget/components/WidgetFormFields";
import { FIELD_MAX } from "@/lib/chat-widget/widget-field-validation";
import { useWizardStepFlush } from "@/lib/chat-widget/widget-wizard-step-flush";

function parseInsetPxString(raw: string, fallback: number): number {
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(240, Math.max(0, n));
}

export default function ChatWidgetButtonDesignPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { recordSave } = useWidgetWizardSaveTrace();
  const { editWidgetKey, draftReady, hydrateError } = useChatWidgetWizardEdit();
  const [buttonShape, setButtonShape] = useState<"circle" | "rounded" | "square">("circle");
  const [buttonPosition, setButtonPosition] = useState<"left" | "right">("right");
  const [selectedButtonColor, setSelectedButtonColor] = useState("#2AA9E0");
  const [selectedHoverColor, setSelectedHoverColor] = useState("#1C8DC2");
  const [selectedIconColor, setSelectedIconColor] = useState("#FFFFFF");
  const [iconFileName, setIconFileName] = useState("");
  const [iconDataUrl, setIconDataUrl] = useState("");
  const [launcherIconPreset, setLauncherIconPreset] = useState<LauncherIconPresetId>("phosphor-chat-circle");
  const [launcherIconEnabled, setLauncherIconEnabled] = useState(
    defaultWidgetDraft.launcherIconEnabled !== false,
  );
  const [launcherLabelEnabled, setLauncherLabelEnabled] = useState(
    defaultWidgetDraft.launcherLabelEnabled !== false,
  );
  const [buttonLabel, setButtonLabel] = useState(defaultWidgetDraft.buttonLabel ?? "Chat with us");
  const [launcherStyle, setLauncherStyle] = useState<WidgetLauncherStyleId>(
    defaultWidgetDraft.launcherStyle ?? "solid",
  );
  const [launcherInsetBottom, setLauncherInsetBottom] = useState("28");
  const [launcherInsetSide, setLauncherInsetSide] = useState("28");
  const [proactiveTeaserEnabled, setProactiveTeaserEnabled] = useState(
    defaultWidgetDraft.proactiveTeaserEnabled ?? true,
  );
  const [proactiveTeaser, setProactiveTeaser] = useState(
    defaultWidgetDraft.proactiveTeaser ?? "Any questions? Let us know!",
  );
  const [proactiveAvatarEnabled, setProactiveAvatarEnabled] = useState(
    defaultWidgetDraft.proactiveTeaserAvatarEnabled ?? false,
  );
  const [proactiveAvatarDataUrl, setProactiveAvatarDataUrl] = useState("");
  const [proactiveAvatarFileName, setProactiveAvatarFileName] = useState("");
  const [proactiveSecondaryCtaEnabled, setProactiveSecondaryCtaEnabled] = useState(
    defaultWidgetDraft.proactiveSecondaryCtaEnabled ?? false,
  );
  const [proactiveSecondaryCtaLabel, setProactiveSecondaryCtaLabel] = useState(
    defaultWidgetDraft.proactiveSecondaryCtaLabel ?? "Contact us on WhatsApp",
  );
  const [proactiveSecondaryCtaHref, setProactiveSecondaryCtaHref] = useState(
    defaultWidgetDraft.proactiveSecondaryCtaHref ?? "",
  );
  const [closedMessagePreviewEnabled, setClosedMessagePreviewEnabled] = useState(
    defaultWidgetDraft.closedMessagePreviewEnabled !== false,
  );
  const proactiveAvatarUploadRef = useRef<HTMLInputElement | null>(null);
  const iconUploadRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [checklistRefreshKey, setChecklistRefreshKey] = useState(0);

  useEffect(() => {
    if (!draftReady) return;
    const d = readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined);
    setButtonShape(d.buttonShape);
    const pos = normalizeButtonPosition(d.buttonPosition);
    setButtonPosition(pos === "left" ? "left" : "right");
    setSelectedButtonColor(d.buttonColor || "#2AA9E0");
    setSelectedHoverColor(d.buttonHoverColor || "#1C8DC2");
    setSelectedIconColor(d.iconColor || "#FFFFFF");
    setIconDataUrl(d.iconDataUrl || "");
    setIconFileName(d.iconDataUrl ? "Uploaded icon" : "");
    setLauncherIconPreset(d.launcherIconPreset);
    if (d.launcherIconEnabled != null) setLauncherIconEnabled(d.launcherIconEnabled);
    if (d.launcherLabelEnabled != null) setLauncherLabelEnabled(d.launcherLabelEnabled);
    setButtonLabel(
      typeof d.buttonLabel === "string" ? d.buttonLabel : (defaultWidgetDraft.buttonLabel ?? ""),
    );
    setLauncherStyle(d.launcherStyle ?? defaultWidgetDraft.launcherStyle ?? "solid");
    setLauncherInsetBottom(String(d.launcherInsetBottomPx ?? 28));
    setLauncherInsetSide(String(d.launcherInsetSidePx ?? 28));
    setProactiveTeaserEnabled(d.proactiveTeaserEnabled !== false);
    setProactiveTeaser(d.proactiveTeaser ?? defaultWidgetDraft.proactiveTeaser ?? "");
    setProactiveAvatarEnabled(d.proactiveTeaserAvatarEnabled === true);
    setProactiveAvatarDataUrl(d.proactiveTeaserAvatarDataUrl ?? "");
    setProactiveAvatarFileName(d.proactiveTeaserAvatarDataUrl ? "Agent avatar" : "");
    setProactiveSecondaryCtaEnabled(d.proactiveSecondaryCtaEnabled === true);
    setProactiveSecondaryCtaLabel(
      d.proactiveSecondaryCtaLabel ?? defaultWidgetDraft.proactiveSecondaryCtaLabel ?? "",
    );
    setProactiveSecondaryCtaHref(
      d.proactiveSecondaryCtaHref ?? defaultWidgetDraft.proactiveSecondaryCtaHref ?? "",
    );
    setClosedMessagePreviewEnabled(d.closedMessagePreviewEnabled !== false);
  }, [draftReady, editWidgetKey, checklistRefreshKey]);

  const stepStateRef = useRef({
    draftReady,
    editWidgetKey,
    buttonShape,
    buttonPosition,
    launcherInsetBottom,
    launcherInsetSide,
    selectedButtonColor,
    selectedHoverColor,
    selectedIconColor,
    iconDataUrl,
    launcherIconPreset,
    launcherIconEnabled,
    launcherLabelEnabled,
    buttonLabel,
    launcherStyle,
    proactiveTeaserEnabled,
    proactiveTeaser,
    proactiveAvatarEnabled,
    proactiveAvatarDataUrl,
    proactiveSecondaryCtaEnabled,
    proactiveSecondaryCtaLabel,
    proactiveSecondaryCtaHref,
    closedMessagePreviewEnabled,
  });
  stepStateRef.current = {
    draftReady,
    editWidgetKey,
    buttonShape,
    buttonPosition,
    launcherInsetBottom,
    launcherInsetSide,
    selectedButtonColor,
    selectedHoverColor,
    selectedIconColor,
    iconDataUrl,
    launcherIconPreset,
    launcherIconEnabled,
    launcherLabelEnabled,
    buttonLabel,
    launcherStyle,
    proactiveTeaserEnabled,
    proactiveTeaser,
    proactiveAvatarEnabled,
    proactiveAvatarDataUrl,
    proactiveSecondaryCtaEnabled,
    proactiveSecondaryCtaLabel,
    proactiveSecondaryCtaHref,
    closedMessagePreviewEnabled,
  };

  const flushStepToDraft = useCallback(() => {
    const s = stepStateRef.current;
    if (!s.draftReady) return;
    const editKey = resolveEditWidgetKeyForNavigation(s.editWidgetKey);
    const prev = readChatWizardDraft(editKey || undefined);
    const bottomPx = parseInsetPxString(s.launcherInsetBottom, 28);
    const sidePx = parseInsetPxString(s.launcherInsetSide, 28);
    const whatsappHref = normalizeWhatsAppHref(s.proactiveSecondaryCtaHref);
    saveChatWizardDraft(editKey || undefined, {
      type: prev.type,
      buttonShape: s.buttonShape,
      buttonPosition: s.buttonPosition,
      launcherInsetBottomPx: bottomPx,
      launcherInsetSidePx: sidePx,
      buttonColor: s.selectedButtonColor || "#2AA9E0",
      buttonHoverColor: s.selectedHoverColor || "#1C8DC2",
      iconColor: s.selectedIconColor || "#FFFFFF",
      iconDataUrl: s.iconDataUrl,
      launcherIconPreset: s.launcherIconPreset,
      launcherIconEnabled: s.launcherIconEnabled,
      launcherLabelEnabled: s.launcherLabelEnabled,
      buttonLabel: s.buttonLabel.trim(),
      launcherStyle: s.launcherStyle,
      proactiveTeaserEnabled: s.proactiveTeaserEnabled,
      proactiveTeaser: s.proactiveTeaser.trim(),
      proactiveTeaserAvatarEnabled: s.proactiveAvatarEnabled,
      proactiveTeaserAvatarDataUrl: s.proactiveAvatarEnabled ? s.proactiveAvatarDataUrl : "",
      proactiveSecondaryCtaEnabled: s.proactiveSecondaryCtaEnabled,
      proactiveSecondaryCtaLabel: s.proactiveSecondaryCtaEnabled
        ? s.proactiveSecondaryCtaLabel.trim()
        : "",
      proactiveSecondaryCtaHref: s.proactiveSecondaryCtaEnabled ? whatsappHref : "",
      proactiveSecondaryCtaKind: s.proactiveSecondaryCtaEnabled ? "whatsapp" : "",
      closedMessagePreviewEnabled: s.closedMessagePreviewEnabled,
      themePrimaryColor: prev.themePrimaryColor ?? s.selectedButtonColor,
      ...widgetChatColorsDraftToPatch(
        readWidgetChatColorsFromDraft({
          ...prev,
          buttonColor: s.selectedButtonColor || "#2AA9E0",
          buttonHoverColor: s.selectedHoverColor || "#1C8DC2",
          iconColor: s.selectedIconColor || "#FFFFFF",
        }),
      ),
    });
  }, []);

  useWizardStepFlush(flushStepToDraft);

  const themePreview = useMemo(() => {
    void checklistRefreshKey;
    if (!draftReady) {
      return {
        accent: defaultWidgetDraft.themeDesignJsonAccent ?? "blue",
        density: defaultWidgetDraft.themeDesignJsonDensity ?? "comfortable",
        launcherBadgeMode: defaultWidgetDraft.launcherBadgeMode ?? "count",
        fallbackNotificationText:
          defaultWidgetDraft.fallbackNotificationText ??
          "You have a new message from support.",
      };
    }
    const d = readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined);
    return {
      accent: d.themeDesignJsonAccent ?? defaultWidgetDraft.themeDesignJsonAccent ?? "blue",
      density: d.themeDesignJsonDensity ?? defaultWidgetDraft.themeDesignJsonDensity ?? "comfortable",
      launcherBadgeMode: d.launcherBadgeMode ?? defaultWidgetDraft.launcherBadgeMode ?? "count",
      fallbackNotificationText:
        d.fallbackNotificationText ??
        defaultWidgetDraft.fallbackNotificationText ??
        "You have a new message from support.",
    };
  }, [draftReady, editWidgetKey, checklistRefreshKey]);

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIconFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setIconDataUrl(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const previewBottomPx = parseInsetPxString(launcherInsetBottom, 28);
  const previewSidePx = parseInsetPxString(launcherInsetSide, 28);

  const incomingPreviewColors = useMemo(() => {
    void checklistRefreshKey;
    const base = draftReady
      ? readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined)
      : defaultWidgetDraft;
    const colors = buildChatColorsFromWidgetDraft({
      ...base,
      buttonColor: selectedButtonColor || base.buttonColor,
      buttonHoverColor: selectedHoverColor || base.buttonHoverColor,
      iconColor: selectedIconColor || base.iconColor,
      backgroundColor: base.backgroundColor,
      textColor: base.textColor,
      themeSecondaryColor: base.themeSecondaryColor,
    });
    const agentAvatarUrl =
      (base.agentAvatarDataUrl?.trim().startsWith("http") ? base.agentAvatarDataUrl.trim() : "") ||
      (proactiveAvatarEnabled && proactiveAvatarDataUrl?.trim().startsWith("http")
        ? proactiveAvatarDataUrl.trim()
        : "");
    return {
      bg: colors.incomingMessageBg,
      text: colors.incomingMessageText,
      muted: colors.mutedText,
      agentUrl: agentAvatarUrl,
      agentPreset: normalizeAgentAvatarPreset(base.agentAvatarPreset),
    };
  }, [
    draftReady,
    editWidgetKey,
    selectedButtonColor,
    selectedHoverColor,
    selectedIconColor,
    proactiveAvatarEnabled,
    proactiveAvatarDataUrl,
    checklistRefreshKey,
  ]);

  const teaserPreview = useMemo(
    () =>
      proactiveTeaserPreviewFromDraft({
        proactiveTeaserEnabled,
        proactiveTeaser,
        proactiveTeaserAvatarEnabled: proactiveAvatarEnabled,
        proactiveTeaserAvatarDataUrl: proactiveAvatarDataUrl,
        proactiveSecondaryCtaEnabled,
        proactiveSecondaryCtaLabel,
        proactiveSecondaryCtaHref: normalizeWhatsAppHref(proactiveSecondaryCtaHref),
        proactiveSecondaryCtaKind: proactiveSecondaryCtaEnabled ? "whatsapp" : "",
        closedMessagePreviewEnabled,
      } as WidgetDraft),
    [
      proactiveTeaserEnabled,
      proactiveTeaser,
      proactiveAvatarEnabled,
      proactiveAvatarDataUrl,
      proactiveSecondaryCtaEnabled,
      proactiveSecondaryCtaLabel,
      proactiveSecondaryCtaHref,
      closedMessagePreviewEnabled,
    ],
  );

  const handleProactiveAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setProactiveAvatarFileName(file.name);
    const reader = new FileReader();
    reader.onload = () =>
      setProactiveAvatarDataUrl(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (saving) return;
    if (!launcherIconEnabled && (!launcherLabelEnabled || !buttonLabel.trim())) {
      publishAppToast({
        variant: "error",
        message: "Turn on the launcher icon or button label, and add label text.",
      });
      return;
    }
    const bottomPx = parseInsetPxString(launcherInsetBottom, 28);
    const sidePx = parseInsetPxString(launcherInsetSide, 28);
    const whatsappHref = normalizeWhatsAppHref(proactiveSecondaryCtaHref);
    if (proactiveSecondaryCtaEnabled) {
      const whatsappError = validateWhatsAppHref(proactiveSecondaryCtaHref);
      if (whatsappError) {
        publishAppToast({ variant: "error", message: whatsappError });
        return;
      }
      if (!proactiveSecondaryCtaLabel.trim()) {
        publishAppToast({ variant: "error", message: "WhatsApp button label is required." });
        return;
      }
    }
    void (async () => {
      const editKey = resolveEditWidgetKeyForNavigation(editWidgetKey);
      const prev = readChatWizardDraft(editKey || undefined);
      const rk = resolveRemoteWidgetKeyForChatWizard(editKey || undefined, prev);
      if (!rk) {
        publishAppToast({
          variant: "error",
          message:
            "Missing server widget draft. Go back to the first step and save again.",
        });
        router.push("/dashboard/chat-widget/add");
        return;
      }

      setSaving(true);
      try {
        const colorSeed = readWidgetChatColorsFromDraft({
          ...prev,
          buttonColor: selectedButtonColor || "#2AA9E0",
          buttonHoverColor: selectedHoverColor || "#1C8DC2",
          iconColor: selectedIconColor || "#FFFFFF",
          textColor: prev.textColor ?? defaultWidgetDraft.textColor,
          themeSecondaryColor: prev.themeSecondaryColor ?? defaultWidgetDraft.themeSecondaryColor,
          backgroundColor: prev.backgroundColor ?? defaultWidgetDraft.backgroundColor,
        });

        saveChatWizardDraft(editKey || undefined, {
          type: prev.type,
          buttonShape,
          buttonPosition,
          launcherInsetBottomPx: bottomPx,
          launcherInsetSidePx: sidePx,
          buttonColor: selectedButtonColor || "#2AA9E0",
          buttonHoverColor: selectedHoverColor || "#1C8DC2",
          iconColor: selectedIconColor || "#FFFFFF",
          iconDataUrl,
          launcherIconPreset,
          launcherIconEnabled,
          launcherLabelEnabled,
          buttonLabel: buttonLabel.trim(),
          launcherStyle,
          proactiveTeaserEnabled,
          proactiveTeaser: proactiveTeaser.trim(),
          proactiveTeaserAvatarEnabled: proactiveAvatarEnabled,
          proactiveTeaserAvatarDataUrl: proactiveAvatarEnabled ? proactiveAvatarDataUrl : "",
          proactiveSecondaryCtaEnabled,
          proactiveSecondaryCtaLabel: proactiveSecondaryCtaEnabled
            ? proactiveSecondaryCtaLabel.trim()
            : "",
          proactiveSecondaryCtaHref: proactiveSecondaryCtaEnabled ? whatsappHref : "",
          proactiveSecondaryCtaKind: proactiveSecondaryCtaEnabled ? "whatsapp" : "",
          closedMessagePreviewEnabled,
          completed: false,
          widgetId: prev.widgetId?.startsWith("wgt_") ? prev.widgetId : rk,
          themeName: prev.themeName ?? defaultWidgetDraft.themeName,
          themePrimaryColor: prev.themePrimaryColor ?? selectedButtonColor,
          themeSecondaryColor: prev.themeSecondaryColor ?? defaultWidgetDraft.themeSecondaryColor,
          ...widgetChatColorsDraftToPatch(colorSeed),
          themeFontFamily: prev.themeFontFamily ?? defaultWidgetDraft.themeFontFamily,
          themeBubbleStyle: prev.themeBubbleStyle ?? defaultWidgetDraft.themeBubbleStyle,
          themeBorderRadiusPx: prev.themeBorderRadiusPx ?? defaultWidgetDraft.themeBorderRadiusPx,
          themeWelcomeFontSizePx:
            prev.themeWelcomeFontSizePx ?? defaultWidgetDraft.themeWelcomeFontSizePx,
          themeBodyFontSizePx: prev.themeBodyFontSizePx ?? defaultWidgetDraft.themeBodyFontSizePx,
          themeInputFontSizePx: prev.themeInputFontSizePx ?? defaultWidgetDraft.themeInputFontSizePx,
          themeCtaFontSizePx: prev.themeCtaFontSizePx ?? defaultWidgetDraft.themeCtaFontSizePx,
          themeConsentFontSizePx:
            prev.themeConsentFontSizePx ?? defaultWidgetDraft.themeConsentFontSizePx,
          themeLineHeightPx: prev.themeLineHeightPx ?? defaultWidgetDraft.themeLineHeightPx,
          themeDesignJsonAccent:
            prev.themeDesignJsonAccent ?? defaultWidgetDraft.themeDesignJsonAccent,
          themeDesignJsonDensity:
            prev.themeDesignJsonDensity ?? defaultWidgetDraft.themeDesignJsonDensity,
        });
        const latest = readChatWizardDraft(editKey || undefined);
        const patchMeta = await patchRemoteWidgetConfigurationWithMeta({
          widgetKey: rk,
          widgetKind: resolveWizardKindFromDraft(latest),
          draft: latest,
          publishNow: false,
          chatWizardPatchScope: "launcher_only",
        });
        recordSave({
          stepKey: "button",
          stepLabel: "Step 1 — Button",
          method: patchMeta.method,
          path: patchMeta.path,
          scope: patchMeta.scope,
          publishNow: patchMeta.publishNow,
          requestBody: patchMeta.requestBody,
          responseBody: patchMeta.inner,
        });
        const sum = summarizePatchResult(patchMeta.inner);
        if (patchMeta.assetUrls) {
          saveChatWizardDraft(editKey || undefined, persistAssetUrlsOnDraft(latest, patchMeta.assetUrls));
        }
        if (patchMeta.assetErrors?.length) {
          publishAppToast({
            variant: "error",
            message: patchMeta.assetErrors.join(" "),
          });
        }
        saveChatWizardDraft(editKey || undefined, {
          ...mergeWizardDraftForPublish(readChatWizardDraft(editKey || undefined)),
          requiresPublishBeforeEmbed: sum.requiresPublishBeforeEmbed,
        });
        setChecklistRefreshKey((k) => k + 1);
        router.push(
          withChatEditQuery(
            "/dashboard/chat-widget/add/chat/box",
            resolveEditWidgetKeyForNavigation(editKey) || rk,
          ),
        );
      } catch (e) {
        publishAppToast({
          variant: "error",
          message:
            extractApiErrorMessageForToast(e) ?? "Could not save button design to the server.",
        });
      } finally {
        setSaving(false);
      }
    })();
  };

  return (
    <WidgetFlowShell
      pageTitle="Widget Customization"
      subtitle="Shape, colors, and position of the floating chat launcher."
      cardTitle="Launcher design"
      currentStep={0}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            sx={gradientPrimaryButtonSx}
            disabled={saving || !draftReady}
            onClick={handleNext}
          >
            {saving ? "Saving…" : "Next"}
          </Button>
        </>
      }
    >
      {!draftReady ? (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1 }}>
          Loading widget…
        </Typography>
      ) : null}
      {hydrateError ? (
        <Typography variant="body2" sx={{ color: theme.palette.error.main, mb: 1 }}>
          {hydrateError}
        </Typography>
      ) : null}
      <WidgetWizardPageLayout
        showChecklist={false}
        checklistRefreshKey={checklistRefreshKey}
        preview={
          <WidgetLauncherLivePreview
            buttonShape={buttonShape}
            buttonPosition={buttonPosition}
            insetBottomPx={previewBottomPx}
            insetSidePx={previewSidePx}
            buttonColor={selectedButtonColor || "#2AA9E0"}
            hoverColor={selectedHoverColor || "#1C8DC2"}
            iconColor={selectedIconColor || "#FFFFFF"}
            iconDataUrl={iconDataUrl}
            launcherIconPreset={launcherIconPreset}
            launcherIconEnabled={launcherIconEnabled}
            launcherLabelEnabled={launcherLabelEnabled}
            buttonLabel={buttonLabel}
            proactiveTeaser={teaserPreview.text}
            proactiveTeaserActive={teaserPreview.active}
            proactiveTeaserAvatarUrl={teaserPreview.avatarUrl}
            proactiveSecondaryCta={teaserPreview.secondaryCta}
            accent={themePreview.accent}
            density={themePreview.density}
            launcherStyle={launcherStyle}
            closedMessagePreviewEnabled={closedMessagePreviewEnabled}
            incomingPreviewSampleText={themePreview.fallbackNotificationText}
            incomingPreviewBg={incomingPreviewColors.bg}
            incomingPreviewTextColor={incomingPreviewColors.text}
            incomingPreviewMutedColor={incomingPreviewColors.muted}
            incomingPreviewAgentUrl={incomingPreviewColors.agentUrl}
            incomingPreviewAgentPreset={incomingPreviewColors.agentPreset}
            launcherBadgeMode={themePreview.launcherBadgeMode}
          />
        }
      >
        <WidgetWizardStepGuide step="button" />
        <SchedulingSectionCard title="Launcher shape & position" subtitle="Floating button geometry and screen placement.">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box>
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: 1 }}>Button Shape</Typography>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        <IconButton
          type="button"
          aria-label="Circle button shape"
          onClick={() => setButtonShape("circle")}
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            bgcolor: buttonShape === "circle" ? theme.app.dashboard.accentBlue : theme.app.dashboard.overlayLight,
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              bgcolor: theme.app.text.primary,
            }}
          />
        </IconButton>
        <IconButton
          type="button"
          aria-label="Rounded button shape"
          onClick={() => setButtonShape("rounded")}
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: buttonShape === "rounded" ? theme.app.dashboard.accentBlue : theme.app.dashboard.overlayLight,
          }}
        >
          <Box aria-hidden sx={{ width: 24, height: 18, borderRadius: "6px", bgcolor: theme.app.text.primary }} />
        </IconButton>
        <IconButton
          type="button"
          aria-label="Square button shape"
          onClick={() => setButtonShape("square")}
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1,
            bgcolor: buttonShape === "square" ? theme.app.dashboard.accentBlue : theme.app.dashboard.overlayLight,
          }}
        >
          <Box aria-hidden sx={{ width: 20, height: 20, borderRadius: "4px", bgcolor: theme.app.text.primary }} />
        </IconButton>
      </Box>

      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mt: 0.75 }}>
        {buttonShape === "circle" ? "Circle" : buttonShape === "rounded" ? "Rounded" : "Square"}
      </Typography>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        <WidgetColorPickerField
          label="Button color"
          value={selectedButtonColor}
          onChange={setSelectedButtonColor}
          fallback="#2563eb"
        />
        <WidgetColorPickerField
          label="Hover color"
          value={selectedHoverColor}
          onChange={setSelectedHoverColor}
          fallback="#1d4ed8"
        />
        <WidgetColorPickerField
          label="Icon color"
          value={selectedIconColor}
          onChange={setSelectedIconColor}
          fallback="#ffffff"
        />
      </Box>

      <Box>
        <Typography variant="body2" sx={{ color: theme.app.text.primary, fontWeight: 600, mb: 0.75 }}>
          Brand presets
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {WIDGET_BRAND_COLOR_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant="secondary"
              size="small"
              onClick={() => {
                setSelectedButtonColor(preset.buttonColor);
                setSelectedHoverColor(preset.buttonHoverColor);
                setSelectedIconColor(preset.iconColor);
              }}
              sx={{
                minWidth: 0,
                px: 1.25,
                py: 0.5,
                display: "inline-flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  bgcolor: preset.buttonColor,
                  border: "1px solid rgba(255,255,255,0.35)",
                }}
              />
              {preset.label}
            </Button>
          ))}
        </Box>
      </Box>

      <Box>
        <Typography variant="body2" sx={{ color: theme.app.text.primary, fontWeight: 600, mb: 0.75 }}>
          Launcher style
        </Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1 }}>
          {WIDGET_LAUNCHER_STYLE_OPTIONS.map((opt) => {
            const selected = launcherStyle === opt.id;
            return (
              <Button
                key={opt.id}
                type="button"
                variant={selected ? "primary" : "secondary"}
                onClick={() => setLauncherStyle(opt.id)}
                sx={{ flexDirection: "column", alignItems: "flex-start", textAlign: "left", py: 1.25 }}
              >
                <Typography variant="caption" fontWeight={700} sx={{ display: "block" }}>
                  {opt.label}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, lineHeight: 1.3 }}>
                  {opt.description}
                </Typography>
              </Button>
            );
          })}
        </Box>
      </Box>

      <SchedulingSectionCard
        title="Invitation bubble"
        subtitle="Optional callout above the launcher when chat is closed. Turn off if you only want the FAB."
        sx={{ mb: 0, p: { xs: 1.75, sm: 2 } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="body2" sx={{ color: theme.app.text.primary, fontWeight: 600 }}>
            Show invitation bubble
          </Typography>
          <Switch
            checked={proactiveTeaserEnabled}
            onChange={(_, checked) => setProactiveTeaserEnabled(checked)}
            color="success"
          />
        </Box>
        {proactiveTeaserEnabled ? (
          <>
        <WidgetTextField
          label="Invitation message"
          name="proactive-teaser"
          placeholder="Any questions? Let us know!"
          value={proactiveTeaser}
          onChange={setProactiveTeaser}
          maxLength={FIELD_MAX.message}
          helperText="Shown in the bubble above the chat button while the widget is closed."
        />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
          <Typography variant="body2" sx={{ color: theme.app.text.primary, fontWeight: 600 }}>
            Show agent avatar
          </Typography>
          <Switch
            checked={proactiveAvatarEnabled}
            onChange={(_, checked) => setProactiveAvatarEnabled(checked)}
            color="success"
          />
        </Box>
        {proactiveAvatarEnabled ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1 }}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => proactiveAvatarUploadRef.current?.click()}
          >
            {proactiveAvatarFileName || "Upload agent avatar"}
          </Button>
          <input
            ref={proactiveAvatarUploadRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleProactiveAvatarUpload}
          />
          {proactiveAvatarDataUrl ? (
            <Box
              component="img"
              src={proactiveAvatarDataUrl}
              alt=""
              sx={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
            />
          ) : null}
        </Box>
        ) : null}
        <WidgetWizardToggleRow
          label="WhatsApp button"
          description="Optional second action in the invitation bubble — opens WhatsApp in a new tab."
          checked={proactiveSecondaryCtaEnabled}
          onChange={setProactiveSecondaryCtaEnabled}
          disabled={!proactiveTeaserEnabled}
        />
        {proactiveSecondaryCtaEnabled && proactiveTeaserEnabled ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1 }}>
            <WidgetTextField
              label="WhatsApp button label"
              name="proactive-whatsapp-label"
              value={proactiveSecondaryCtaLabel}
              onChange={setProactiveSecondaryCtaLabel}
              maxLength={FIELD_MAX.shortLabel}
              placeholder="Contact us on WhatsApp"
            />
            <WidgetTextField
              label="WhatsApp number or link"
              name="proactive-whatsapp-href"
              value={proactiveSecondaryCtaHref}
              onChange={setProactiveSecondaryCtaHref}
              maxLength={FIELD_MAX.url}
              placeholder="+1 555 0100 or https://wa.me/15550100"
              helperText="Phone number with country code, or a full wa.me link."
            />
          </Box>
        ) : null}
          </>
        ) : null}
      </SchedulingSectionCard>

      <SchedulingSectionCard
        title="Closed-widget alerts"
        subtitle="What visitors see on your site before they open chat."
        sx={{ mb: 0, p: { xs: 1.75, sm: 2 } }}
      >
        <WidgetWizardToggleRow
          label="Live message preview"
          description="When an agent replies while chat is closed, show their message above the launcher (replaces the invitation bubble until opened)."
          checked={closedMessagePreviewEnabled}
          onChange={setClosedMessagePreviewEnabled}
        />
        <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mt: 1 }}>
          Unread badge style is configured on the Notifications step. Preview shows the current badge setting.
        </Typography>
      </SchedulingSectionCard>

      <WidgetWizardToggleRow
        label="Button label"
        description="Turn off to hide text on the launcher — visitors see the icon and shape only."
        checked={launcherLabelEnabled}
        onChange={setLauncherLabelEnabled}
      />

      {launcherLabelEnabled ? (
      <Box>
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: 0.5 }}>
        Launcher button text
      </Typography>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1.25 }}>
        {launcherIconEnabled
          ? "Shown on the floating pill next to the icon."
          : "Required when the icon is off — this is the only label visitors see."}
      </Typography>
      <WidgetTextField
        label="Button label"
        value={buttonLabel}
        onChange={setButtonLabel}
        maxLength={FIELD_MAX.shortLabel}
        placeholder="Chat with us"
      />
      </Box>
      ) : (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          Label hidden — visitors see the launcher icon only (your chosen shape is kept).
        </Typography>
      )}

      <WidgetWizardToggleRow
        label="Launcher icon"
        description="Turn off to show only your button text (no glyph)."
        checked={launcherIconEnabled}
        onChange={setLauncherIconEnabled}
      />

      {launcherIconEnabled ? (
      <Box>
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: 0.5 }}>
        Default launcher icon
      </Typography>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1.25 }}>
       Upload your own file below to override.
      </Typography>
      <WidgetLauncherIconPicker
        buttonColor={selectedButtonColor || "#2AA9E0"}
        hoverColor={selectedHoverColor || "#1C8DC2"}
        iconColor={selectedIconColor || "#FFFFFF"}
        launcherIconPreset={launcherIconPreset}
        iconDataUrl={iconDataUrl}
        onSelectDefault={() => {
          setLauncherIconPreset("");
          setIconDataUrl("");
          setIconFileName("");
        }}
        onSelectPreset={(id) => {
          setLauncherIconPreset(id);
          setIconDataUrl("");
          setIconFileName("");
        }}
      />

      <Box
        role="button"
        tabIndex={0}
        onClick={() => iconUploadRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            iconUploadRef.current?.click();
          }
        }}
        sx={{
          border: `1px dashed ${theme.app.dashboard.accentBlue}`,
          borderRadius: 1.5,
          py: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(6, 12, 54, 0.4)",
          gap: 0.75,
          cursor: "pointer",
        }}
      >
        <CloudUploadOutlined sx={{ color: theme.app.dashboard.accentBlue }} />
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          Upload SVG icon or icon
        </Typography>
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          {iconFileName || "Max 10 MB files are allowed"}
        </Typography>
      </Box>
      <Box component="input" ref={iconUploadRef} type="file" accept=".svg,.png,.jpg,.jpeg,.webp" onChange={handleIconUpload} sx={{ display: "none" }} />
      </Box>
      ) : null}

      <SelectField
        label="Button Position"
        value={buttonPosition}
        onChange={(v) => setButtonPosition(v === "left" ? "left" : "right")}
        options={[
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ]}
      />

      <Box>
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: 0.5 }}>
        Launcher position (fine tune)
      </Typography>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1.25 }}>
        Bottom inset moves the launcher up from the screen edge. Side inset controls spacing from the left or right corner.
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
        <InputField
          label="Inset from bottom (px)"
          name="launcher-inset-bottom"
          type="text"
          value={launcherInsetBottom}
          onChange={(event) => setLauncherInsetBottom(event.target.value)}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 0, max: 240 }}
        />
        <InputField
          label="Inset from side (px)"
          name="launcher-inset-side"
          type="text"
          value={launcherInsetSide}
          onChange={(event) => setLauncherInsetSide(event.target.value)}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 0, max: 240 }}
        />
      </Box>
      </Box>

      </Box>

        </SchedulingSectionCard>
      </WidgetWizardPageLayout>
    </WidgetFlowShell>
  );
}
