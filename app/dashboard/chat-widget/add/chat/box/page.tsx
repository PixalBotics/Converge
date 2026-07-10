"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/features/chat-widget";
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
import { WidgetChatBoxLivePreview } from "@/components/dashboard/chat-widget/WidgetChatBoxLivePreview";
import { WidgetLauncherLivePreview } from "@/components/dashboard/chat-widget/WidgetLauncherLivePreview";
import { WidgetColorPickerField } from "@/components/dashboard/chat-widget/WidgetColorPickerField";
import { WidgetChatColorsSection, WidgetMessageBubbleColorFields } from "@/components/dashboard/chat-widget/WidgetChatColorsSection";
import {
  readWidgetChatColorsFromDraft,
  widgetChatColorsDraftToPatch,
  type WidgetChatColorsDraft,
} from "@/lib/chat-widget/widget-colors-draft";
import { SchedulingSectionCard } from "@/features/website-assignments/components/ServiceSchedulingSections";
import { WidgetWizardPageLayout } from "@/features/chat-widget/components/WidgetWizardPageLayout";
import { WidgetWizardStepGuide } from "@/features/chat-widget/components/WidgetWizardStepGuide";
import {
  WidgetNumericField,
  WidgetTextField,
  WidgetUrlField,
} from "@/features/chat-widget/components/WidgetFormFields";
import { WidgetWizardToggleRow } from "@/features/chat-widget/components/WidgetWizardToggleRow";
import { defaultWidgetDraft } from "@/lib/chat-widget/widgetDraft";
import { useWizardLauncherChrome } from "@/lib/chat-widget/use-wizard-launcher-preview";
import { resolveWizardLauncherPreview } from "@/lib/chat-widget/widget-wizard-save-trace";
import {
  chatBoxFieldGroupSx,
  chatBoxFormStackSx,
  chatBoxSectionTitleSx,
  chatBoxSwitchRowSx,
} from "./chat-box-design.styles";
import { syncResponseCopyFromChatBox } from "@/lib/chat-widget/sync-response-copy-from-chat-box";
import {
  isWidgetInquiryOptionConfigured,
} from "@/lib/chat-widget/visitor-topics.mapper";
import { normalizeWidgetInquiryOptions } from "@/lib/chat-widget/widget-inquiry.types";
import { WIDGET_GOOGLE_FONT_OPTIONS } from "@/lib/chat-widget/widget-google-fonts";
import {
  DESIGN_ACCENT_SELECT_OPTIONS,
  DESIGN_DENSITY_SELECT_OPTIONS,
} from "@/lib/chat-widget/design-accent-density";
import {
  FIELD_MAX,
  validateVideoEmbedUrl,
} from "@/lib/chat-widget/widget-field-validation";
import { useWizardStepFlush } from "@/lib/chat-widget/widget-wizard-step-flush";
import { WidgetSurfaceStylePicker } from "@/components/dashboard/chat-widget/WidgetSurfaceStylePicker";
import { WidgetChatAvatarField } from "@/components/dashboard/chat-widget/WidgetChatAvatarField";
import { WidgetMediaUploadPreview } from "@/components/dashboard/chat-widget/WidgetMediaUploadPreview";
import {
  normalizeAgentAvatarPreset,
  normalizeVisitorAvatarPreset,
  type AgentAvatarPresetId,
  type VisitorAvatarPresetId,
} from "@/lib/chat-widget/chat-avatar-presets";
import {
  normalizeLauncherStyle,
  normalizePanelSurfaceStyle,
  type WidgetLauncherStyleId,
} from "@/lib/chat-widget/launcher-style";

function clampNum(raw: string, min: number, max: number, fallback: number): number {
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function parseNonNegativeInt(raw: string, fallback: number): number {
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, n);
}

const compactGridFieldSx = {
  "& .MuiFormHelperText-root": { display: "none", minHeight: 0, margin: 0 },
  "& .MuiOutlinedInput-root": { minHeight: 40 },
  "& .MuiInputBase-input": { py: 1 },
} as const;

