"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Switch from "@mui/material/Switch";
import { useTheme } from "@mui/material/styles";
import type { AppTheme } from "@/theme/theme";
import { Button, Checkbox, InputField, SelectField, Typography } from "@/components/common";
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
import {
  defaultWidgetDraft,
  type WidgetInstallChatMode,
} from "@/lib/chat-widget/widgetDraft";

const STEPS = ["Widget Button Design", "Chat Box Design", "Notifications & Advanced"];

export default function ChatWidgetNotificationsPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { editWidgetKey, draftReady, hydrateError } = useChatWidgetWizardEdit();
  const [browserNotification, setBrowserNotification] = useState(true);
  const [soundNotification, setSoundNotification] = useState(false);
  const [chatMode, setChatMode] = useState<WidgetInstallChatMode>("HYBRID");
  const [allowedDomainsInput, setAllowedDomainsInput] = useState("");
  const [videoWelcomeOn, setVideoWelcomeOn] = useState(false);
  const [videoSource, setVideoSource] = useState("upload");
  const [videoFileName, setVideoFileName] = useState("");
  const videoUploadRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [fallbackText, setFallbackText] = useState(
    "You have a new message from support.",
  );

  const d0 = defaultWidgetDraft;
  const [botEnabled, setBotEnabled] = useState(d0.botEnabled ?? true);
  const [welcomeMessageBehavior, setWelcomeMessageBehavior] = useState(
    d0.welcomeMessageBehavior ?? "Thanks for reaching out.",
  );
  const [inquiryOptionsInput, setInquiryOptionsInput] = useState(
    (d0.inquiryOptions ?? ["Billing", "Technical", "Sales"]).join(", "),
  );
  const [autoOpenEnabled, setAutoOpenEnabled] = useState(d0.autoOpenEnabled ?? false);
  const [autoOpenDelayStr, setAutoOpenDelayStr] = useState(String(d0.autoOpenDelaySeconds ?? 10));
  const [fileUploadEnabled, setFileUploadEnabled] = useState(d0.fileUploadEnabled ?? true);
  const [emojiEnabled, setEmojiEnabled] = useState(d0.emojiEnabled ?? true);
  const [consentRequired, setConsentRequired] = useState(d0.consentRequired ?? true);
  const [consentText, setConsentText] = useState(d0.consentText ?? "");
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState(d0.privacyPolicyUrl ?? "");
  const [privacyNotice, setPrivacyNotice] = useState(d0.privacyNotice ?? "");
  const [allowedDomainsText, setAllowedDomainsText] = useState(d0.allowedDomainsText ?? "");
  const [persistVisitorSession, setPersistVisitorSession] = useState(d0.persistVisitorSession ?? true);
  const [sessionTtlStr, setSessionTtlStr] = useState(String(d0.sessionTtlMinutes ?? 120));
  const [formEnabled, setFormEnabled] = useState(d0.formEnabled ?? true);
  const [formTitle, setFormTitle] = useState(d0.formTitle ?? "");
  const [formSubtitle, setFormSubtitle] = useState(d0.formSubtitle ?? "");
  const [formSubmitLabel, setFormSubmitLabel] = useState(d0.formSubmitLabel ?? "");
  const [prechatNameEnabled, setPrechatNameEnabled] = useState(d0.prechatNameEnabled ?? true);
  const [prechatEmailEnabled, setPrechatEmailEnabled] = useState(d0.prechatEmailEnabled ?? true);
  const [prechatPhoneEnabled, setPrechatPhoneEnabled] = useState(d0.prechatPhoneEnabled ?? false);
  const [prechatMessageEnabled, setPrechatMessageEnabled] = useState(d0.prechatMessageEnabled ?? true);
  const [prechatMessageRequired, setPrechatMessageRequired] = useState(d0.prechatMessageRequired ?? false);
  const [responseWelcomeMessage, setResponseWelcomeMessage] = useState(d0.responseWelcomeMessage ?? "");
  const [responseOfflineMessage, setResponseOfflineMessage] = useState(d0.responseOfflineMessage ?? "");
  const [responseGreetingMessage, setResponseGreetingMessage] = useState(d0.responseGreetingMessage ?? "");
  const [responseSendPlaceholder, setResponseSendPlaceholder] = useState(d0.responseSendPlaceholder ?? "");
  const [responseAiPromptHint, setResponseAiPromptHint] = useState(d0.responseAiPromptHint ?? "");
  const [responseAgentHandoverEnabled, setResponseAgentHandoverEnabled] = useState(
    d0.responseAgentHandoverEnabled ?? true,
  );
  const [responseHandoverTriggerText, setResponseHandoverTriggerText] = useState(
    d0.responseHandoverTriggerText ?? "talk to human",
  );

  useEffect(() => {
    if (!draftReady) return;
    const d = readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined);
    const def = defaultWidgetDraft;
    setChatMode(d.chatMode ?? "HYBRID");
    const rawAd = d.allowedDomains;
    const adArr = Array.isArray(rawAd)
      ? rawAd
      : typeof rawAd === "string"
        ? rawAd.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
    setAllowedDomainsInput(adArr.join(", "));
    setBrowserNotification(d.browserNotification ?? def.browserNotification ?? true);
    setSoundNotification(d.soundNotification ?? def.soundNotification ?? false);
    setVideoWelcomeOn(d.videoWelcomeOn ?? false);
    setFallbackText(d.fallbackNotificationText ?? def.fallbackNotificationText ?? "");
    setBotEnabled(d.botEnabled ?? def.botEnabled ?? true);
    setWelcomeMessageBehavior(d.welcomeMessageBehavior ?? def.welcomeMessageBehavior ?? "");
    setInquiryOptionsInput(
      (() => {
        const rawInq = d.inquiryOptions;
        const inquiryArr = Array.isArray(rawInq)
          ? rawInq
          : typeof rawInq === "string"
            ? rawInq.split(",").map((s) => s.trim()).filter(Boolean)
            : def.inquiryOptions ?? [];
        return inquiryArr.join(", ");
      })(),
    );
    setAutoOpenEnabled(d.autoOpenEnabled ?? false);
    setAutoOpenDelayStr(String(d.autoOpenDelaySeconds ?? def.autoOpenDelaySeconds ?? 10));
    setFileUploadEnabled(d.fileUploadEnabled ?? def.fileUploadEnabled ?? true);
    setEmojiEnabled(d.emojiEnabled ?? def.emojiEnabled ?? true);
    setConsentRequired(d.consentRequired ?? def.consentRequired ?? true);
    setConsentText(d.consentText ?? def.consentText ?? "");
    setPrivacyPolicyUrl(d.privacyPolicyUrl ?? def.privacyPolicyUrl ?? "");
    setPrivacyNotice(d.privacyNotice ?? def.privacyNotice ?? "");
    setAllowedDomainsText(d.allowedDomainsText ?? def.allowedDomainsText ?? "");
    setPersistVisitorSession(d.persistVisitorSession ?? def.persistVisitorSession ?? true);
    setSessionTtlStr(String(d.sessionTtlMinutes ?? def.sessionTtlMinutes ?? 120));
    setFormEnabled(d.formEnabled ?? def.formEnabled ?? true);
    setFormTitle(d.formTitle ?? def.formTitle ?? "");
    setFormSubtitle(d.formSubtitle ?? def.formSubtitle ?? "");
    setFormSubmitLabel(d.formSubmitLabel ?? def.formSubmitLabel ?? "");
    setPrechatNameEnabled(d.prechatNameEnabled ?? def.prechatNameEnabled ?? true);
    setPrechatEmailEnabled(d.prechatEmailEnabled ?? def.prechatEmailEnabled ?? true);
    setPrechatPhoneEnabled(d.prechatPhoneEnabled ?? def.prechatPhoneEnabled ?? false);
    setPrechatMessageEnabled(d.prechatMessageEnabled ?? def.prechatMessageEnabled ?? true);
    setPrechatMessageRequired(d.prechatMessageRequired ?? def.prechatMessageRequired ?? false);
    setResponseWelcomeMessage(d.responseWelcomeMessage ?? def.responseWelcomeMessage ?? "");
    setResponseOfflineMessage(d.responseOfflineMessage ?? def.responseOfflineMessage ?? "");
    setResponseGreetingMessage(d.responseGreetingMessage ?? def.responseGreetingMessage ?? "");
    setResponseSendPlaceholder(d.responseSendPlaceholder ?? def.responseSendPlaceholder ?? "");
    setResponseAiPromptHint(d.responseAiPromptHint ?? def.responseAiPromptHint ?? "");
    setResponseAgentHandoverEnabled(d.responseAgentHandoverEnabled ?? def.responseAgentHandoverEnabled ?? true);
    setResponseHandoverTriggerText(d.responseHandoverTriggerText ?? def.responseHandoverTriggerText ?? "");
  }, [draftReady, editWidgetKey]);

  const handleVideoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVideoFileName(file.name);
  };

  return (
    <WidgetFlowShell
      pageTitle="Widget Customization"
      subtitle="Connect your workflow with industry-leading CRM platform minutes."
      cardTitle="Notifications & Advanced"
      stepper={{ labels: STEPS, currentStep: 2 }}
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
            onClick={() => {
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

                setSaving(true);
                try {
                  saveChatWizardDraft(editKey || undefined, {
                    chatMode,
                    allowedDomains: allowedDomainsInput
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                    browserNotification,
                    soundNotification,
                    notificationEnabled: browserNotification || soundNotification,
                    fallbackNotificationText: fallbackText.trim() || "New message from support",
                    videoWelcomeOn,
                    botEnabled,
                    welcomeMessageBehavior: welcomeMessageBehavior.trim(),
                    inquiryOptions: inquiryOptionsInput
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                    autoOpenEnabled,
                    autoOpenDelaySeconds: Math.min(300, Math.max(0, Number.parseInt(autoOpenDelayStr, 10) || 10)),
                    fileUploadEnabled,
                    emojiEnabled,
                    consentRequired,
                    consentText: consentText.trim(),
                    privacyPolicyUrl: privacyPolicyUrl.trim(),
                    privacyNotice: privacyNotice.trim(),
                    allowedDomainsText: allowedDomainsText.trim(),
                    persistVisitorSession,
                    sessionTtlMinutes: Math.min(10080, Math.max(5, Number.parseInt(sessionTtlStr, 10) || 120)),
                    formEnabled,
                    formTitle: formTitle.trim(),
                    formSubtitle: formSubtitle.trim(),
                    formSubmitLabel: formSubmitLabel.trim(),
                    prechatNameEnabled,
                    prechatEmailEnabled,
                    prechatPhoneEnabled,
                    prechatMessageEnabled,
                    prechatMessageRequired,
                    responseWelcomeMessage: responseWelcomeMessage.trim(),
                    responseOfflineMessage: responseOfflineMessage.trim(),
                    responseGreetingMessage: responseGreetingMessage.trim(),
                    responseSendPlaceholder: responseSendPlaceholder.trim(),
                    responseAiPromptHint: responseAiPromptHint.trim(),
                    responseAgentHandoverEnabled,
                    responseHandoverTriggerText: responseHandoverTriggerText.trim(),
                  });
                  const latest = readChatWizardDraft(editKey || undefined);
                  const patchInner = await patchRemoteWidgetConfiguration({
                    widgetKey: rk,
                    widgetKind: "chat",
                    draft: latest,
                    publishNow: false,
                    embedAllowAnyOrigin: false,
                    chatWizardPatchScope: "notifications_only",
                  });
                  const sum = summarizePatchResult(patchInner);
                  saveChatWizardDraft(editKey || undefined, {
                    requiresPublishBeforeEmbed: sum.requiresPublishBeforeEmbed,
                  });
                  router.push(
                    withChatEditQuery(
                      "/dashboard/chat-widget/add/chat/script",
                      resolveEditWidgetKeyForNavigation(editKey),
                    ),
                  );
                } catch (e) {
                  publishAppToast({
                    variant: "error",
                    message:
                      extractApiErrorMessageForToast(e) ??
                      "Could not save advanced settings to the server.",
                  });
                } finally {
                  setSaving(false);
                }
              })();
            }}
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
      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Notification Settings</Typography>
      <Box sx={{ display: "flex", gap: 2.5 }}>
        <Checkbox checked={browserNotification} onChange={(e) => setBrowserNotification(e.target.checked)} />
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, ml: -1.5 }}>Browser Notification</Typography>
        <Checkbox checked={soundNotification} onChange={(e) => setSoundNotification(e.target.checked)} />
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted, ml: -1.5 }}>Sound Notification</Typography>
      </Box>

      <InputField
        label="Fallback Notification Text"
        name="fallback"
        value={fallbackText}
        onChange={(e) => setFallbackText(e.target.value)}
        inputProps={{ maxLength: 120 }}
      />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25, mt: 0.5 }}>
        Chat routing (backend mode)
      </Typography>
      <SelectField
        label="Chat mode"
        value={chatMode}
        onChange={(v) => setChatMode(v as WidgetInstallChatMode)}
        options={[
          { label: "Hybrid (AI then agent handoff)", value: "HYBRID" },
          { label: "AI only", value: "AI_ONLY" },
          { label: "Agent only", value: "AGENT_ONLY" },
        ]}
        searchable={false}
        menuMaxRows={6}
      />
      <InputField
        label="Allowed domains (comma-separated hosts, optional)"
        name="allowed-domains"
        value={allowedDomainsInput}
        onChange={(e) => setAllowedDomainsInput(e.target.value)}
        placeholder="example.com, app.example.com"
      />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary }}>
          Video Welcome Message
        </Typography>
        <Switch checked={videoWelcomeOn} onChange={(_, checked) => setVideoWelcomeOn(checked)} color="success" />
      </Box>

      {videoWelcomeOn ? (
        <>
          <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mb: -1.25 }}>Video Source</Typography>
          <RadioGroup row value={videoSource} onChange={(e) => setVideoSource(e.target.value)} sx={{ gap: 2.5 }}>
            <FormControlLabel value="upload" control={<Radio />} label={<Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>Upload Video</Typography>} />
            <FormControlLabel value="url" control={<Radio />} label={<Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>Video URL (YouTube/Vimeo)</Typography>} />
          </RadioGroup>

          <Box
            role="button"
            tabIndex={0}
            onClick={() => videoUploadRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                videoUploadRef.current?.click();
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
              Click to upload video
            </Typography>
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
              {videoFileName || "Max 10 MB files are allowed"}
            </Typography>
          </Box>
          <Box component="input" ref={videoUploadRef} type="file" accept=".mp4,.webm,.mov" onChange={handleVideoUpload} sx={{ display: "none" }} />
        </>
      ) : null}

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mt: 2.5, mb: 0.5 }}>
        Behavior (config.behavior)
      </Typography>
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1 }}>
        Bot, routing copy, inquiry chips, auto-open, uploads, consent — saved on this step.
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
          Bot enabled
        </Typography>
        <Switch checked={botEnabled} onChange={(_, c) => setBotEnabled(c)} color="success" />
      </Box>
      <InputField
        label="Welcome message (behavior)"
        name="welcome-behavior"
        value={welcomeMessageBehavior}
        onChange={(e) => setWelcomeMessageBehavior(e.target.value)}
      />
      <InputField
        label="Inquiry options (comma-separated)"
        name="inquiry-options"
        value={inquiryOptionsInput}
        onChange={(e) => setInquiryOptionsInput(e.target.value)}
        placeholder="Billing, Technical, Sales"
      />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
          Auto-open widget
        </Typography>
        <Switch checked={autoOpenEnabled} onChange={(_, c) => setAutoOpenEnabled(c)} color="success" />
      </Box>
      <InputField
        label="Auto-open delay (seconds)"
        name="auto-open-delay"
        value={autoOpenDelayStr}
        onChange={(e) => setAutoOpenDelayStr(e.target.value)}
        inputProps={{ inputMode: "numeric" }}
      />
      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Switch checked={fileUploadEnabled} onChange={(_, c) => setFileUploadEnabled(c)} color="success" />
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            File upload
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Switch checked={emojiEnabled} onChange={(_, c) => setEmojiEnabled(c)} color="success" />
          <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
            Emoji
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
          Consent required
        </Typography>
        <Switch checked={consentRequired} onChange={(_, c) => setConsentRequired(c)} color="success" />
      </Box>
      <InputField label="Consent text" name="consent-text" value={consentText} onChange={(e) => setConsentText(e.target.value)} />
      <InputField label="Privacy policy URL" name="privacy-url" value={privacyPolicyUrl} onChange={(e) => setPrivacyPolicyUrl(e.target.value)} />
      <InputField label="Privacy notice" name="privacy-notice" value={privacyNotice} onChange={(e) => setPrivacyNotice(e.target.value)} />
      <InputField
        label="Allowed domains helper text"
        name="allowed-domains-text"
        value={allowedDomainsText}
        onChange={(e) => setAllowedDomainsText(e.target.value)}
      />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mt: 2, mb: 0.5 }}>
        Session (config.session)
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
          Persist visitor session
        </Typography>
        <Switch checked={persistVisitorSession} onChange={(_, c) => setPersistVisitorSession(c)} color="success" />
      </Box>
      <InputField
        label="Session TTL (minutes)"
        name="session-ttl"
        value={sessionTtlStr}
        onChange={(e) => setSessionTtlStr(e.target.value)}
        inputProps={{ inputMode: "numeric" }}
      />

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mt: 2, mb: 0.5 }}>
        Pre-chat form (config.form)
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
          Form enabled
        </Typography>
        <Switch checked={formEnabled} onChange={(_, c) => setFormEnabled(c)} color="success" />
      </Box>
      <InputField label="Form title" name="form-title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
      <InputField label="Form subtitle" name="form-subtitle" value={formSubtitle} onChange={(e) => setFormSubtitle(e.target.value)} />
      <InputField label="Submit button label" name="form-submit" value={formSubmitLabel} onChange={(e) => setFormSubmitLabel(e.target.value)} />
      <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 0.5 }}>
        Field toggles
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {[
          ["Name", prechatNameEnabled, setPrechatNameEnabled] as const,
          ["Email", prechatEmailEnabled, setPrechatEmailEnabled] as const,
          ["Phone", prechatPhoneEnabled, setPrechatPhoneEnabled] as const,
          ["Message", prechatMessageEnabled, setPrechatMessageEnabled] as const,
          ["Message required", prechatMessageRequired, setPrechatMessageRequired] as const,
        ].map(([label, val, setter]) => (
          <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Switch checked={val} onChange={(_, c) => setter(c)} color="success" />
            <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography variant="mediumLarge" sx={{ color: theme.app.text.primary, mt: 2, mb: 0.5 }}>
        Responses (config.response)
      </Typography>
      <InputField
        label="Welcome message (response)"
        name="resp-welcome"
        value={responseWelcomeMessage}
        onChange={(e) => setResponseWelcomeMessage(e.target.value)}
      />
      <InputField
        label="Offline message"
        name="resp-offline"
        value={responseOfflineMessage}
        onChange={(e) => setResponseOfflineMessage(e.target.value)}
      />
      <InputField
        label="Greeting (response)"
        name="resp-greeting"
        value={responseGreetingMessage}
        onChange={(e) => setResponseGreetingMessage(e.target.value)}
      />
      <InputField
        label="Send placeholder (response)"
        name="resp-send-ph"
        value={responseSendPlaceholder}
        onChange={(e) => setResponseSendPlaceholder(e.target.value)}
      />
      <InputField
        label="AI prompt hint"
        name="resp-ai-hint"
        value={responseAiPromptHint}
        onChange={(e) => setResponseAiPromptHint(e.target.value)}
      />
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
          Agent handover enabled
        </Typography>
        <Switch
          checked={responseAgentHandoverEnabled}
          onChange={(_, c) => setResponseAgentHandoverEnabled(c)}
          color="success"
        />
      </Box>
      <InputField
        label="Handover trigger text"
        name="resp-handover"
        value={responseHandoverTriggerText}
        onChange={(e) => setResponseHandoverTriggerText(e.target.value)}
      />
    </WidgetFlowShell>
  );
}
