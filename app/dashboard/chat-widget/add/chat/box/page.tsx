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
import { WidgetChatColorsSection } from "@/components/dashboard/chat-widget/WidgetChatColorsSection";
import {
  readWidgetChatColorsFromDraft,
  widgetChatColorsDraftToPatch,
  type WidgetChatColorsDraft,
} from "@/lib/chat-widget/widget-colors-draft";
import { defaultWidgetDraft } from "@/lib/chat-widget/widgetDraft";

const STEPS = ["Widget Button Design", "Chat Box Design", "Notifications & Advanced"];
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
  const [popupEnabled, setPopupEnabled] = useState(defaultWidgetDraft.popupEnabled ?? false);
  const [inquiryOn, setInquiryOn] = useState(defaultWidgetDraft.inquiryOn ?? false);
  const [inquiryOptionsInput, setInquiryOptionsInput] = useState(
    (defaultWidgetDraft.inquiryOptions ?? []).join(", "),
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

  useEffect(() => {
    if (!draftReady) return;
    const d = readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined);
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
    setPopupEnabled(Boolean(d.popupEnabled));
    setChatColors(readWidgetChatColorsFromDraft(d));
    const def = defaultWidgetDraft;
    const inquiryArr = Array.isArray(d.inquiryOptions) ? d.inquiryOptions : (def.inquiryOptions ?? []);
    setInquiryOn(d.inquiryOn ?? inquiryArr.length > 0);
    setInquiryOptionsInput(inquiryArr.join(", "));
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

  const handleButtonColor = (event: ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    if (!color) return;
    setButtonColor(color);
  };

  const handleTextColor = (event: ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    if (!color) return;
    setTextColor(color);
  };

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
          popupEnabled,
          inquiryOn,
          inquiryOptions: inquiryOn
            ? inquiryOptionsInput
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
          ...widgetChatColorsDraftToPatch(chatColors),
        });
        const latest = readChatWizardDraft(editKey || undefined);
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
    () =>
      inquiryOn
        ? inquiryOptionsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    [inquiryOn, inquiryOptionsInput],
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
      stepper={{ labels: STEPS, currentStep: 1 }}
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "minmax(0, 1fr) minmax(300px, 360px)" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <SelectField label="Header Title" value={headerTitle} onChange={setHeaderTitle} options={[{ label: "Center", value: "Center" }, { label: "Left", value: "Left" }]} />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Button Color</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          component="input"
          type="color"
          value={buttonColor}
          onChange={handleButtonColor}
          sx={{
            width: 44,
            height: 44,
            p: 0,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            borderRadius: "4px",
            bgcolor: "transparent",
            cursor: "pointer",
          }}
        />
        <Typography variant="mediumLarge" sx={{ color: theme.app.dashboard.textMuted }}>
          Choose color
        </Typography>
      </Box>
      <InputField label="Hex" name="button-color-hex" value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Text Color</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          component="input"
          type="color"
          value={textColor}
          onChange={handleTextColor}
          sx={{
            width: 44,
            height: 44,
            p: 0,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            borderRadius: "4px",
            bgcolor: "transparent",
            cursor: "pointer",
          }}
        />
        <Typography variant="mediumLarge" sx={{ color: theme.app.dashboard.textMuted }}>
          Choose color
        </Typography>
      </Box>
      <InputField label="Hex" name="text-color-hex" value={textColor} onChange={(e) => setTextColor(e.target.value)} />

      <InputField label="Company Logo" name="logo" value={companyLogo} onChange={(event) => setCompanyLogo(event.target.value)} />

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

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
        <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary }}>
          Inquiry topics (optional)
        </Typography>
        <Switch checked={inquiryOn} onChange={(_, checked) => setInquiryOn(checked)} color="success" />
      </Box>
      {inquiryOn ? (
        <InputField
          label="Topic labels (comma-separated)"
          name="inquiry-options"
          value={inquiryOptionsInput}
          onChange={(e) => setInquiryOptionsInput(e.target.value)}
          placeholder="Billing, Technical, Sales"
        />
      ) : null}

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mt: 1.5, mb: -1.25 }}>
        Launcher & panel shell (config.ui)
      </Typography>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1 }}>
        Shown on step 2 PATCH: floating button label, first bubble line, composer placeholder, panel background.
      </Typography>
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
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>
        Panel background
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          component="input"
          type="color"
          value={backgroundColor.startsWith("#") && backgroundColor.length >= 4 ? backgroundColor : "#f8fafc"}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setBackgroundColor(e.target.value)}
          sx={{
            width: 44,
            height: 44,
            p: 0,
            border: `1px solid ${theme.app.dashboard.cardBorder}`,
            borderRadius: "4px",
            bgcolor: "transparent",
            cursor: "pointer",
          }}
        />
        <InputField label="Hex" name="bg-hex" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
        <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary }}>
          Popup auto-open (config.ui.popupEnabled)
        </Typography>
        <Switch checked={popupEnabled} onChange={(_, c) => setPopupEnabled(c)} color="success" />
      </Box>

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

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Text & Labels</Typography>
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
        </Box>

        <Box
          sx={{
            position: { xl: "sticky" },
            top: 16,
            maxHeight: { xl: "calc(100vh - 120px)" },
            overflowY: { xl: "auto" },
          }}
        >
          <WidgetChatBoxLivePreview model={livePreviewModel} />
        </Box>
      </Box>
    </WidgetFlowShell>
  );
}

 