export default function ChatWidgetBoxDesignPage() {
  const { recordSave } = useWidgetWizardSaveTrace();
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { editWidgetKey, draftReady, hydrateError } = useChatWidgetWizardEdit();
  const [headerTitleAlign, setHeaderTitleAlign] = useState<"Center" | "Left">("Center");
  const [bannerOn, setBannerOn] = useState(true);
  const [bannerTitle, setBannerTitle] = useState(defaultWidgetDraft.bannerTitle ?? "");
  const [bannerDescription, setBannerDescription] = useState(
    defaultWidgetDraft.bannerDescription ?? "",
  );
  const [bannerCtaLabel, setBannerCtaLabel] = useState(defaultWidgetDraft.bannerCtaLabel ?? "");
  const [bannerCtaHref, setBannerCtaHref] = useState(defaultWidgetDraft.bannerCtaHref ?? "");
  const [headerLogoHeightPx, setHeaderLogoHeightPx] = useState(
    String(defaultWidgetDraft.headerLogoHeightPx ?? 28),
  );
  const [videoWelcomeHeightPx, setVideoWelcomeHeightPx] = useState(
    String(defaultWidgetDraft.videoWelcomeHeightPx ?? 160),
  );
  const [headerBrandColor, setHeaderBrandColor] = useState(
    defaultWidgetDraft.buttonColor ?? "#1E63D5",
  );
  const [themeSecondaryColor, setThemeSecondaryColor] = useState(
    defaultWidgetDraft.themeSecondaryColor ?? "#64748b",
  );
  const [textColor, setTextColor] = useState(defaultWidgetDraft.textColor ?? "#FFFFFF");
  const [videoWelcomeOn, setVideoWelcomeOn] = useState(false);
  const [videoWelcomeUrl, setVideoWelcomeUrl] = useState("");
  const [themeName, setThemeName] = useState(defaultWidgetDraft.themeName ?? "Brand Default");
  const [themeFontFamily, setThemeFontFamily] = useState(
    defaultWidgetDraft.themeFontFamily ?? "Inter, system-ui, sans-serif",
  );
  const [themeBubbleStyle, setThemeBubbleStyle] = useState(
    defaultWidgetDraft.themeBubbleStyle ?? "rounded",
  );
  const [themeBorderRadiusPxStr, setThemeBorderRadiusPxStr] = useState(
    String(defaultWidgetDraft.themeBorderRadiusPx ?? 12),
  );
  const [bubbleBorderRadiusPxStr, setBubbleBorderRadiusPxStr] = useState(
    String(defaultWidgetDraft.bubbleBorderRadiusPx ?? defaultWidgetDraft.themeBorderRadiusPx ?? 12),
  );
  const [themeWelcomeFontStr, setThemeWelcomeFontStr] = useState(
    String(defaultWidgetDraft.themeWelcomeFontSizePx ?? 18),
  );
  const [themeBodyFontStr, setThemeBodyFontStr] = useState(
    String(defaultWidgetDraft.themeBodyFontSizePx ?? 14),
  );
  const [themeInputFontStr, setThemeInputFontStr] = useState(
    String(defaultWidgetDraft.themeInputFontSizePx ?? 14),
  );
  const [themeCtaFontStr, setThemeCtaFontStr] = useState(
    String(defaultWidgetDraft.themeCtaFontSizePx ?? 15),
  );
  const [themeConsentFontStr, setThemeConsentFontStr] = useState(
    String(defaultWidgetDraft.themeConsentFontSizePx ?? 12),
  );
  const [themeLineHeightStr, setThemeLineHeightStr] = useState(
    String(defaultWidgetDraft.themeLineHeightPx ?? 22),
  );
  const [themeDesignJsonAccent, setThemeDesignJsonAccent] = useState(
    defaultWidgetDraft.themeDesignJsonAccent ?? "blue",
  );
  const [themeDesignJsonDensity, setThemeDesignJsonDensity] = useState(
    defaultWidgetDraft.themeDesignJsonDensity ?? "comfortable",
  );
  const [bannerFileName, setBannerFileName] = useState("");
  const [bannerDataUrl, setBannerDataUrl] = useState("");
  const [headerLogoFileName, setHeaderLogoFileName] = useState("");
  const [headerLogoDataUrl, setHeaderLogoDataUrl] = useState("");
  const [bannerMediaType, setBannerMediaType] = useState<"image" | "video">("image");
  const [panelHeaderTitle, setPanelHeaderTitle] = useState(
    defaultWidgetDraft.headerTitle ?? "",
  );
  const [greetingMessage, setGreetingMessage] = useState(
    defaultWidgetDraft.greetingMessage ?? "",
  );
  const [sendPlaceholder, setSendPlaceholder] = useState(
    defaultWidgetDraft.sendPlaceholder ?? "",
  );
  const [boxWidth, setBoxWidth] = useState("350");
  const [boxHeight, setBoxHeight] = useState("430");
  const [buttonLabel, setButtonLabel] = useState(defaultWidgetDraft.buttonLabel ?? "Chat with us");
  const [backgroundColor, setBackgroundColor] = useState(
    defaultWidgetDraft.backgroundColor ?? "#f8fafc",
  );
  const [chatColors, setChatColors] = useState<WidgetChatColorsDraft>(() =>
    readWidgetChatColorsFromDraft(defaultWidgetDraft),
  );
  const [previewForm, setPreviewForm] = useState({
    formEnabled: defaultWidgetDraft.formEnabled ?? true,
    formTitle: defaultWidgetDraft.formTitle ?? "",
    formSubtitle: defaultWidgetDraft.formSubtitle ?? "",
    formSubmitLabel: defaultWidgetDraft.formSubmitLabel ?? "",
    prechatNameEnabled: defaultWidgetDraft.prechatNameEnabled ?? true,
    prechatEmailEnabled: defaultWidgetDraft.prechatEmailEnabled ?? true,
    prechatPhoneEnabled: defaultWidgetDraft.prechatPhoneEnabled ?? false,
    prechatMessageEnabled: defaultWidgetDraft.prechatMessageEnabled ?? true,
    talkToAgentEnabled: defaultWidgetDraft.responseTalkToAgentEnabled ?? true,
    talkToAgentTriggerText:
      defaultWidgetDraft.responseTalkToAgentTriggerText ?? "Talk to agent",
    chatMode: defaultWidgetDraft.chatMode ?? "HYBRID",
  });
  const [panelSurfaceStyle, setPanelSurfaceStyle] = useState<WidgetLauncherStyleId>(
    normalizePanelSurfaceStyle(defaultWidgetDraft.panelSurfaceStyle ?? "solid"),
  );
  const [bubbleSurfaceStyle, setBubbleSurfaceStyle] = useState<WidgetLauncherStyleId>(
    defaultWidgetDraft.bubbleSurfaceStyle ?? "solid",
  );
  const [agentAvatarEnabled, setAgentAvatarEnabled] = useState(
    defaultWidgetDraft.agentAvatarEnabled ?? true,
  );
  const [visitorAvatarEnabled, setVisitorAvatarEnabled] = useState(
    defaultWidgetDraft.visitorAvatarEnabled ?? true,
  );
  const [agentAvatarDataUrl, setAgentAvatarDataUrl] = useState("");
  const [visitorAvatarDataUrl, setVisitorAvatarDataUrl] = useState("");
  const [agentAvatarPreset, setAgentAvatarPreset] = useState<AgentAvatarPresetId>(
    normalizeAgentAvatarPreset(defaultWidgetDraft.agentAvatarPreset),
  );
  const [visitorAvatarPreset, setVisitorAvatarPreset] = useState<VisitorAvatarPresetId>(
    normalizeVisitorAvatarPreset(defaultWidgetDraft.visitorAvatarPreset),
  );
  const bannerUploadRef = useRef<HTMLInputElement | null>(null);
  const headerLogoUploadRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [checklistRefreshKey, setChecklistRefreshKey] = useState(0);

  const { chromeDraft } = useWizardLauncherChrome(
    editWidgetKey,
    draftReady,
    checklistRefreshKey,
    { buttonLabel, themePrimaryColor: headerBrandColor },
  );

  useEffect(() => {
    if (!draftReady) return;
    const d = readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined);
    const def = defaultWidgetDraft;
    setHeaderTitleAlign(d.headerTitleAlign === "Left" ? "Left" : "Center");
    setBannerOn(Boolean(d.bannerOn));
    setBannerTitle(d.bannerTitle ?? "");
    setBannerDescription(d.bannerDescription ?? "");
    setBannerCtaLabel(d.bannerCtaLabel ?? "");
    setBannerCtaHref(d.bannerCtaHref ?? "");
    setHeaderLogoHeightPx(String(d.headerLogoHeightPx ?? defaultWidgetDraft.headerLogoHeightPx ?? 28));
    setVideoWelcomeHeightPx(String(d.videoWelcomeHeightPx ?? defaultWidgetDraft.videoWelcomeHeightPx ?? 160));
    setHeaderBrandColor(
      d.themePrimaryColor?.trim() || d.buttonColor?.trim() || "#1ed760",
    );
    setThemeSecondaryColor(d.themeSecondaryColor ?? "#64748b");
    setTextColor(d.textColor || "#d62cad");
    setBannerDataUrl(d.bannerDataUrl || "");
    setBannerFileName(d.bannerDataUrl ? "Uploaded banner" : "");
    setHeaderLogoDataUrl(d.headerLogoDataUrl || "");
    setHeaderLogoFileName(d.headerLogoDataUrl ? "Uploaded logo" : "");
    setBannerMediaType(d.bannerMediaType === "video" ? "video" : "image");
    setPanelHeaderTitle(d.headerTitle ?? "");
    setGreetingMessage(
      (d.greetingMessage ?? d.firstMessage ?? defaultWidgetDraft.greetingMessage ?? "").trim() ||
        defaultWidgetDraft.greetingMessage,
    );
    setSendPlaceholder(
      d.sendPlaceholder ??
        d.messagePlaceholder ??
        defaultWidgetDraft.sendPlaceholder,
    );
    setBoxWidth(String(d.boxWidth ?? 350));
    setBoxHeight(String(d.boxHeight ?? 430));
    setButtonLabel(
      typeof d.buttonLabel === "string" ? d.buttonLabel : (defaultWidgetDraft.buttonLabel ?? ""),
    );
    setBackgroundColor(d.backgroundColor ?? "#f8fafc");
    setChatColors(readWidgetChatColorsFromDraft(d));
    setVideoWelcomeOn(d.videoWelcomeOn ?? false);
    setVideoWelcomeUrl(d.videoWelcomeUrl ?? "");
    setThemeName(d.themeName ?? defaultWidgetDraft.themeName ?? "Brand Default");
    setThemeFontFamily(d.themeFontFamily ?? defaultWidgetDraft.themeFontFamily ?? "");
    setThemeBubbleStyle(d.themeBubbleStyle ?? defaultWidgetDraft.themeBubbleStyle ?? "rounded");
    setThemeBorderRadiusPxStr(String(d.themeBorderRadiusPx ?? defaultWidgetDraft.themeBorderRadiusPx ?? 12));
    setBubbleBorderRadiusPxStr(
      String(
        d.bubbleBorderRadiusPx ??
          d.themeBorderRadiusPx ??
          defaultWidgetDraft.bubbleBorderRadiusPx ??
          defaultWidgetDraft.themeBorderRadiusPx ??
          12,
      ),
    );
    setThemeWelcomeFontStr(String(d.themeWelcomeFontSizePx ?? defaultWidgetDraft.themeWelcomeFontSizePx ?? 18));
    setThemeBodyFontStr(String(d.themeBodyFontSizePx ?? defaultWidgetDraft.themeBodyFontSizePx ?? 14));
    setThemeInputFontStr(String(d.themeInputFontSizePx ?? defaultWidgetDraft.themeInputFontSizePx ?? 14));
    setThemeCtaFontStr(String(d.themeCtaFontSizePx ?? defaultWidgetDraft.themeCtaFontSizePx ?? 15));
    setThemeConsentFontStr(String(d.themeConsentFontSizePx ?? defaultWidgetDraft.themeConsentFontSizePx ?? 12));
    setThemeLineHeightStr(String(d.themeLineHeightPx ?? defaultWidgetDraft.themeLineHeightPx ?? 22));
    setThemeDesignJsonAccent(d.themeDesignJsonAccent ?? defaultWidgetDraft.themeDesignJsonAccent ?? "blue");
    setThemeDesignJsonDensity(d.themeDesignJsonDensity ?? defaultWidgetDraft.themeDesignJsonDensity ?? "comfortable");
    setPanelSurfaceStyle(normalizePanelSurfaceStyle(d.panelSurfaceStyle));
    setBubbleSurfaceStyle(normalizeLauncherStyle(d.bubbleSurfaceStyle));
    setAgentAvatarEnabled(d.agentAvatarEnabled !== false);
    setVisitorAvatarEnabled(d.visitorAvatarEnabled === true);
    setAgentAvatarDataUrl(d.agentAvatarDataUrl || "");
    setVisitorAvatarDataUrl(d.visitorAvatarDataUrl || "");
    setAgentAvatarPreset(normalizeAgentAvatarPreset(d.agentAvatarPreset));
    setVisitorAvatarPreset(normalizeVisitorAvatarPreset(d.visitorAvatarPreset));
    setPreviewForm({
      formEnabled: d.formEnabled ?? def.formEnabled ?? true,
      formTitle: d.formTitle ?? def.formTitle ?? "",
      formSubtitle: d.formSubtitle ?? def.formSubtitle ?? "",
      formSubmitLabel: d.formSubmitLabel ?? def.formSubmitLabel ?? "",
      prechatNameEnabled: d.prechatNameEnabled ?? def.prechatNameEnabled ?? true,
      prechatEmailEnabled: d.prechatEmailEnabled ?? def.prechatEmailEnabled ?? true,
      prechatPhoneEnabled: d.prechatPhoneEnabled ?? def.prechatPhoneEnabled ?? false,
      prechatMessageEnabled: d.prechatMessageEnabled ?? def.prechatMessageEnabled ?? true,
      talkToAgentEnabled: d.responseTalkToAgentEnabled ?? def.responseTalkToAgentEnabled ?? true,
      talkToAgentTriggerText: d.responseTalkToAgentTriggerText ?? def.responseTalkToAgentTriggerText ?? "",
      chatMode: d.chatMode ?? def.chatMode ?? "HYBRID",
    });
  }, [draftReady, editWidgetKey, checklistRefreshKey]);

  const stepStateRef = useRef({
    draftReady,
    editWidgetKey,
    headerTitleAlign,
    bannerOn,
    bannerTitle,
    bannerDescription,
    bannerCtaLabel,
    bannerCtaHref,
    headerLogoHeightPx,
    videoWelcomeHeightPx,
    headerBrandColor,
    themeSecondaryColor,
    textColor,
    videoWelcomeOn,
    videoWelcomeUrl,
    themeName,
    themeFontFamily,
    themeBubbleStyle,
    themeBorderRadiusPxStr,
    bubbleBorderRadiusPxStr,
    themeWelcomeFontStr,
    themeBodyFontStr,
    themeInputFontStr,
    themeCtaFontStr,
    themeConsentFontStr,
    themeLineHeightStr,
    themeDesignJsonAccent,
    themeDesignJsonDensity,
    bannerDataUrl,
    bannerMediaType,
    headerLogoDataUrl,
    panelHeaderTitle,
    greetingMessage,
    sendPlaceholder,
    boxWidth,
    boxHeight,
    buttonLabel,
    backgroundColor,
    chatColors,
    previewForm,
    panelSurfaceStyle,
    bubbleSurfaceStyle,
    agentAvatarEnabled,
    visitorAvatarEnabled,
    agentAvatarDataUrl,
    visitorAvatarDataUrl,
    agentAvatarPreset,
    visitorAvatarPreset,
  });
  stepStateRef.current = {
    draftReady,
    editWidgetKey,
    headerTitleAlign,
    bannerOn,
    bannerTitle,
    bannerDescription,
    bannerCtaLabel,
    bannerCtaHref,
    headerLogoHeightPx,
    videoWelcomeHeightPx,
    headerBrandColor,
    themeSecondaryColor,
    textColor,
    videoWelcomeOn,
    videoWelcomeUrl,
    themeName,
    themeFontFamily,
    themeBubbleStyle,
    themeBorderRadiusPxStr,
    bubbleBorderRadiusPxStr,
    themeWelcomeFontStr,
    themeBodyFontStr,
    themeInputFontStr,
    themeCtaFontStr,
    themeConsentFontStr,
    themeLineHeightStr,
    themeDesignJsonAccent,
    themeDesignJsonDensity,
    bannerDataUrl,
    bannerMediaType,
    headerLogoDataUrl,
    panelHeaderTitle,
    greetingMessage,
    sendPlaceholder,
    boxWidth,
    boxHeight,
    buttonLabel,
    backgroundColor,
    chatColors,
    previewForm,
    panelSurfaceStyle,
    bubbleSurfaceStyle,
    agentAvatarEnabled,
    visitorAvatarEnabled,
    agentAvatarDataUrl,
    visitorAvatarDataUrl,
    agentAvatarPreset,
    visitorAvatarPreset,
  };

  const flushStepToDraft = useCallback(() => {
    const s = stepStateRef.current;
    if (!s.draftReady) return;
    const editKey = resolveEditWidgetKeyForNavigation(s.editWidgetKey);
    const prev = readChatWizardDraft(editKey || undefined);
    const parsedWidth = Number.parseInt(s.boxWidth, 10);
    const parsedHeight = Number.parseInt(s.boxHeight, 10);
    const safeWidth = Number.isFinite(parsedWidth) ? Math.min(520, Math.max(280, parsedWidth)) : 350;
    const safeHeight = Number.isFinite(parsedHeight) ? Math.min(640, Math.max(320, parsedHeight)) : 430;
    saveChatWizardDraft(editKey || undefined, {
      themeName: s.themeName.trim() || defaultWidgetDraft.themeName,
      themeFontFamily: s.themeFontFamily.trim() || defaultWidgetDraft.themeFontFamily,
      themeBubbleStyle: s.themeBubbleStyle.trim() || defaultWidgetDraft.themeBubbleStyle,
      themeBorderRadiusPx: clampNum(s.themeBorderRadiusPxStr, 0, 20, 12),
      bubbleBorderRadiusPx: parseNonNegativeInt(s.bubbleBorderRadiusPxStr, 12),
      themeWelcomeFontSizePx: clampNum(s.themeWelcomeFontStr, 10, 32, 18),
      themeBodyFontSizePx: clampNum(s.themeBodyFontStr, 10, 28, 14),
      themeInputFontSizePx: clampNum(s.themeInputFontStr, 10, 28, 14),
      themeCtaFontSizePx: clampNum(s.themeCtaFontStr, 10, 28, 15),
      themeConsentFontSizePx: clampNum(s.themeConsentFontStr, 8, 24, 12),
      themeLineHeightPx: clampNum(s.themeLineHeightStr, 14, 40, 22),
      themeDesignJsonAccent: s.themeDesignJsonAccent.trim() || "blue",
      themeDesignJsonDensity: s.themeDesignJsonDensity.trim() || "comfortable",
      themeSecondaryColor: s.themeSecondaryColor.trim() || defaultWidgetDraft.themeSecondaryColor,
      videoWelcomeOn: s.videoWelcomeOn,
      videoWelcomeUrl: s.videoWelcomeUrl.trim(),
      headerTitleAlign: s.headerTitleAlign,
      headerTitle: s.panelHeaderTitle.trim(),
      headerLogoDataUrl: s.headerLogoDataUrl,
      ...syncResponseCopyFromChatBox({
        ...prev,
        greetingMessage: s.greetingMessage,
        firstMessage: "",
        sendPlaceholder: s.sendPlaceholder,
        messagePlaceholder: s.sendPlaceholder,
      }),
      themePrimaryColor: s.headerBrandColor.trim() || prev.themePrimaryColor || prev.buttonColor,
      textColor: s.textColor || prev.textColor || "#FFFFFF",
      panelGreetingEnabled: false,
      chatWelcomeEnabled: false,
      greetingMessage: s.greetingMessage.trim(),
      sendPlaceholder: s.sendPlaceholder,
      messagePlaceholder: s.sendPlaceholder.trim(),
      bannerOn: s.bannerOn,
      bannerTitle: s.bannerTitle.trim(),
      bannerDescription: s.bannerDescription.trim(),
      bannerHeightPx: 0,
      bannerCtaLabel: s.bannerCtaLabel.trim(),
      bannerCtaHref: s.bannerCtaHref.trim(),
      headerLogoHeightPx: clampNum(s.headerLogoHeightPx, 16, 64, 28),
      videoWelcomeHeightPx: clampNum(s.videoWelcomeHeightPx, 80, 320, 160),
      bannerDataUrl: s.bannerDataUrl,
      bannerMediaType: s.bannerMediaType,
      boxWidth: safeWidth,
      boxHeight: safeHeight,
      buttonLabel: s.buttonLabel.trim(),
      firstMessage: "",
      backgroundColor: s.backgroundColor.trim() || prev.backgroundColor || "#f8fafc",
      formEnabled: s.previewForm.formEnabled,
      formTitle: s.previewForm.formTitle,
      formSubtitle: s.previewForm.formSubtitle,
      formSubmitLabel: s.previewForm.formSubmitLabel,
      prechatNameEnabled: s.previewForm.prechatNameEnabled,
      prechatEmailEnabled: s.previewForm.prechatEmailEnabled,
      prechatPhoneEnabled: s.previewForm.prechatPhoneEnabled,
      prechatMessageEnabled: s.previewForm.prechatMessageEnabled,
      responseTalkToAgentEnabled: s.previewForm.talkToAgentEnabled,
      responseTalkToAgentTriggerText: s.previewForm.talkToAgentTriggerText,
      chatMode: s.previewForm.chatMode,
      panelSurfaceStyle: s.panelSurfaceStyle,
      bubbleSurfaceStyle: s.bubbleSurfaceStyle,
      agentAvatarEnabled: s.agentAvatarEnabled,
      visitorAvatarEnabled: s.visitorAvatarEnabled,
      agentAvatarDataUrl: s.agentAvatarDataUrl,
      visitorAvatarDataUrl: s.visitorAvatarDataUrl,
      agentAvatarPreset: s.agentAvatarPreset,
      visitorAvatarPreset: s.visitorAvatarPreset,
      ...widgetChatColorsDraftToPatch(s.chatColors),
    });
  }, []);

  useWizardStepFlush(flushStepToDraft);

  const handleBannerUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBannerFileName(file.name);
    setBannerMediaType(file.type.startsWith("video/") ? "video" : "image");
    const reader = new FileReader();
    reader.onload = () => setBannerDataUrl(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const handleHeaderLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setHeaderLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = () =>
      setHeaderLogoDataUrl(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (saving) return;
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

      const parsedWidth = Number.parseInt(boxWidth, 10);
      const parsedHeight = Number.parseInt(boxHeight, 10);
      const safeWidth = Number.isFinite(parsedWidth) ? Math.min(520, Math.max(280, parsedWidth)) : 350;
      const safeHeight = Number.isFinite(parsedHeight) ? Math.min(640, Math.max(320, parsedHeight)) : 430;

      if (videoWelcomeOn) {
        const videoErr = validateVideoEmbedUrl(videoWelcomeUrl);
        if (videoErr) {
          publishAppToast({ variant: "error", message: videoErr });
          return;
        }
      }

      setSaving(true);
      try {
        const launcherFromStep1 = resolveWizardLauncherPreview(prev);
        saveChatWizardDraft(editKey || undefined, {
          type: prev.type,
          ...launcherFromStep1,
          buttonShape: launcherFromStep1.buttonShape,
          buttonPosition: launcherFromStep1.buttonPosition,
          launcherInsetBottomPx: prev.launcherInsetBottomPx,
          launcherInsetSidePx: prev.launcherInsetSidePx,
          buttonColor: prev.buttonColor,
          buttonHoverColor: prev.buttonHoverColor,
          iconColor: prev.iconColor,
          iconDataUrl: prev.iconDataUrl,
          launcherIconPreset: prev.launcherIconPreset,
          proactiveTeaserEnabled: prev.proactiveTeaserEnabled,
          proactiveTeaser: prev.proactiveTeaser,
          proactiveTeaserAvatarEnabled: prev.proactiveTeaserAvatarEnabled,
          proactiveTeaserAvatarDataUrl: prev.proactiveTeaserAvatarDataUrl,
          proactiveSecondaryCtaEnabled: prev.proactiveSecondaryCtaEnabled,
          proactiveSecondaryCtaLabel: prev.proactiveSecondaryCtaLabel,
          proactiveSecondaryCtaHref: prev.proactiveSecondaryCtaHref,
          proactiveSecondaryCtaKind: prev.proactiveSecondaryCtaKind,
          closedMessagePreviewEnabled: prev.closedMessagePreviewEnabled,
          themeName: themeName.trim() || defaultWidgetDraft.themeName,
          themeFontFamily: themeFontFamily.trim() || defaultWidgetDraft.themeFontFamily,
          themeBubbleStyle: themeBubbleStyle.trim() || defaultWidgetDraft.themeBubbleStyle,
          themeBorderRadiusPx: clampNum(themeBorderRadiusPxStr, 0, 20, 12),
          bubbleBorderRadiusPx: parseNonNegativeInt(bubbleBorderRadiusPxStr, 12),
          themeWelcomeFontSizePx: clampNum(themeWelcomeFontStr, 10, 32, 18),
          themeBodyFontSizePx: clampNum(themeBodyFontStr, 10, 28, 14),
          themeInputFontSizePx: clampNum(themeInputFontStr, 10, 28, 14),
          themeCtaFontSizePx: clampNum(themeCtaFontStr, 10, 28, 15),
          themeConsentFontSizePx: clampNum(themeConsentFontStr, 8, 24, 12),
          themeLineHeightPx: clampNum(themeLineHeightStr, 14, 40, 22),
          themeDesignJsonAccent: themeDesignJsonAccent.trim() || "blue",
          themeDesignJsonDensity: themeDesignJsonDensity.trim() || "comfortable",
          themeSecondaryColor: themeSecondaryColor.trim() || defaultWidgetDraft.themeSecondaryColor,
          videoWelcomeOn,
          videoWelcomeUrl: videoWelcomeUrl.trim(),
          headerTitleAlign,
          headerTitle: panelHeaderTitle.trim(),
          headerLogoDataUrl,
          ...syncResponseCopyFromChatBox({
            ...prev,
            greetingMessage,
            firstMessage: "",
            sendPlaceholder,
            messagePlaceholder: sendPlaceholder,
          }),
          themePrimaryColor:
            headerBrandColor.trim() || prev.themePrimaryColor || prev.buttonColor,
          textColor: textColor || prev.textColor || "#FFFFFF",
          panelGreetingEnabled: false,
          chatWelcomeEnabled: false,
          greetingMessage: greetingMessage.trim(),
          sendPlaceholder,
          messagePlaceholder: sendPlaceholder.trim(),
          bannerOn,
          bannerTitle: bannerTitle.trim(),
          bannerDescription: bannerDescription.trim(),
          bannerHeightPx: 0,
          bannerCtaLabel: bannerCtaLabel.trim(),
          bannerCtaHref: bannerCtaHref.trim(),
          headerLogoHeightPx: clampNum(headerLogoHeightPx, 16, 64, 28),
          videoWelcomeHeightPx: clampNum(videoWelcomeHeightPx, 80, 320, 160),
          bannerDataUrl,
          bannerMediaType,
          boxWidth: safeWidth,
          boxHeight: safeHeight,
          buttonLabel: buttonLabel.trim(),
          firstMessage: "",
          backgroundColor: backgroundColor.trim() || prev.backgroundColor || "#f8fafc",
          inquiryOn: prev.inquiryOn ?? false,
          inquiryOptions: prev.inquiryOptions ?? [],
          inquiryRequired: prev.inquiryRequired,
          inquirySkipLabel: prev.inquirySkipLabel,
          inquiryFallbackRoutingKey: prev.inquiryFallbackRoutingKey,
          panelSurfaceStyle,
          bubbleSurfaceStyle,
          agentAvatarEnabled,
          visitorAvatarEnabled,
          agentAvatarDataUrl,
          visitorAvatarDataUrl,
          agentAvatarPreset,
          visitorAvatarPreset,
          ...widgetChatColorsDraftToPatch(chatColors),
        });
        const latest = readChatWizardDraft(editKey || undefined);
        const patchMeta = await patchRemoteWidgetConfigurationWithMeta({
          widgetKey: rk,
          widgetKind: resolveWizardKindFromDraft(latest),
          draft: latest,
          publishNow: false,
          chatWizardPatchScope: "chat_surface",
        });
        recordSave({
          stepKey: "box",
          stepLabel: "Step 2 — Chat box",
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
            "/dashboard/chat-widget/add/chat/notifications",
            resolveEditWidgetKeyForNavigation(editKey) || rk,
          ),
        );
      } catch (e) {
        publishAppToast({
          variant: "error",
          message:
            extractApiErrorMessageForToast(e) ??
            "Could not save chat box design to the server.",
        });
      } finally {
        setSaving(false);
      }
    })();
  };

  const parsedPreviewWidth = Number.parseInt(boxWidth, 10);
  const parsedPreviewHeight = Number.parseInt(boxHeight, 10);

  const livePreviewModel = useMemo(() => {
    void checklistRefreshKey;
    const draft = draftReady
      ? readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined)
      : defaultWidgetDraft;
    const inquiryRows = normalizeWidgetInquiryOptions(draft.inquiryOptions ?? []);
    const inquiryActive =
      (draft.inquiryOn ?? false) && inquiryRows.some(isWidgetInquiryOptionConfigured);
    return {
      headerTitle: panelHeaderTitle.trim(),
      headerLogoDataUrl,
      headerLogoHeightPx: clampNum(headerLogoHeightPx, 16, 64, 28),
      headerAlign: headerTitleAlign,
      buttonColor: headerBrandColor || "#1ed760",
      buttonHoverColor: chromeDraft.buttonHoverColor || headerBrandColor || "#1ed760",
      textColor: textColor || "#ffffff",
      backgroundColor: backgroundColor.trim() || "#f8fafc",
      bannerOn,
      bannerTitle,
      bannerDataUrl,
      bannerMediaType,
      bannerHeightPx: 0,
      bannerCtaLabel,
      bannerCtaHref,
      videoWelcomeOn,
      videoWelcomeUrl,
      videoWelcomeHeightPx: clampNum(videoWelcomeHeightPx, 80, 320, 160),
      greetingMessage: greetingMessage.trim(),
      sendPlaceholder,
      messagePlaceholder: sendPlaceholder,
      boxWidth: Number.isFinite(parsedPreviewWidth) ? parsedPreviewWidth : 350,
      boxHeight: Number.isFinite(parsedPreviewHeight) ? parsedPreviewHeight : 430,
      colors: {
        ...chatColors,
        inquiryPillBg: backgroundColor.trim() || chatColors.inquiryPillBg,
        talkToAgentButtonBg: backgroundColor.trim() || chatColors.talkToAgentButtonBg,
      },
      inquiryOn: inquiryActive,
      inquiryOptions: inquiryRows.map((o) => o.label).filter(Boolean),
      formEnabled: previewForm.formEnabled,
      formTitle: previewForm.formTitle,
      formSubtitle: previewForm.formSubtitle,
      formSubmitLabel: previewForm.formSubmitLabel,
      prechatNameEnabled: previewForm.prechatNameEnabled,
      prechatEmailEnabled: previewForm.prechatEmailEnabled,
      prechatPhoneEnabled: previewForm.prechatPhoneEnabled,
      prechatMessageEnabled: previewForm.prechatMessageEnabled,
      talkToAgentEnabled: previewForm.talkToAgentEnabled,
      talkToAgentTriggerText: previewForm.talkToAgentTriggerText,
      chatMode: previewForm.chatMode,
      panelSurfaceStyle,
      bubbleSurfaceStyle,
      agentAvatarEnabled,
      visitorAvatarEnabled,
      agentAvatarDataUrl,
      visitorAvatarDataUrl,
      agentAvatarPreset,
      visitorAvatarPreset,
      themeFontFamily: themeFontFamily.trim() || defaultWidgetDraft.themeFontFamily,
      themeBubbleStyle,
      themeBorderRadiusPx: clampNum(themeBorderRadiusPxStr, 0, 20, 12),
      bubbleBorderRadiusPx: parseNonNegativeInt(bubbleBorderRadiusPxStr, 12),
      themeWelcomeFontSizePx: clampNum(themeWelcomeFontStr, 10, 32, 18),
      themeBodyFontSizePx: clampNum(themeBodyFontStr, 10, 28, 14),
      themeInputFontSizePx: clampNum(themeInputFontStr, 10, 28, 14),
      themeCtaFontSizePx: clampNum(themeCtaFontStr, 10, 28, 15),
      themeLineHeightPx: clampNum(themeLineHeightStr, 14, 40, 22),
      themeDesignJsonAccent,
      themeDesignJsonDensity,
    };
  }, [
      panelHeaderTitle,
      draftReady,
      editWidgetKey,
      checklistRefreshKey,
      headerLogoDataUrl,
      headerLogoHeightPx,
      headerTitleAlign,
      headerBrandColor,
      chromeDraft.buttonHoverColor,
      textColor,
      backgroundColor,
      bannerOn,
      bannerTitle,
      bannerCtaLabel,
      bannerCtaHref,
      bannerDataUrl,
      bannerMediaType,
      videoWelcomeOn,
      videoWelcomeUrl,
      videoWelcomeHeightPx,
      greetingMessage,
      sendPlaceholder,
      parsedPreviewWidth,
      parsedPreviewHeight,
      chatColors,
      previewForm,
      panelSurfaceStyle,
      bubbleSurfaceStyle,
      agentAvatarEnabled,
      visitorAvatarEnabled,
      agentAvatarDataUrl,
      visitorAvatarDataUrl,
      agentAvatarPreset,
      visitorAvatarPreset,
      themeFontFamily,
      themeBubbleStyle,
      themeBorderRadiusPxStr,
      bubbleBorderRadiusPxStr,
      themeWelcomeFontStr,
      themeBodyFontStr,
      themeInputFontStr,
      themeCtaFontStr,
      themeLineHeightStr,
      themeDesignJsonAccent,
      themeDesignJsonDensity,
    ],
  );

  return (
    <WidgetFlowShell
      pageTitle="Widget Customization"
      subtitle="Open panel layout, messages, banner, and brand styling."
      cardTitle="Chat panel design"
      currentStep={1}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/chat-widget")}>
            Cancel
          </Button>
          <Button type="button" variant="primary" sx={gradientPrimaryButtonSx} disabled={saving || !draftReady} onClick={handleNext}>
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
          <Stack spacing={2}>
            <WidgetLauncherLivePreview
              buttonOnly
              buttonShape={chromeDraft.buttonShape}
              buttonPosition={chromeDraft.buttonPosition === "left" ? "left" : "right"}
              insetBottomPx={chromeDraft.launcherInsetBottomPx}
              insetSidePx={chromeDraft.launcherInsetSidePx}
              buttonColor={chromeDraft.buttonColor}
              hoverColor={chromeDraft.buttonHoverColor}
              iconColor={chromeDraft.iconColor}
              iconDataUrl={chromeDraft.iconDataUrl}
              launcherIconPreset={chromeDraft.launcherIconPreset}
              launcherIconEnabled={chromeDraft.launcherIconEnabled !== false}
              launcherLabelEnabled={chromeDraft.launcherLabelEnabled !== false}
              buttonLabel={chromeDraft.buttonLabel ?? ""}
              launcherStyle={chromeDraft.launcherStyle ?? "solid"}
              launcherBadgeMode={chromeDraft.launcherBadgeMode ?? "count"}
            />
            <WidgetChatBoxLivePreview model={livePreviewModel} />
          </Stack>
        }
      >
        <WidgetWizardStepGuide step="box" />
        <SchedulingSectionCard
          title="Panel header & banner"
          subtitle="Header alignment, brand colors, promo banner, and optional video welcome."
        >
      <Box sx={chatBoxFormStackSx}>
      <SelectField
        label="Header alignment"
        value={headerTitleAlign}
        onChange={(v) => setHeaderTitleAlign(v as "Center" | "Left")}
        options={[
          { label: "Center", value: "Center" },
          { label: "Left", value: "Left" },
        ]}
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        <WidgetColorPickerField
          label="Header / brand color"
          value={headerBrandColor}
          onChange={setHeaderBrandColor}
          fallback="#2563eb"
        />
        <WidgetColorPickerField
          label="Header text color"
          value={textColor}
          onChange={setTextColor}
          fallback="#ffffff"
        />
      </Box>
      <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block", mb: 1 }}>
        Header text color applies to the top bar only. Panel body colors are in Chat colors below.
      </Typography>

      <WidgetTextField
        label="Header title (optional)"
        name="header-title"
        value={panelHeaderTitle}
        onChange={setPanelHeaderTitle}
        maxLength={FIELD_MAX.title}
        placeholder="Leave empty to show logo only"
        helperText="Top bar inside the open chat panel. Empty = logo only (no title text)."
      />

      <Box>
        <Typography variant="body2" sx={{ color: theme.app.text.primary, fontWeight: 600, mb: 0.75 }}>
          Header logo (optional)
        </Typography>
        <WidgetMediaUploadPreview
          uploadLabel="Click to upload logo"
          fileName={headerLogoFileName}
          previewUrl={headerLogoDataUrl}
          mediaType="image"
          previewHeightPx={clampNum(headerLogoHeightPx, 16, 64, 28) + 24}
          onPick={() => headerLogoUploadRef.current?.click()}
          onClear={
            headerLogoDataUrl
              ? () => {
                  setHeaderLogoDataUrl("");
                  setHeaderLogoFileName("");
                  if (headerLogoUploadRef.current) headerLogoUploadRef.current.value = "";
                }
              : undefined
          }
          clearLabel="Remove logo"
        />
      </Box>
      <Box
        component="input"
        ref={headerLogoUploadRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.svg"
        onChange={handleHeaderLogoUpload}
        sx={{ display: "none" }}
      />
      <WidgetNumericField
        label="Header logo height (px)"
        name="header-logo-height"
        value={headerLogoHeightPx}
        onChange={setHeaderLogoHeightPx}
        min={16}
        max={64}
      />

      <Box sx={chatBoxSwitchRowSx}>
        <Typography variant="medium16" sx={chatBoxSectionTitleSx}>
          Banner (Optional)
        </Typography>
        <Switch checked={bannerOn} onChange={(_, checked) => setBannerOn(checked)} color="success" />
      </Box>

      {bannerOn ? (
        <Box sx={chatBoxFieldGroupSx}>
          <WidgetTextField
            label="Banner title (optional)"
            name="banner-title"
            value={bannerTitle}
            onChange={setBannerTitle}
            maxLength={FIELD_MAX.title}
            placeholder="Shown above the banner media"
          />
          <WidgetTextField
            label="Banner CTA label"
            name="banner-cta-label"
            value={bannerCtaLabel}
            onChange={setBannerCtaLabel}
            maxLength={FIELD_MAX.shortLabel}
            placeholder="Shop now"
          />
          <WidgetUrlField
            label="Banner CTA link"
            name="banner-cta-href"
            value={bannerCtaHref}
            onChange={setBannerCtaHref}
            placeholder="https://yoursite.com/promo"
            helperText="Clickable button under the banner in the live widget."
          />
          <WidgetMediaUploadPreview
            uploadLabel="Click to upload banner image or video"
            fileName={bannerFileName}
            previewUrl={bannerDataUrl}
            mediaType={bannerMediaType}
            onPick={() => bannerUploadRef.current?.click()}
            onClear={
              bannerDataUrl
                ? () => {
                    setBannerDataUrl("");
                    setBannerFileName("");
                    if (bannerUploadRef.current) bannerUploadRef.current.value = "";
                  }
                : undefined
            }
            clearLabel="Remove banner"
          />
        </Box>
      ) : null}
      <Box component="input" ref={bannerUploadRef} type="file" accept=".png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.ogg,.mov" onChange={handleBannerUpload} sx={{ display: "none" }} />

      <WidgetWizardToggleRow
        label="Video welcome"
        description="YouTube or Vimeo embed shown with the banner area."
        checked={videoWelcomeOn}
        onChange={setVideoWelcomeOn}
      />
      {videoWelcomeOn ? (
        <>
        <WidgetUrlField
          label="Video URL (YouTube / Vimeo)"
          name="video-welcome-url"
          value={videoWelcomeUrl}
          onChange={setVideoWelcomeUrl}
          videoEmbed
          helperText="Shown at the top of the panel before chat starts."
        />
        {videoWelcomeUrl.trim() ? (
          <Box
            sx={{
              borderRadius: 1.5,
              overflow: "hidden",
              border: `1px solid ${theme.app.dashboard.cardBorder}`,
              height: clampNum(videoWelcomeHeightPx, 80, 320, 160),
              bgcolor: "#000",
            }}
          >
            <Box
              component="iframe"
              src={videoWelcomeUrl.trim()}
              title="Video welcome preview"
              sx={{ width: "100%", height: "100%", border: 0, display: "block" }}
            />
          </Box>
        ) : null}
        <WidgetNumericField
          label="Video welcome height (px)"
          name="video-welcome-height"
          value={videoWelcomeHeightPx}
          onChange={setVideoWelcomeHeightPx}
          min={80}
          max={320}
        />
        </>
      ) : null}
      </Box>
        </SchedulingSectionCard>

        <SchedulingSectionCard
          title="Panel & bubble style"
          subtitle="Bubble surface, shape, colors, and avatars — updates the live preview instantly."
        >
          <Box sx={chatBoxFormStackSx}>
            <WidgetSurfaceStylePicker
              label="Panel style"
              value={panelSurfaceStyle}
              onChange={setPanelSurfaceStyle}
              excludeStyles={["glow"]}
            />
            <WidgetNumericField
              label="Panel corner radius (px)"
              name="panel-radius"
              value={themeBorderRadiusPxStr}
              onChange={setThemeBorderRadiusPxStr}
              min={0}
              max={20}
            />
            <WidgetSurfaceStylePicker
              label="Message bubble surface"
              value={bubbleSurfaceStyle}
              onChange={setBubbleSurfaceStyle}
            />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
              <SelectField
                label="Bubble shape"
                value={themeBubbleStyle}
                onChange={setThemeBubbleStyle}
                options={[
                  { label: "Rounded", value: "rounded" },
                  { label: "Square", value: "square" },
                  { label: "Pill", value: "pill" },
                ]}
              />
              <InputField
                label="Bubble corner radius (px)"
                name="bubble-radius"
                value={bubbleBorderRadiusPxStr}
                onChange={(e) => setBubbleBorderRadiusPxStr(e.target.value)}
                inputProps={{ inputMode: "numeric" }}
              />
            </Box>
            <WidgetMessageBubbleColorFields colors={chatColors} onChange={setChatColors} />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <WidgetChatAvatarField
                title="Agent avatar"
                subtitle="Shown beside agent / AI incoming messages."
                variant="agent"
                enabled={agentAvatarEnabled}
                onEnabledChange={setAgentAvatarEnabled}
                dataUrl={agentAvatarDataUrl}
                preset={agentAvatarPreset}
                accentColor={headerBrandColor}
                onSelectPreset={(id) => {
                  setAgentAvatarPreset(id as AgentAvatarPresetId);
                  setAgentAvatarDataUrl("");
                }}
              />
              <WidgetChatAvatarField
                title="Visitor avatar"
                subtitle="Shown beside the visitor's outgoing messages."
                variant="visitor"
                enabled={visitorAvatarEnabled}
                onEnabledChange={setVisitorAvatarEnabled}
                dataUrl={visitorAvatarDataUrl}
                preset={visitorAvatarPreset}
                accentColor={headerBrandColor}
                onSelectPreset={(id) => {
                  setVisitorAvatarPreset(id as VisitorAvatarPresetId);
                  setVisitorAvatarDataUrl("");
                }}
              />
            </Box>
          </Box>
        </SchedulingSectionCard>

        <SchedulingSectionCard
          title="Message flow"
          subtitle="What visitors see when they open the chat panel."
        >
      <Box sx={chatBoxFormStackSx}>
      {chromeDraft.launcherLabelEnabled !== false ? (
      <WidgetTextField
        label="Floating button label"
        name="button-label"
        value={buttonLabel}
        onChange={setButtonLabel}
        maxLength={FIELD_MAX.shortLabel}
        helperText="Short label on the closed launcher. Turn off on the Button step to hide text."
      />
      ) : (
        <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
          Launcher label is hidden (icon-only). Turn on &quot;Button label&quot; on the Button step to
          show text on the floating chip.
        </Typography>
      )}
      <WidgetTextField
        label="Greeting message"
        name="greeting-message"
        value={greetingMessage}
        onChange={setGreetingMessage}
        maxLength={FIELD_MAX.message}
        helperText="First bubble when the panel opens. Visitors type and send to start chatting."
      />
      <WidgetTextField
        label="Message box placeholder"
        name="send-placeholder"
        value={sendPlaceholder}
        onChange={setSendPlaceholder}
        maxLength={FIELD_MAX.placeholder}
        helperText="Gray hint text in the message field."
      />
      <WidgetColorPickerField
        label="Panel background"
        value={backgroundColor}
        onChange={setBackgroundColor}
        fallback="#f8fafc"
      />
      </Box>
        </SchedulingSectionCard>

        <SchedulingSectionCard title="Chat colors & typography" subtitle="Panel color tokens and size.">
      <Box sx={chatBoxFormStackSx}>
      <WidgetChatColorsSection
        colors={chatColors}
        onChange={setChatColors}
        excludeGroupTitles={["Chat messages"]}
        brandScalars={{
          buttonColor: chromeDraft.buttonColor || "#1E63D5",
          buttonHoverColor: chromeDraft.buttonHoverColor || chromeDraft.buttonColor || "#164EB0",
          iconColor: chromeDraft.iconColor || "#ffffff",
          textColor,
          themeSecondaryColor,
          backgroundColor,
        }}
      />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: 0.5 }}>
        Panel size
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
        <WidgetNumericField
          label="Panel width (px)"
          name="box-width"
          value={boxWidth}
          onChange={setBoxWidth}
          min={280}
          max={520}
        />
        <WidgetNumericField
          label="Panel height (px)"
          name="box-height"
          value={boxHeight}
          onChange={setBoxHeight}
          min={320}
          max={640}
        />
      </Box>
      </Box>
        </SchedulingSectionCard>

        <SchedulingSectionCard title="Brand theme" subtitle="Fonts, spacing, and density for the open panel.">
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5, alignItems: "start" }}>
        <InputField
          label="Theme name"
          name="theme-name"
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          dense
          sx={compactGridFieldSx}
        />
        <WidgetColorPickerField
          label="Secondary color"
          value={themeSecondaryColor}
          onChange={setThemeSecondaryColor}
          fallback="#64748b"
        />
        <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
        <SelectField
          label="Font family"
          value={
            WIDGET_GOOGLE_FONT_OPTIONS.find((f) => f.value === themeFontFamily)?.value ??
            WIDGET_GOOGLE_FONT_OPTIONS[0].value
          }
          onChange={setThemeFontFamily}
          options={WIDGET_GOOGLE_FONT_OPTIONS}
        />
        </Box>
        <InputField
          label="Welcome font size (px)"
          name="theme-welcome-font"
          value={themeWelcomeFontStr}
          onChange={(e) => setThemeWelcomeFontStr(e.target.value)}
          inputProps={{ inputMode: "numeric" }}
        />
        <InputField
          label="Body font size (px)"
          name="theme-body-font"
          value={themeBodyFontStr}
          onChange={(e) => setThemeBodyFontStr(e.target.value)}
          inputProps={{ inputMode: "numeric" }}
        />
        <InputField
          label="Input font size (px)"
          name="theme-input-font"
          value={themeInputFontStr}
          onChange={(e) => setThemeInputFontStr(e.target.value)}
          inputProps={{ inputMode: "numeric" }}
        />
        <InputField
          label="CTA font size (px)"
          name="theme-cta-font"
          value={themeCtaFontStr}
          onChange={(e) => setThemeCtaFontStr(e.target.value)}
          inputProps={{ inputMode: "numeric" }}
        />
        <InputField
          label="Consent font size (px)"
          name="theme-consent-font"
          value={themeConsentFontStr}
          onChange={(e) => setThemeConsentFontStr(e.target.value)}
          inputProps={{ inputMode: "numeric" }}
        />
        <InputField
          label="Line height (px)"
          name="theme-line-height"
          value={themeLineHeightStr}
          onChange={(e) => setThemeLineHeightStr(e.target.value)}
          inputProps={{ inputMode: "numeric" }}
        />
        <SelectField
          label="Design accent"
          value={themeDesignJsonAccent}
          onChange={setThemeDesignJsonAccent}
          options={DESIGN_ACCENT_SELECT_OPTIONS}
        />
        <SelectField
          label="Design density"
          value={themeDesignJsonDensity}
          onChange={setThemeDesignJsonDensity}
          options={DESIGN_DENSITY_SELECT_OPTIONS}
        />
      </Box>
        </SchedulingSectionCard>
      </WidgetWizardPageLayout>
    </WidgetFlowShell>
  );
}

 
