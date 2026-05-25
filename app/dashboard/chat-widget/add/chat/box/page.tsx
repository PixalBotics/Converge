"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, InputField, SelectField, Typography } from "@/components/common";
import { gradientPrimaryButtonSx } from "@/components/common/Button/Button.styles";
import { WidgetFlowShell } from "@/features/chat-widget";
import {
  patchRemoteWidgetConfiguration,
  summarizePatchResult,
} from "@/lib/chat-widget/widget-remote-sync";
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
import { defaultWidgetDraft } from "@/lib/chat-widget/widgetDraft";
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
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { editWidgetKey, draftReady, hydrateError } = useChatWidgetWizardEdit();
  const [headerTitle, setHeaderTitle] = useState("Center");
  const [bannerOn, setBannerOn] = useState(true);
  const [bannerTitle, setBannerTitle] = useState(defaultWidgetDraft.bannerTitle ?? "Special Offer");
  const [bannerDescription, setBannerDescription] = useState(
    defaultWidgetDraft.bannerDescription ?? "",
  );
  const [buttonColor, setButtonColor] = useState("#1ed760");
  const [buttonHoverColor, setButtonHoverColor] = useState("#164EB0");
  const [iconColor, setIconColor] = useState("#FFFFFF");
  const [themeSecondaryColor, setThemeSecondaryColor] = useState(
    defaultWidgetDraft.themeSecondaryColor ?? "#64748b",
  );
  const [textColor, setTextColor] = useState("#d62cad");
  const [bannerFileName, setBannerFileName] = useState("");
  const [bannerDataUrl, setBannerDataUrl] = useState("");
  const [bannerMediaType, setBannerMediaType] = useState<"image" | "video">("image");
  const [companyLogo, setCompanyLogo] = useState("veinso");
  const [greetingMessage, setGreetingMessage] = useState("Welcome to Florida Luxurious. Tell me your budget, location, and property type preference.");
  const [sendPlaceholder, setSendPlaceholder] = useState("Ask about location, budget, or options...");
  const [boxWidth, setBoxWidth] = useState("350");
  const [boxHeight, setBoxHeight] = useState("430");
  const [buttonLabel, setButtonLabel] = useState(defaultWidgetDraft.buttonLabel ?? "Chat with us");
  const [firstMessage, setFirstMessage] = useState(
    defaultWidgetDraft.firstMessage ?? "Hi! How can we help today?",
  );
  const [messagePlaceholder, setMessagePlaceholder] = useState(
    defaultWidgetDraft.messagePlaceholder ?? "Write here…",
  );
  const [backgroundColor, setBackgroundColor] = useState(
    defaultWidgetDraft.backgroundColor ?? "#f8fafc",
  );
  const [inquiryOn, setInquiryOn] = useState(defaultWidgetDraft.inquiryOn ?? false);
  const [inquiryOptions, setInquiryOptions] = useState<WidgetInquiryOption[]>(
    defaultWidgetDraft.inquiryOptions ?? [],
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
  const [saving, setSaving] = useState(false);
  const [checklistRefreshKey, setChecklistRefreshKey] = useState(0);

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
    setHeaderTitle(d.headerTitleAlign === "Left" ? "Left" : "Center");
    setBannerOn(Boolean(d.bannerOn));
    setBannerTitle(d.bannerTitle ?? defaultWidgetDraft.bannerTitle ?? "");
    setBannerDescription(d.bannerDescription ?? defaultWidgetDraft.bannerDescription ?? "");
    setButtonColor(d.buttonColor || "#1ed760");
    setButtonHoverColor(d.buttonHoverColor || d.buttonColor || "#164EB0");
    setIconColor(d.iconColor || "#FFFFFF");
    setThemeSecondaryColor(d.themeSecondaryColor ?? "#64748b");
    setTextColor(d.textColor || "#d62cad");
    setBannerDataUrl(d.bannerDataUrl || "");
    setBannerFileName(d.bannerDataUrl ? "Uploaded banner" : "");
    setBannerMediaType(d.bannerMediaType === "video" ? "video" : "image");
    setCompanyLogo(d.headerTitle || "veinso");
    setGreetingMessage(d.greetingMessage ?? defaultWidgetDraft.greetingMessage);
    setSendPlaceholder(d.sendPlaceholder ?? defaultWidgetDraft.sendPlaceholder);
    setBoxWidth(String(d.boxWidth ?? 350));
    setBoxHeight(String(d.boxHeight ?? 430));
    setButtonLabel(d.buttonLabel ?? "Chat with us");
    setFirstMessage(d.firstMessage ?? "Hi! How can we help today?");
    setMessagePlaceholder(d.messagePlaceholder ?? "Write here…");
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
  }, [draftReady, editWidgetKey]);

  useEffect(() => {
    if (!draftReady) return;
    const d = readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined);
    const def = defaultWidgetDraft;
    if (inquiryTopicsLoading) return;

    if (topicsFromScheduling.length > 0) {
      setInquiryOptions(topicsFromScheduling);
      setInquiryOn(true);
      return;
    }

    const inquiryArr = normalizeWidgetInquiryOptions(d.inquiryOptions ?? def.inquiryOptions);
    setInquiryOn(d.inquiryOn ?? inquiryArr.length > 0);
    setInquiryOptions(inquiryArr);
  }, [draftReady, editWidgetKey, inquiryTopicsLoading, schedulingTopicsFingerprint]);

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
        saveChatWizardDraft(editKey || undefined, {
          headerTitleAlign: headerTitle as "Center" | "Left",
          headerTitle: companyLogo || "AI Sales Assistant",
          buttonColor: buttonColor || "#1ed760",
          textColor: textColor || "#FFFFFF",
          greetingMessage,
          sendPlaceholder,
          bannerOn,
          bannerTitle: bannerTitle.trim(),
          bannerDescription: bannerDescription.trim(),
          bannerDataUrl,
          bannerMediaType,
          boxWidth: safeWidth,
          boxHeight: safeHeight,
          buttonLabel: buttonLabel.trim() || "Chat with us",
          firstMessage: firstMessage.trim(),
          messagePlaceholder: messagePlaceholder.trim(),
          backgroundColor: backgroundColor.trim() || "#f8fafc",
          inquiryOn,
          inquiryOptions: inquiryOn
            ? normalizeWidgetInquiryOptions(inquiryOptions)
            : [],
          ...widgetChatColorsDraftToPatch(chatColors),
        });
        const latest = readChatWizardDraft(editKey || undefined);
        if (wizardWebsiteId && inquiryOn && latest.inquiryOptions?.length) {
          try {
            await persistVisitorTopicsIfValid(
              wizardWebsiteId,
              normalizeWidgetInquiryOptions(latest.inquiryOptions),
            );
          } catch {
            publishAppToast({
              variant: "error",
              message:
                "Chat box saved, but visitor topics could not sync to scheduling. Use Save inquiry topics or assign both departments per topic.",
            });
          }
        }
        const patchInner = await patchRemoteWidgetConfiguration({
          widgetKey: rk,
          widgetKind: "chat",
          draft: latest,
          publishNow: false,
          chatWizardPatchScope: "chat_surface",
        });
        const sum = summarizePatchResult(patchInner);
        saveChatWizardDraft(editKey || undefined, {
          requiresPublishBeforeEmbed: sum.requiresPublishBeforeEmbed,
        });
        setChecklistRefreshKey((k) => k + 1);
        router.push(
          withChatEditQuery(
            "/dashboard/chat-widget/add/chat/notifications",
            resolveEditWidgetKeyForNavigation(editKey),
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
      headerTitle: companyLogo || "AI Sales Assistant",
      headerAlign: (headerTitle === "Left" ? "Left" : "Center") as "Center" | "Left",
      buttonColor: buttonColor || "#1ed760",
      textColor: textColor || "#ffffff",
      backgroundColor: backgroundColor.trim() || "#f8fafc",
      bannerOn,
      bannerTitle,
      bannerDescription,
      bannerDataUrl,
      bannerMediaType,
      greetingMessage,
      firstMessage,
      sendPlaceholder,
      messagePlaceholder,
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
      companyLogo,
      headerTitle,
      buttonColor,
      textColor,
      backgroundColor,
      bannerOn,
      bannerTitle,
      bannerDescription,
      bannerDataUrl,
      bannerMediaType,
      greetingMessage,
      firstMessage,
      sendPlaceholder,
      messagePlaceholder,
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
        preview={<WidgetChatBoxLivePreview model={livePreviewModel} />}
      >
        <SchedulingSectionCard
          title="Panel header & colors"
          subtitle="Header alignment, brand colors, and optional banner."
        >
      <SelectField
        label="Header alignment"
        value={headerTitle}
        onChange={setHeaderTitle}
        options={[
          { label: "Center", value: "Center" },
          { label: "Left", value: "Left" },
        ]}
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 1 }}>
        <WidgetColorPickerField
          label="Header / brand color"
          value={buttonColor}
          onChange={setButtonColor}
          fallback="#2563eb"
        />
        <WidgetColorPickerField
          label="Header text color"
          value={textColor}
          onChange={setTextColor}
          fallback="#ffffff"
        />
      </Box>

      <InputField
        label="Header title text"
        name="header-title"
        value={companyLogo}
        onChange={(event) => setCompanyLogo(event.target.value)}
      />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary }}>
          Banner (Optional)
        </Typography>
        <Switch checked={bannerOn} onChange={(_, checked) => setBannerOn(checked)} color="success" />
      </Box>

      {bannerOn ? (
        <>
          <InputField
            label="Banner title"
            name="banner-title"
            value={bannerTitle}
            onChange={(e) => setBannerTitle(e.target.value)}
          />
          <InputField
            label="Banner description"
            name="banner-description"
            value={bannerDescription}
            onChange={(e) => setBannerDescription(e.target.value)}
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
          onChange={setInquiryOptions}
          disabled={saving}
          topicsLoading={inquiryTopicsLoading}
          loadedFromScheduling={loadedFromScheduling}
          onSaved={(rows) => {
            setInquiryOptions(rows);
            if (rows.length > 0) setInquiryOn(true);
            const editKey = resolveEditWidgetKeyForNavigation(editWidgetKey);
            const prev = readChatWizardDraft(editKey || undefined);
            const mergedDraft = {
              ...prev,
              inquiryOptions: rows,
              inquiryOn: rows.length > 0,
            };
            saveChatWizardDraft(editKey || undefined, {
              inquiryOptions: rows,
              inquiryOn: rows.length > 0,
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
      <InputField label="Floating button label" name="button-label" value={buttonLabel} onChange={(e) => setButtonLabel(e.target.value)} />
      <InputField
        label="First message (intro bubble)"
        name="first-message"
        value={firstMessage}
        onChange={(e) => setFirstMessage(e.target.value)}
      />
      <InputField
        label="Composer placeholder (config.ui)"
        name="message-placeholder"
        value={messagePlaceholder}
        onChange={(e) => setMessagePlaceholder(e.target.value)}
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
          buttonColor,
          buttonHoverColor,
          iconColor,
          textColor,
          themeSecondaryColor,
          backgroundColor,
        }}
      />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25, mt: 1 }}>Text & labels</Typography>
      <InputField label="Greeting Message" name="greeting-message" value={greetingMessage} onChange={(event) => setGreetingMessage(event.target.value)} />

      <InputField label="Send Message Placeholder" name="send-placeholder" value={sendPlaceholder} onChange={(event) => setSendPlaceholder(event.target.value)} />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
        <InputField
          label="Chat Box Width (px)"
          name="box-width"
          type="text"
          value={boxWidth}
          onChange={(event) => setBoxWidth(event.target.value)}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 280, max: 520 }}
        />
        <InputField
          label="Chat Box Height (px)"
          name="box-height"
          type="text"
          value={boxHeight}
          onChange={(event) => setBoxHeight(event.target.value)}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*", min: 320, max: 640 }}
        />
      </Box>
        </SchedulingSectionCard>
      </WidgetWizardPageLayout>
    </WidgetFlowShell>
  );
}

 
