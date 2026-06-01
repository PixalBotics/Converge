"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/features/chat-widget";
import { mergeWizardDraftForPublish } from "@/lib/chat-widget/merge-wizard-draft-for-publish";
import {
  patchRemoteWidgetConfigurationWithMeta,
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
import { WidgetColorPickerField } from "@/components/dashboard/chat-widget/WidgetColorPickerField";
import { WidgetChatColorsSection } from "@/components/dashboard/chat-widget/WidgetChatColorsSection";
import {
  readWidgetChatColorsFromDraft,
  widgetChatColorsDraftToPatch,
  type WidgetChatColorsDraft,
} from "@/lib/chat-widget/widget-colors-draft";
import { WidgetInquiryOptionsEditor } from "@/components/dashboard/chat-widget/WidgetInquiryOptionsEditor";
import { SchedulingSectionCard } from "@/features/website-assignments/components/ServiceSchedulingSections";
import { WidgetWizardPageLayout } from "@/features/chat-widget/components/WidgetWizardPageLayout";
import { WidgetWizardStepGuide } from "@/features/chat-widget/components/WidgetWizardStepGuide";
import {
  WidgetNumericField,
  WidgetTextField,
} from "@/features/chat-widget/components/WidgetFormFields";
import { FIELD_MAX } from "@/lib/chat-widget/widget-field-validation";
import { WidgetWizardToggleRow } from "@/features/chat-widget/components/WidgetWizardToggleRow";
import { defaultWidgetDraft } from "@/lib/chat-widget/widgetDraft";
import { useWizardLauncherChrome } from "@/lib/chat-widget/use-wizard-launcher-preview";
import { resolveWizardLauncherPreview } from "@/lib/chat-widget/widget-wizard-save-trace";
import { syncResponseCopyFromChatBox } from "@/lib/chat-widget/sync-response-copy-from-chat-box";
import { WidgetWizardSiteChromePreview } from "@/features/chat-widget/components/WidgetWizardSiteChromePreview";
import Stack from "@mui/material/Stack";
import {
  normalizeWidgetInquiryOptions,
  type WidgetInquiryOption,
} from "@/lib/chat-widget/widget-inquiry.types";
import { useInquiryTopicsForWebsite } from "@/lib/chat-widget/use-inquiry-topics-for-website";
import {
  persistVisitorTopicsIfValid,
  syncInquiryToWidgetJson,
} from "@/lib/chat-widget/sync-inquiry-topics";
export default function ChatWidgetBoxDesignPage() {
  const { recordSave } = useWidgetWizardSaveTrace();
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { editWidgetKey, draftReady, hydrateError } = useChatWidgetWizardEdit();
  const [headerTitleAlign, setHeaderTitleAlign] = useState<"Center" | "Left">("Center");
  const [bannerOn, setBannerOn] = useState(true);
  const [bannerTitle, setBannerTitle] = useState(defaultWidgetDraft.bannerTitle ?? "Special Offer");
  const [bannerDescription, setBannerDescription] = useState(
    defaultWidgetDraft.bannerDescription ?? "",
  );
  const [headerBrandColor, setHeaderBrandColor] = useState("#1ed760");
  const [themeSecondaryColor, setThemeSecondaryColor] = useState(
    defaultWidgetDraft.themeSecondaryColor ?? "#64748b",
  );
  const [textColor, setTextColor] = useState("#d62cad");
  const [bannerFileName, setBannerFileName] = useState("");
  const [bannerDataUrl, setBannerDataUrl] = useState("");
  const [bannerMediaType, setBannerMediaType] = useState<"image" | "video">("image");
  const [panelHeaderTitle, setPanelHeaderTitle] = useState(
    defaultWidgetDraft.headerTitle ?? "Live chat",
  );
  const [panelGreetingEnabled, setPanelGreetingEnabled] = useState(
    defaultWidgetDraft.panelGreetingEnabled ?? true,
  );
  const [chatWelcomeEnabled, setChatWelcomeEnabled] = useState(
    defaultWidgetDraft.chatWelcomeEnabled ?? true,
  );
  const [greetingMessage, setGreetingMessage] = useState("Welcome to Florida Luxurious. Tell me your budget, location, and property type preference.");
  const [sendPlaceholder, setSendPlaceholder] = useState("Ask about location, budget, or options...");
  const [boxWidth, setBoxWidth] = useState("350");
  const [boxHeight, setBoxHeight] = useState("430");
  const [buttonLabel, setButtonLabel] = useState(defaultWidgetDraft.buttonLabel ?? "Chat with us");
  const [firstMessage, setFirstMessage] = useState(
    defaultWidgetDraft.firstMessage ?? "Hi! How can we help today?",
  );
  const [backgroundColor, setBackgroundColor] = useState(
    defaultWidgetDraft.backgroundColor ?? "#f8fafc",
  );
  const [inquiryOn, setInquiryOn] = useState(defaultWidgetDraft.inquiryOn ?? false);
  const [inquiryOptions, setInquiryOptions] = useState<WidgetInquiryOption[]>(
    defaultWidgetDraft.inquiryOptions ?? [],
  );
  const [inquiryFallbackRoutingKey, setInquiryFallbackRoutingKey] = useState(
    defaultWidgetDraft.inquiryFallbackRoutingKey ?? "",
  );
  const [wizardWebsiteId, setWizardWebsiteId] = useState<string | undefined>(
    defaultWidgetDraft.websiteId,
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
    handoverEnabled: defaultWidgetDraft.responseAgentHandoverEnabled ?? true,
    handoverTriggerText: defaultWidgetDraft.responseHandoverTriggerText ?? "",
    chatMode: defaultWidgetDraft.chatMode ?? "HYBRID",
  });
  const bannerUploadRef = useRef<HTMLInputElement | null>(null);
  const inquiryTopicsTouchedRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [checklistRefreshKey, setChecklistRefreshKey] = useState(0);

  const { chromeDraft } = useWizardLauncherChrome(
    editWidgetKey,
    draftReady,
    checklistRefreshKey,
    { buttonLabel, themePrimaryColor: headerBrandColor },
  );

  useEffect(() => {
    inquiryTopicsTouchedRef.current = false;
  }, [editWidgetKey]);

  const {
    topicsFromScheduling,
    isLoading: inquiryTopicsLoading,
    loadedFromScheduling,
  } = useInquiryTopicsForWebsite(wizardWebsiteId, draftReady);

  const schedulingTopicsFingerprint = useMemo(
    () =>
      topicsFromScheduling
        .map((t) => `${t.routingKey}:${t.label}:${t.internalDepartmentId}:${t.externalDepartmentId}`)
        .join("|"),
    [topicsFromScheduling],
  );

  useEffect(() => {
    if (!draftReady) return;
    const d = readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined);
    const def = defaultWidgetDraft;
    setHeaderTitleAlign(d.headerTitleAlign === "Left" ? "Left" : "Center");
    setBannerOn(Boolean(d.bannerOn));
    setBannerTitle(d.bannerTitle ?? defaultWidgetDraft.bannerTitle ?? "");
    setBannerDescription(d.bannerDescription ?? defaultWidgetDraft.bannerDescription ?? "");
    setHeaderBrandColor(
      d.themePrimaryColor?.trim() || d.buttonColor?.trim() || "#1ed760",
    );
    setThemeSecondaryColor(d.themeSecondaryColor ?? "#64748b");
    setTextColor(d.textColor || "#d62cad");
    setBannerDataUrl(d.bannerDataUrl || "");
    setBannerFileName(d.bannerDataUrl ? "Uploaded banner" : "");
    setBannerMediaType(d.bannerMediaType === "video" ? "video" : "image");
    setPanelHeaderTitle(
      d.headerTitle ?? defaultWidgetDraft.headerTitle ?? "Live chat",
    );
    setPanelGreetingEnabled(d.panelGreetingEnabled !== false);
    setChatWelcomeEnabled(d.chatWelcomeEnabled !== false);
    setGreetingMessage(d.greetingMessage ?? defaultWidgetDraft.greetingMessage);
    setSendPlaceholder(
      d.sendPlaceholder ??
        d.messagePlaceholder ??
        defaultWidgetDraft.sendPlaceholder,
    );
    setBoxWidth(String(d.boxWidth ?? 350));
    setBoxHeight(String(d.boxHeight ?? 430));
    setButtonLabel(d.buttonLabel ?? "Chat with us");
    setFirstMessage(d.firstMessage ?? "Hi! How can we help today?");
    setBackgroundColor(d.backgroundColor ?? "#f8fafc");
    setChatColors(readWidgetChatColorsFromDraft(d));
    setWizardWebsiteId(d.websiteId);
    setPreviewForm({
      formEnabled: d.formEnabled ?? def.formEnabled ?? true,
      formTitle: d.formTitle ?? def.formTitle ?? "",
      formSubtitle: d.formSubtitle ?? def.formSubtitle ?? "",
      formSubmitLabel: d.formSubmitLabel ?? def.formSubmitLabel ?? "",
      prechatNameEnabled: d.prechatNameEnabled ?? def.prechatNameEnabled ?? true,
      prechatEmailEnabled: d.prechatEmailEnabled ?? def.prechatEmailEnabled ?? true,
      prechatPhoneEnabled: d.prechatPhoneEnabled ?? def.prechatPhoneEnabled ?? false,
      prechatMessageEnabled: d.prechatMessageEnabled ?? def.prechatMessageEnabled ?? true,
      handoverEnabled: d.responseAgentHandoverEnabled ?? def.responseAgentHandoverEnabled ?? true,
      handoverTriggerText: d.responseHandoverTriggerText ?? def.responseHandoverTriggerText ?? "",
      chatMode: d.chatMode ?? def.chatMode ?? "HYBRID",
    });
  }, [draftReady, editWidgetKey, checklistRefreshKey]);

  useEffect(() => {
    if (!draftReady) return;
    const d = readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined);
    const def = defaultWidgetDraft;
    if (inquiryTopicsLoading) return;
    if (inquiryTopicsTouchedRef.current) return;

    if (topicsFromScheduling.length > 0) {
      setInquiryOptions(topicsFromScheduling);
      setInquiryOn(true);
      return;
    }

    const inquiryArr = normalizeWidgetInquiryOptions(d.inquiryOptions ?? def.inquiryOptions);
    setInquiryOn(d.inquiryOn ?? inquiryArr.length > 0);
    setInquiryOptions(inquiryArr);
    setInquiryFallbackRoutingKey(
      d.inquiryFallbackRoutingKey?.trim() ||
        inquiryArr.find((o) => o.routingKey.trim())?.routingKey ||
        def.inquiryFallbackRoutingKey ||
        "",
    );
  }, [draftReady, editWidgetKey, inquiryTopicsLoading, schedulingTopicsFingerprint, topicsFromScheduling]);

  const handleBannerUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBannerFileName(file.name);
    setBannerMediaType(file.type.startsWith("video/") ? "video" : "image");
    const reader = new FileReader();
    reader.onload = () => setBannerDataUrl(typeof reader.result === "string" ? reader.result : "");
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

      setSaving(true);
      try {
        const launcherFromStep1 = resolveWizardLauncherPreview(prev);
        saveChatWizardDraft(editKey || undefined, {
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
          themeName: prev.themeName,
          themeFontFamily: prev.themeFontFamily,
          themeBubbleStyle: prev.themeBubbleStyle,
          themeBorderRadiusPx: prev.themeBorderRadiusPx,
          themeWelcomeFontSizePx: prev.themeWelcomeFontSizePx,
          themeBodyFontSizePx: prev.themeBodyFontSizePx,
          themeInputFontSizePx: prev.themeInputFontSizePx,
          themeCtaFontSizePx: prev.themeCtaFontSizePx,
          themeConsentFontSizePx: prev.themeConsentFontSizePx,
          themeLineHeightPx: prev.themeLineHeightPx,
          themeDesignJsonAccent: prev.themeDesignJsonAccent,
          themeDesignJsonDensity: prev.themeDesignJsonDensity,
          themeSecondaryColor: prev.themeSecondaryColor ?? themeSecondaryColor,
          headerTitleAlign,
          headerTitle: panelHeaderTitle.trim() || defaultWidgetDraft.headerTitle,
          ...syncResponseCopyFromChatBox({
            ...prev,
            greetingMessage,
            firstMessage,
            sendPlaceholder,
            messagePlaceholder: sendPlaceholder,
          }),
          themePrimaryColor:
            headerBrandColor.trim() || prev.themePrimaryColor || prev.buttonColor,
          textColor: textColor || prev.textColor || "#FFFFFF",
          panelGreetingEnabled,
          chatWelcomeEnabled,
          greetingMessage,
          sendPlaceholder,
          messagePlaceholder: sendPlaceholder.trim(),
          bannerOn,
          bannerTitle: bannerTitle.trim(),
          bannerDescription: bannerDescription.trim(),
          bannerDataUrl,
          bannerMediaType,
          boxWidth: safeWidth,
          boxHeight: safeHeight,
          buttonLabel: buttonLabel.trim() || prev.buttonLabel || "Chat with us",
          firstMessage: firstMessage.trim(),
          backgroundColor: backgroundColor.trim() || prev.backgroundColor || "#f8fafc",
          inquiryOn,
          inquiryOptions: inquiryOn
            ? normalizeWidgetInquiryOptions(inquiryOptions)
            : [],
          inquiryFallbackRoutingKey: inquiryFallbackRoutingKey.trim() || undefined,
          ...widgetChatColorsDraftToPatch(chatColors),
        });
        const latest = readChatWizardDraft(editKey || undefined);
        if (wizardWebsiteId && inquiryOn && latest.inquiryOptions?.length) {
          const topicsResult = await persistVisitorTopicsIfValid(
            wizardWebsiteId,
            normalizeWidgetInquiryOptions(latest.inquiryOptions),
          );
          if (!topicsResult.ok) {
            publishAppToast({
              variant: "error",
              message: topicsResult.error,
            });
            setSaving(false);
            return;
          }
          try {
            await syncInquiryToWidgetJson({ widgetKey: rk, draft: latest });
          } catch {
            publishAppToast({
              variant: "error",
              message:
                "Visitor topics saved, but widget JSON sync failed. Try Save inquiry topics or click Next again.",
            });
          }
        }
        const patchMeta = await patchRemoteWidgetConfigurationWithMeta({
          widgetKey: rk,
          widgetKind: "chat",
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

  const inquiryOptionsList = useMemo(
    () => (inquiryOn ? inquiryOptions.map((o) => o.label).filter(Boolean) : []),
    [inquiryOn, inquiryOptions],
  );

  const livePreviewModel = useMemo(
    () => ({
      headerTitle: panelHeaderTitle || defaultWidgetDraft.headerTitle,
      headerAlign: headerTitleAlign,
      buttonColor: headerBrandColor || "#1ed760",
      textColor: textColor || "#ffffff",
      backgroundColor: backgroundColor.trim() || "#f8fafc",
      bannerOn,
      bannerTitle,
      bannerDescription,
      bannerDataUrl,
      bannerMediaType,
      greetingMessage: panelGreetingEnabled ? greetingMessage : "",
      firstMessage: chatWelcomeEnabled ? firstMessage : "",
      sendPlaceholder,
      messagePlaceholder: sendPlaceholder,
      boxWidth: Number.isFinite(parsedPreviewWidth) ? parsedPreviewWidth : 350,
      boxHeight: Number.isFinite(parsedPreviewHeight) ? parsedPreviewHeight : 430,
      colors: {
        ...chatColors,
        inquiryPillBg: backgroundColor.trim() || chatColors.inquiryPillBg,
        handoverButtonBg: backgroundColor.trim() || chatColors.handoverButtonBg,
      },
      inquiryOn,
      inquiryOptions: inquiryOptionsList,
      formEnabled: previewForm.formEnabled,
      formTitle: previewForm.formTitle,
      formSubtitle: previewForm.formSubtitle,
      formSubmitLabel: previewForm.formSubmitLabel,
      prechatNameEnabled: previewForm.prechatNameEnabled,
      prechatEmailEnabled: previewForm.prechatEmailEnabled,
      prechatPhoneEnabled: previewForm.prechatPhoneEnabled,
      prechatMessageEnabled: previewForm.prechatMessageEnabled,
      handoverEnabled: previewForm.handoverEnabled,
      handoverTriggerText: previewForm.handoverTriggerText,
      chatMode: previewForm.chatMode,
    }),
    [
      panelHeaderTitle,
      headerTitleAlign,
      headerBrandColor,
      textColor,
      backgroundColor,
      bannerOn,
      bannerTitle,
      bannerDescription,
      bannerDataUrl,
      bannerMediaType,
      panelGreetingEnabled,
      greetingMessage,
      chatWelcomeEnabled,
      firstMessage,
      sendPlaceholder,
      parsedPreviewWidth,
      parsedPreviewHeight,
      chatColors,
      inquiryOn,
      inquiryOptionsList,
      previewForm,
    ],
  );

  return (
    <WidgetFlowShell
      pageTitle="Widget Customization"
      subtitle="Connect your workflow with industry-leading CRM platform minutes."
      cardTitle="Chat Box Design"
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
        checklistRefreshKey={checklistRefreshKey}
        preview={
          <Stack spacing={2.5}>
            <WidgetWizardSiteChromePreview draft={chromeDraft} />
            <WidgetChatBoxLivePreview model={livePreviewModel} />
          </Stack>
        }
      >
        <WidgetWizardStepGuide step="box" />
        <SchedulingSectionCard
          title="Panel header & colors"
          subtitle="Header alignment, brand colors, and optional banner."
        >
      <SelectField
        label="Header alignment"
        value={headerTitleAlign}
        onChange={(v) => setHeaderTitleAlign(v as "Center" | "Left")}
        options={[
          { label: "Center", value: "Center" },
          { label: "Left", value: "Left" },
        ]}
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 1 }}>
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

      <WidgetTextField
        label="Header title"
        name="header-title"
        value={panelHeaderTitle}
        onChange={setPanelHeaderTitle}
        maxLength={FIELD_MAX.title}
        helperText="Top bar inside the open chat panel."
      />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary }}>
          Banner (Optional)
        </Typography>
        <Switch checked={bannerOn} onChange={(_, checked) => setBannerOn(checked)} color="success" />
      </Box>

      {bannerOn ? (
        <>
          <WidgetTextField
            label="Banner title"
            name="banner-title"
            value={bannerTitle}
            onChange={setBannerTitle}
            maxLength={FIELD_MAX.title}
          />
          <WidgetTextField
            label="Banner description"
            name="banner-description"
            value={bannerDescription}
            onChange={setBannerDescription}
            maxLength={FIELD_MAX.message}
          />
          <Box
            role="button"
            tabIndex={0}
            onClick={() => bannerUploadRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                bannerUploadRef.current?.click();
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
              Click to upload banner
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              {bannerFileName || "Max 10 MB files are allowed"}
            </Typography>
          </Box>
        </>
      ) : null}
      <Box component="input" ref={bannerUploadRef} type="file" accept=".png,.jpg,.jpeg,.webp,.gif,.mp4,.webm,.ogg,.mov" onChange={handleBannerUpload} sx={{ display: "none" }} />
        </SchedulingSectionCard>

      <SchedulingSectionCard
        title="Inquiry topics"
        subtitle="Save or Next writes topics to visitor-topics (routing) and widget JSON (embed pills). Publish from Script when done."
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            mb: 1.5,
          }}
        >
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Show topic pills on widget
          </Typography>
          <Switch
            checked={inquiryOn}
            onChange={(_, checked) => setInquiryOn(checked)}
            color="success"
            inputProps={{ "aria-label": "Show inquiry topic pills on widget" }}
          />
        </Box>
        <WidgetInquiryOptionsEditor
          websiteId={wizardWebsiteId}
          value={inquiryOptions}
          onChange={(rows) => {
            inquiryTopicsTouchedRef.current = true;
            setInquiryOptions(rows);
          }}
          inquiryFallbackRoutingKey={inquiryFallbackRoutingKey}
          onFallbackRoutingKeyChange={setInquiryFallbackRoutingKey}
          disabled={saving}
          topicsLoading={inquiryTopicsLoading}
          loadedFromScheduling={loadedFromScheduling}
          onSaved={(rows) => {
            inquiryTopicsTouchedRef.current = false;
            setInquiryOptions(rows);
            if (rows.length > 0) setInquiryOn(true);
            const editKey = resolveEditWidgetKeyForNavigation(editWidgetKey);
            const prev = readChatWizardDraft(editKey || undefined);
            const fallbackKey =
              inquiryFallbackRoutingKey.trim() ||
              rows.find((o) => o.routingKey.trim())?.routingKey ||
              "";
            const mergedDraft = {
              ...prev,
              inquiryOptions: rows,
              inquiryOn: rows.length > 0,
              inquiryFallbackRoutingKey: fallbackKey || undefined,
            };
            saveChatWizardDraft(editKey || undefined, {
              inquiryOptions: rows,
              inquiryOn: rows.length > 0,
              inquiryFallbackRoutingKey: fallbackKey || undefined,
            });
            const rk = resolveRemoteWidgetKeyForChatWizard(editKey || undefined, prev);
            if (rk) {
              void syncInquiryToWidgetJson({ widgetKey: rk, draft: mergedDraft }).catch(
                () => {
                  publishAppToast({
                    variant: "error",
                    message:
                      "Topics saved for the website, but widget JSON sync failed. Click Next on this step or publish again.",
                  });
                },
              );
            }
          }}
        />
      </SchedulingSectionCard>

        <SchedulingSectionCard
          title="Launcher & panel shell"
          subtitle="Floating button label, intro bubble, composer placeholder, and panel background."
        >
      <WidgetTextField
        label="Floating button label"
        name="button-label"
        value={buttonLabel}
        onChange={setButtonLabel}
        maxLength={FIELD_MAX.shortLabel}
        helperText="Short label on the closed chat button (optional)."
      />
      <WidgetWizardToggleRow
        label="Panel greeting (Continue step)"
        description="Intro screen with Continue before chat or form."
        checked={panelGreetingEnabled}
        onChange={setPanelGreetingEnabled}
      />
      {panelGreetingEnabled ? (
        <WidgetTextField
          label="Panel greeting text"
          name="greeting-message"
          value={greetingMessage}
          onChange={setGreetingMessage}
          maxLength={FIELD_MAX.message}
          helperText="Intro screen before Continue."
        />
      ) : null}
      <WidgetWizardToggleRow
        label="Chat welcome (first bubble)"
        description="First agent line in the transcript after pre-chat."
        checked={chatWelcomeEnabled}
        onChange={setChatWelcomeEnabled}
      />
      {chatWelcomeEnabled ? (
        <WidgetTextField
          label="First chat message"
          name="first-message"
          value={firstMessage}
          onChange={setFirstMessage}
          maxLength={FIELD_MAX.message}
          helperText="First bubble after the visitor starts chatting."
        />
      ) : null}
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
        </SchedulingSectionCard>

        <SchedulingSectionCard title="Chat colors & typography" subtitle="Panel tokens and greeting copy.">
      <WidgetChatColorsSection
        colors={chatColors}
        onChange={setChatColors}
        brandScalars={{
          buttonColor: chromeDraft.buttonColor || "#1E63D5",
          buttonHoverColor: chromeDraft.buttonHoverColor || chromeDraft.buttonColor || "#164EB0",
          iconColor: chromeDraft.iconColor || "#ffffff",
          textColor,
          themeSecondaryColor,
          backgroundColor,
        }}
      />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25, mt: 1 }}>
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
        </SchedulingSectionCard>
      </WidgetWizardPageLayout>
    </WidgetFlowShell>
  );
}

 
