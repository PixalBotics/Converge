"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { WidgetBehaviorLivePreview } from "@/components/dashboard/chat-widget/WidgetBehaviorLivePreview";
import { WidgetWizardPageLayout } from "@/features/chat-widget/components/WidgetWizardPageLayout";
import { WidgetWizardToggleRow } from "@/features/chat-widget/components/WidgetWizardToggleRow";
import { SchedulingSectionCard } from "@/features/website-assignments/components/ServiceSchedulingSections";
import { readWidgetChatColorsFromDraft } from "@/lib/chat-widget/widget-colors-draft";
import { WidgetAiTypeField } from "@/components/dashboard/chat-widget/WidgetAiTypeField";
import { syncResponseCopyFromChatBox } from "@/lib/chat-widget/sync-response-copy-from-chat-box";
import {
  defaultWidgetDraft,
  type WidgetInstallChatMode,
} from "@/lib/chat-widget/widgetDraft";
import {
  normalizeWidgetAiType,
  shouldShowWidgetAiType,
  type WidgetAiType,
} from "@/lib/chat-widget/widget-ai-type";
import { normalizeWidgetInquiryOptions } from "@/lib/chat-widget/widget-inquiry.types";
import { useInquiryTopicsForWebsite } from "@/lib/chat-widget/use-inquiry-topics-for-website";

export default function ChatWidgetNotificationsPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { editWidgetKey, draftReady, hydrateError } = useChatWidgetWizardEdit();
  const [browserNotification, setBrowserNotification] = useState(true);
  const [soundNotification, setSoundNotification] = useState(false);
  const [chatMode, setChatMode] = useState<WidgetInstallChatMode>("HYBRID");
  const [aiType, setAiType] = useState<WidgetAiType>("AI_CHATBOT");
  const [allowedDomainsInput, setAllowedDomainsInput] = useState("");
  const [videoWelcomeOn, setVideoWelcomeOn] = useState(false);
  const [videoWelcomeUrl, setVideoWelcomeUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [checklistRefreshKey, setChecklistRefreshKey] = useState(0);
  const [fallbackText, setFallbackText] = useState(
    "You have a new message from support.",
  );

  const d0 = defaultWidgetDraft;
  const [botEnabled, setBotEnabled] = useState(d0.botEnabled ?? true);
  const [inquiryOn, setInquiryOn] = useState(d0.inquiryOn ?? false);
  const [autoOpenEnabled, setAutoOpenEnabled] = useState(d0.autoOpenEnabled ?? false);
  const [autoOpenDelayStr, setAutoOpenDelayStr] = useState(String(d0.autoOpenDelaySeconds ?? 10));
  const [consentRequired, setConsentRequired] = useState(d0.consentRequired ?? true);
  const [consentText, setConsentText] = useState(d0.consentText ?? "");
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState(d0.privacyPolicyUrl ?? "");
  const [formEnabled, setFormEnabled] = useState(d0.formEnabled ?? true);
  const [formTitle, setFormTitle] = useState(d0.formTitle ?? "");
  const [formSubtitle, setFormSubtitle] = useState(d0.formSubtitle ?? "");
  const [formSubmitLabel, setFormSubmitLabel] = useState(d0.formSubmitLabel ?? "");
  const [prechatNameEnabled, setPrechatNameEnabled] = useState(d0.prechatNameEnabled ?? true);
  const [prechatEmailEnabled, setPrechatEmailEnabled] = useState(d0.prechatEmailEnabled ?? true);
  const [prechatPhoneEnabled, setPrechatPhoneEnabled] = useState(d0.prechatPhoneEnabled ?? false);
  const [prechatMessageEnabled, setPrechatMessageEnabled] = useState(d0.prechatMessageEnabled ?? true);
  const [prechatMessageRequired, setPrechatMessageRequired] = useState(d0.prechatMessageRequired ?? false);
  const [responseOfflineMessage, setResponseOfflineMessage] = useState(d0.responseOfflineMessage ?? "");
  const [responseAgentHandoverEnabled, setResponseAgentHandoverEnabled] = useState(
    d0.responseAgentHandoverEnabled ?? true,
  );
  const [responseHandoverTriggerText, setResponseHandoverTriggerText] = useState(
    d0.responseHandoverTriggerText ?? "Talk to agent",
  );
  const [wizardWebsiteId, setWizardWebsiteId] = useState<string | undefined>(
    defaultWidgetDraft.websiteId,
  );

  const { topicsFromScheduling, isLoading: inquiryTopicsLoading } = useInquiryTopicsForWebsite(
    wizardWebsiteId,
    draftReady,
  );

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
    setWizardWebsiteId(d.websiteId);
    const def = defaultWidgetDraft;
    setChatMode(d.chatMode ?? "HYBRID");
    setAiType(normalizeWidgetAiType(d.aiType));
    const adArr = Array.isArray(d.allowedDomains) ? d.allowedDomains : (def.allowedDomains ?? []);
    setAllowedDomainsInput(adArr.join(", "));
    setBrowserNotification(d.browserNotification ?? def.browserNotification ?? true);
    setSoundNotification(d.soundNotification ?? def.soundNotification ?? false);
    setVideoWelcomeOn(d.videoWelcomeOn ?? false);
    setVideoWelcomeUrl(d.videoWelcomeUrl ?? "");
    setFallbackText(d.fallbackNotificationText ?? def.fallbackNotificationText ?? "");
    setBotEnabled(d.botEnabled ?? def.botEnabled ?? true);
    setAutoOpenEnabled(d.autoOpenEnabled ?? d.popupEnabled ?? false);
    setAutoOpenDelayStr(String(d.autoOpenDelaySeconds ?? def.autoOpenDelaySeconds ?? 10));
    setConsentRequired(d.consentRequired ?? def.consentRequired ?? true);
    setConsentText(d.consentText ?? def.consentText ?? "");
    setPrivacyPolicyUrl(d.privacyPolicyUrl ?? def.privacyPolicyUrl ?? "");
    setFormEnabled(d.formEnabled ?? def.formEnabled ?? true);
    setFormTitle(d.formTitle ?? def.formTitle ?? "");
    setFormSubtitle(d.formSubtitle ?? def.formSubtitle ?? "");
    setFormSubmitLabel(d.formSubmitLabel ?? def.formSubmitLabel ?? "");
    setPrechatNameEnabled(d.prechatNameEnabled ?? def.prechatNameEnabled ?? true);
    setPrechatEmailEnabled(d.prechatEmailEnabled ?? def.prechatEmailEnabled ?? true);
    setPrechatPhoneEnabled(d.prechatPhoneEnabled ?? def.prechatPhoneEnabled ?? false);
    setPrechatMessageEnabled(d.prechatMessageEnabled ?? def.prechatMessageEnabled ?? true);
    setPrechatMessageRequired(d.prechatMessageRequired ?? def.prechatMessageRequired ?? false);
    setResponseOfflineMessage(d.responseOfflineMessage ?? def.responseOfflineMessage ?? "");
    setResponseAgentHandoverEnabled(d.responseAgentHandoverEnabled ?? def.responseAgentHandoverEnabled ?? true);
    setResponseHandoverTriggerText(
      d.responseHandoverTriggerText ?? def.responseHandoverTriggerText ?? "Talk to agent",
    );
  }, [draftReady, editWidgetKey]);

  useEffect(() => {
    if (!draftReady || inquiryTopicsLoading) return;
    const editKey = resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined;
    const def = defaultWidgetDraft;

    if (topicsFromScheduling.length > 0) {
      setInquiryOn(true);
      saveChatWizardDraft(editKey, {
        inquiryOptions: topicsFromScheduling,
        inquiryOn: true,
      });
      return;
    }

    const d = readChatWizardDraft(editKey);
    const inquiryArr = normalizeWidgetInquiryOptions(d.inquiryOptions ?? def.inquiryOptions);
    setInquiryOn(d.inquiryOn ?? inquiryArr.length > 0);
  }, [draftReady, editWidgetKey, inquiryTopicsLoading, schedulingTopicsFingerprint]);

  const inquiryOptionsList = useMemo(() => {
    if (!inquiryOn || !draftReady) return [];
    const d = readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined);
    return normalizeWidgetInquiryOptions(d.inquiryOptions).map((o) => o.label);
  }, [inquiryOn, draftReady, editWidgetKey]);

  const behaviorPreviewModel = useMemo(() => {
    const draft = draftReady
      ? readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined)
      : defaultWidgetDraft;
    const colors = readWidgetChatColorsFromDraft(draft);
    return {
      chatMode,
      buttonColor: draft.buttonColor || "#1ed760",
      textColor: draft.textColor || "#FFFFFF",
      backgroundColor: draft.backgroundColor || "#f8fafc",
      colors,
      formEnabled,
      formTitle: formTitle.trim(),
      formSubtitle: formSubtitle.trim(),
      formSubmitLabel: formSubmitLabel.trim(),
      prechatNameEnabled,
      prechatEmailEnabled,
      prechatPhoneEnabled,
      prechatMessageEnabled,
      consentRequired,
      consentText: consentText.trim(),
      inquiryOn,
      inquiryOptions: inquiryOptionsList,
      handoverEnabled: responseAgentHandoverEnabled,
      handoverTriggerText: responseHandoverTriggerText.trim(),
      greetingMessage: (draft.greetingMessage ?? defaultWidgetDraft.greetingMessage) || "",
      firstMessage: (draft.firstMessage ?? defaultWidgetDraft.firstMessage) || "",
      sendPlaceholder:
        draft.sendPlaceholder?.trim() ||
        draft.messagePlaceholder?.trim() ||
        defaultWidgetDraft.sendPlaceholder ||
        "",
      headerTitle: draft.headerTitle ?? "Live chat",
      offlineMessage: responseOfflineMessage.trim(),
    };
  }, [
    draftReady,
    editWidgetKey,
    chatMode,
    formEnabled,
    formTitle,
    formSubtitle,
    formSubmitLabel,
    prechatNameEnabled,
    prechatEmailEnabled,
    prechatPhoneEnabled,
    prechatMessageEnabled,
    consentRequired,
    consentText,
    inquiryOn,
    inquiryOptionsList,
    responseAgentHandoverEnabled,
    responseHandoverTriggerText,
    responseOfflineMessage,
  ]);

  const handleSaveAndNext = () => {
    if (saving) return;
    void (async () => {
      const editKey = resolveEditWidgetKeyForNavigation(editWidgetKey);
      const prev = readChatWizardDraft(editKey || undefined);
      const rk = resolveRemoteWidgetKeyForChatWizard(editKey || undefined, prev);
      if (!rk) {
        publishAppToast({
          variant: "error",
          message: "Missing server widget draft. Go back to the first step and save again.",
        });
        router.push("/dashboard/chat-widget/add");
        return;
      }

      setSaving(true);
      try {
        const autoOpenDelay = Math.min(300, Math.max(0, Number.parseInt(autoOpenDelayStr, 10) || 10));
        saveChatWizardDraft(editKey || undefined, {
          chatMode,
          aiType: shouldShowWidgetAiType(chatMode) ? aiType : undefined,
          allowedDomains: allowedDomainsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          browserNotification,
          soundNotification,
          notificationEnabled: browserNotification || soundNotification,
          fallbackNotificationText: fallbackText.trim() || "New message from support",
          videoWelcomeOn,
          videoWelcomeUrl: videoWelcomeUrl.trim(),
          botEnabled,
          inquiryOn,
          inquiryOptions: inquiryOn
            ? normalizeWidgetInquiryOptions(readChatWizardDraft(editKey || undefined).inquiryOptions)
            : [],
          autoOpenEnabled,
          autoOpenDelaySeconds: autoOpenDelay,
          popupEnabled: autoOpenEnabled,
          consentRequired,
          consentText: consentText.trim(),
          privacyPolicyUrl: privacyPolicyUrl.trim(),
          formEnabled,
          formTitle: formTitle.trim(),
          formSubtitle: formSubtitle.trim(),
          formSubmitLabel: formSubmitLabel.trim(),
          prechatNameEnabled,
          prechatEmailEnabled,
          prechatPhoneEnabled,
          prechatMessageEnabled,
          prechatMessageRequired,
          responseOfflineMessage: responseOfflineMessage.trim(),
          responseAgentHandoverEnabled,
          responseHandoverTriggerText: responseHandoverTriggerText.trim() || "Talk to agent",
          ...syncResponseCopyFromChatBox(prev),
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
        setChecklistRefreshKey((k) => k + 1);
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
            extractApiErrorMessageForToast(e) ?? "Could not save advanced settings to the server.",
        });
      } finally {
        setSaving(false);
      }
    })();
  };

  return (
    <WidgetFlowShell
      pageTitle="Widget Customization"
      subtitle="Notifications, routing, visitor form, and agent handoff."
      cardTitle="Notifications & Advanced"
      currentStep={2}
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
            onClick={handleSaveAndNext}
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
        checklistRefreshKey={checklistRefreshKey}
        preview={<WidgetBehaviorLivePreview model={behaviorPreviewModel} />}
      >
        <SchedulingSectionCard
          title="Notification settings"
          subtitle="Browser and sound alerts when the visitor tab is in the background."
        >
          <WidgetWizardToggleRow
            label="Browser notification"
            checked={browserNotification}
            onChange={setBrowserNotification}
          />
          <WidgetWizardToggleRow
            label="Sound notification"
            checked={soundNotification}
            onChange={setSoundNotification}
          />
          <Box sx={{ mt: 1.5 }}>
            <InputField
              label="Fallback notification text"
              name="fallback"
              value={fallbackText}
              onChange={(e) => setFallbackText(e.target.value)}
              inputProps={{ maxLength: 120 }}
            />
          </Box>
        </SchedulingSectionCard>

        <SchedulingSectionCard
          title="Chat routing & agent handoff"
          subtitle="Who replies first, embed domains, offline copy, and the Talk to agent button (Hybrid only)."
        >
          <SelectField
            label="Chat mode"
            value={chatMode}
            onChange={(v) => setChatMode(v as WidgetInstallChatMode)}
            options={[
              { label: "Hybrid — AI first, then human handoff", value: "HYBRID" },
              { label: "AI only — no live agent button", value: "AI_ONLY" },
              { label: "Agent only — no AI replies", value: "AGENT_ONLY" },
            ]}
            searchable={false}
            menuMaxRows={6}
          />
          {shouldShowWidgetAiType(chatMode) ? (
            <Box sx={{ mt: 1.5 }}>
              <WidgetAiTypeField value={aiType} onChange={setAiType} />
            </Box>
          ) : null}
          {chatMode === "HYBRID" ? (
            <>
              <Box sx={{ mt: 1.5 }}>
                <WidgetWizardToggleRow
                  label="Show Talk to agent button"
                  description="Single handoff control in the chat composer area."
                  checked={responseAgentHandoverEnabled}
                  onChange={setResponseAgentHandoverEnabled}
                />
              </Box>
              {responseAgentHandoverEnabled ? (
                <InputField
                  label="Talk to agent button label"
                  name="handover-label"
                  value={responseHandoverTriggerText}
                  onChange={(e) => setResponseHandoverTriggerText(e.target.value)}
                  placeholder="Talk to agent"
                />
              ) : null}
            </>
          ) : null}
          <Box sx={{ mt: 1.5 }}>
            <InputField
              label="Offline message"
              name="resp-offline"
              value={responseOfflineMessage}
              onChange={(e) => setResponseOfflineMessage(e.target.value)}
              placeholder="We are offline; leave a message and we will reply."
            />
          </Box>
          <Box sx={{ mt: 1.5 }}>
            <InputField
              label="Allowed domains (comma-separated hosts, optional)"
              name="allowed-domains"
              value={allowedDomainsInput}
              onChange={(e) => setAllowedDomainsInput(e.target.value)}
              placeholder="example.com, app.example.com"
            />
          </Box>
        </SchedulingSectionCard>

        <SchedulingSectionCard
          title="Widget behavior"
          subtitle="Bot, inquiry pills, and auto-open."
        >
          <WidgetWizardToggleRow label="Bot enabled" checked={botEnabled} onChange={setBotEnabled} />
          <WidgetWizardToggleRow label="Inquiry topic pills" checked={inquiryOn} onChange={setInquiryOn} />
          {inquiryOn ? (
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1 }}>
              Topics are edited on <strong>Chat Box Design</strong> (
              {inquiryOptionsList.length} topic
              {inquiryOptionsList.length === 1 ? "" : "s"}
              {inquiryOptionsList.length ? `: ${inquiryOptionsList.join(", ")}` : ""}).
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 1 }}>
              Topic pills are hidden. Enable them on the Chat Box Design step.
            </Typography>
          )}
          <WidgetWizardToggleRow label="Auto-open widget" checked={autoOpenEnabled} onChange={setAutoOpenEnabled} />
          <InputField
            label="Auto-open delay (seconds)"
            name="auto-open-delay"
            value={autoOpenDelayStr}
            onChange={(e) => setAutoOpenDelayStr(e.target.value)}
            inputProps={{ inputMode: "numeric" }}
          />
        </SchedulingSectionCard>

        <SchedulingSectionCard
          title="Video welcome"
          subtitle="Optional YouTube or Vimeo link before chat."
        >
          <WidgetWizardToggleRow
            label="Show video welcome"
            checked={videoWelcomeOn}
            onChange={setVideoWelcomeOn}
          />
          {videoWelcomeOn ? (
            <InputField
              label="Video URL (YouTube / Vimeo)"
              name="video-welcome-url"
              value={videoWelcomeUrl}
              onChange={(e) => setVideoWelcomeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          ) : null}
        </SchedulingSectionCard>

        <SchedulingSectionCard
          title="Visitor form"
          subtitle="Collect visitor details before chat starts. Greeting and chat copy stay on Chat Box Design."
        >
          <WidgetWizardToggleRow label="Form enabled" checked={formEnabled} onChange={setFormEnabled} />
          <InputField label="Form title" name="form-title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
          <InputField
            label="Form subtitle"
            name="form-subtitle"
            value={formSubtitle}
            onChange={(e) => setFormSubtitle(e.target.value)}
          />
          <InputField
            label="Start chat button label"
            name="form-submit"
            value={formSubmitLabel}
            onChange={(e) => setFormSubmitLabel(e.target.value)}
          />
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 0.5, mt: 0.5 }}>
            Fields to show
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
          <Box sx={{ mt: 1.5 }}>
            <WidgetWizardToggleRow
              label="Consent required"
              checked={consentRequired}
              onChange={setConsentRequired}
            />
          </Box>
          {consentRequired ? (
            <>
              <InputField
                label="Consent text"
                name="consent-text"
                value={consentText}
                onChange={(e) => setConsentText(e.target.value)}
              />
              <InputField
                label="Privacy policy URL"
                name="privacy-url"
                value={privacyPolicyUrl}
                onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
              />
            </>
          ) : null}
        </SchedulingSectionCard>
      </WidgetWizardPageLayout>
    </WidgetFlowShell>
  );
}
