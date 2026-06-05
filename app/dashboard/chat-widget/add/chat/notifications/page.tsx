"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
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
import { WidgetBehaviorLivePreview } from "@/components/dashboard/chat-widget/WidgetBehaviorLivePreview";
import { WidgetWizardPageLayout } from "@/features/chat-widget/components/WidgetWizardPageLayout";
import { WidgetWizardSiteChromePreview } from "@/features/chat-widget/components/WidgetWizardSiteChromePreview";
import Link from "next/link";
import { WidgetWizardToggleRow } from "@/features/chat-widget/components/WidgetWizardToggleRow";
import { SchedulingSectionCard } from "@/features/website-assignments/components/ServiceSchedulingSections";
import { readWidgetChatColorsFromDraft } from "@/lib/chat-widget/widget-colors-draft";
import { WidgetAiTypeField } from "@/components/dashboard/chat-widget/WidgetAiTypeField";
import { syncResponseCopyFromChatBox } from "@/lib/chat-widget/sync-response-copy-from-chat-box";
import {
  notificationsCheckboxItemSx,
  notificationsCheckboxRowSx,
  notificationsFieldGroupSx,
  notificationsFormStackSx,
  notificationsInlineTogglesSx,
  notificationsSectionHintSx,
  notificationsSectionTitleSx,
  notificationsSwitchLabelSx,
  notificationsSwitchRowSx,
} from "./notifications-advanced.styles";
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
import { mergeDraftAllowedDomains } from "@/lib/chat-widget/default-allowed-domains";
import { WidgetWizardStepGuide } from "@/features/chat-widget/components/WidgetWizardStepGuide";
import {
  WidgetDomainListField,
  WidgetNumericField,
  WidgetTextField,
  WidgetUrlField,
} from "@/features/chat-widget/components/WidgetFormFields";
import {
  FIELD_MAX,
  parseDomainListInput,
  validateDomainListInput,
  validateSingleHttpUrl,
  validateVideoEmbedUrl,
} from "@/lib/chat-widget/widget-field-validation";
import {
  normalizeLauncherBadgeMode,
  normalizeWidgetSoundId,
} from "@/lib/widget-runtime/widget-notifications";
import { useWizardLauncherChrome } from "@/lib/chat-widget/use-wizard-launcher-preview";
import { resolveWizardLauncherPreview } from "@/lib/chat-widget/widget-wizard-save-trace";

export default function ChatWidgetNotificationsPage() {
  const router = useRouter();
  const theme = useTheme() as AppTheme;
  const { recordSave } = useWidgetWizardSaveTrace();
  const { editWidgetKey, draftReady, hydrateError } = useChatWidgetWizardEdit();
  const d0 = defaultWidgetDraft;
  const [browserNotification, setBrowserNotification] = useState(true);
  const [soundNotification, setSoundNotification] = useState(false);
  const [chatMode, setChatMode] = useState<WidgetInstallChatMode>("HYBRID");
  const [aiType, setAiType] = useState<WidgetAiType>("AI_CHATBOT");
  const [allowedDomainsInput, setAllowedDomainsInput] = useState("");
  const [videoWelcomeOn, setVideoWelcomeOn] = useState(false);
  const [videoWelcomeUrl, setVideoWelcomeUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [checklistRefreshKey, setChecklistRefreshKey] = useState(0);
  const { chromeDraft } = useWizardLauncherChrome(
    editWidgetKey,
    draftReady,
    checklistRefreshKey,
  );
  const [fallbackText, setFallbackText] = useState(
    "You have a new message from support.",
  );
  const [motionEnabled, setMotionEnabled] = useState(d0.motionEnabled !== false);
  const [botEnabled, setBotEnabled] = useState(d0.botEnabled ?? true);
  const [inquiryRequired, setInquiryRequired] = useState(d0.inquiryRequired ?? false);
  const [inquirySkipLabel, setInquirySkipLabel] = useState(
    d0.inquirySkipLabel ?? "General question",
  );
  const [autoOpenEnabled, setAutoOpenEnabled] = useState(d0.autoOpenEnabled ?? false);
  const [autoOpenOnReturnVisit, setAutoOpenOnReturnVisit] = useState(
    d0.autoOpenOnReturnVisit ?? false,
  );
  const [autoOpenDelayStr, setAutoOpenDelayStr] = useState(String(d0.autoOpenDelaySeconds ?? 10));
  const [notificationSoundId, setNotificationSoundId] = useState<
    "soft" | "chime" | "ping" | "none"
  >(d0.notificationSoundId ?? "chime");
  const [launcherBadgeMode, setLauncherBadgeMode] = useState<"count" | "dot" | "none">(
    d0.launcherBadgeMode ?? "count",
  );
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
  const [responseTalkToAgentEnabled, setresponseTalkToAgentEnabled] = useState(
    d0.responseTalkToAgentEnabled ?? true,
  );
  const [responseTalkToAgentTriggerText, setresponseTalkToAgentTriggerText] = useState(
    d0.responseTalkToAgentTriggerText ?? "Talk to agent",
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
    setAutoOpenOnReturnVisit(d.autoOpenOnReturnVisit ?? def.autoOpenOnReturnVisit ?? false);
    setAutoOpenDelayStr(String(d.autoOpenDelaySeconds ?? def.autoOpenDelaySeconds ?? 10));
    setNotificationSoundId(
      normalizeWidgetSoundId(d.notificationSoundId ?? def.notificationSoundId ?? "chime"),
    );
    setLauncherBadgeMode(
      normalizeLauncherBadgeMode(d.launcherBadgeMode ?? def.launcherBadgeMode ?? "count"),
    );
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
    setresponseTalkToAgentEnabled(d.responseTalkToAgentEnabled ?? def.responseTalkToAgentEnabled ?? true);
    setMotionEnabled(d.motionEnabled !== false);
    setresponseTalkToAgentTriggerText(
      d.responseTalkToAgentTriggerText ?? def.responseTalkToAgentTriggerText ?? "Talk to agent",
    );
    setInquiryRequired(d.inquiryRequired ?? def.inquiryRequired ?? false);
    setInquirySkipLabel(d.inquirySkipLabel ?? def.inquirySkipLabel ?? "General question");
  }, [draftReady, editWidgetKey]);

  useEffect(() => {
    if (!draftReady || inquiryTopicsLoading) return;
    const editKey = resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined;
    const def = defaultWidgetDraft;

    if (topicsFromScheduling.length > 0) {
      saveChatWizardDraft(editKey, {
        inquiryOptions: normalizeWidgetInquiryOptions(topicsFromScheduling),
        inquiryOn: true,
      });
      return;
    }

    const d = readChatWizardDraft(editKey);
    setInquiryRequired(d.inquiryRequired ?? def.inquiryRequired ?? false);
    setInquirySkipLabel(d.inquirySkipLabel ?? def.inquirySkipLabel ?? "General question");
  }, [draftReady, editWidgetKey, inquiryTopicsLoading, schedulingTopicsFingerprint, topicsFromScheduling]);

  const inquiryOnFromDraft = useMemo(() => {
    if (!draftReady) return false;
    const d = readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined);
    const opts = normalizeWidgetInquiryOptions(d.inquiryOptions ?? []);
    return d.inquiryOn === true || opts.length > 0;
  }, [draftReady, editWidgetKey]);

  const inquiryOptionsList = useMemo(() => {
    if (!inquiryOnFromDraft || !draftReady) return [];
    const d = readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined);
    return normalizeWidgetInquiryOptions(d.inquiryOptions).map((o) => o.label);
  }, [inquiryOnFromDraft, draftReady, editWidgetKey]);

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
      inquiryOn: inquiryOnFromDraft,
      inquiryOptions: inquiryOptionsList,
      talkToAgentEnabled: responseTalkToAgentEnabled,
      talkToAgentTriggerText: responseTalkToAgentTriggerText.trim(),
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
    inquiryOnFromDraft,
    inquiryOptionsList,
    responseTalkToAgentEnabled,
    responseTalkToAgentTriggerText,
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

      if (videoWelcomeOn) {
        const videoErr = validateVideoEmbedUrl(videoWelcomeUrl);
        if (videoErr) {
          publishAppToast({ variant: "error", message: videoErr });
          return;
        }
      }
      if (consentRequired && privacyPolicyUrl.trim()) {
        const privacyErr = validateSingleHttpUrl(privacyPolicyUrl, {
          label: "Privacy policy URL",
        });
        if (privacyErr) {
          publishAppToast({ variant: "error", message: privacyErr });
          return;
        }
      }
      const domainErr = validateDomainListInput(allowedDomainsInput);
      if (domainErr) {
        publishAppToast({ variant: "error", message: domainErr });
        return;
      }

      setSaving(true);
      try {
        const autoOpenDelay = Math.min(300, Math.max(0, Number.parseInt(autoOpenDelayStr, 10) || 10));
        const draftBefore = readChatWizardDraft(editKey || undefined);
        const inquiryOn = draftBefore.inquiryOn === true || normalizeWidgetInquiryOptions(draftBefore.inquiryOptions ?? []).length > 0;
        const launcherFromStep1 = resolveWizardLauncherPreview(prev);
        saveChatWizardDraft(editKey || undefined, {
          ...launcherFromStep1,
          buttonShape: launcherFromStep1.buttonShape,
          buttonPosition: launcherFromStep1.buttonPosition,
          launcherInsetBottomPx: launcherFromStep1.launcherInsetBottomPx,
          launcherInsetSidePx: launcherFromStep1.launcherInsetSidePx,
          buttonColor: launcherFromStep1.buttonColor,
          buttonHoverColor: launcherFromStep1.buttonHoverColor,
          iconColor: launcherFromStep1.iconColor,
          iconDataUrl: launcherFromStep1.iconDataUrl,
          launcherIconPreset: launcherFromStep1.launcherIconPreset,
          proactiveTeaserEnabled: prev.proactiveTeaserEnabled,
          proactiveTeaser: prev.proactiveTeaser,
          proactiveTeaserAvatarEnabled: prev.proactiveTeaserAvatarEnabled,
          proactiveTeaserAvatarDataUrl: prev.proactiveTeaserAvatarDataUrl,
          proactiveSecondaryCtaEnabled: prev.proactiveSecondaryCtaEnabled,
          proactiveSecondaryCtaLabel: prev.proactiveSecondaryCtaLabel,
          proactiveSecondaryCtaHref: prev.proactiveSecondaryCtaHref,
          proactiveSecondaryCtaKind: prev.proactiveSecondaryCtaKind,
          themeDesignJsonAccent: prev.themeDesignJsonAccent,
          themeDesignJsonDensity: prev.themeDesignJsonDensity,
          chatMode,
          aiType: shouldShowWidgetAiType(chatMode) ? aiType : undefined,
          allowedDomains: mergeDraftAllowedDomains(
            parseDomainListInput(allowedDomainsInput),
          ),
          browserNotification,
          soundNotification,
          notificationEnabled: browserNotification || soundNotification,
          fallbackNotificationText: fallbackText.trim() || "New message from support",
          videoWelcomeOn,
          videoWelcomeUrl: videoWelcomeUrl.trim(),
          botEnabled: chatMode === "AGENT_ONLY" ? false : botEnabled,
          inquiryOn,
          inquiryRequired: inquiryOn ? inquiryRequired : false,
          inquirySkipLabel: inquirySkipLabel.trim() || "General question",
          inquiryFallbackRoutingKey: draftBefore.inquiryFallbackRoutingKey?.trim() || undefined,
          inquiryOptions: inquiryOn
            ? normalizeWidgetInquiryOptions(draftBefore.inquiryOptions)
            : [],
          autoOpenEnabled,
          autoOpenOnReturnVisit,
          autoOpenDelaySeconds: autoOpenDelay,
          popupEnabled: autoOpenEnabled,
          notificationSoundId: normalizeWidgetSoundId(
            soundNotification ? notificationSoundId : "none",
          ),
          launcherBadgeMode: normalizeLauncherBadgeMode(launcherBadgeMode),
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
          responseTalkToAgentEnabled,
          responseTalkToAgentTriggerText: responseTalkToAgentTriggerText.trim() || "Talk to agent",
          motionEnabled,
          ...syncResponseCopyFromChatBox(prev),
        });
        const latest = readChatWizardDraft(editKey || undefined);
        const patchMeta = await patchRemoteWidgetConfigurationWithMeta({
          widgetKey: rk,
          widgetKind: "chat",
          draft: latest,
          publishNow: false,
          embedAllowAnyOrigin: false,
          chatWizardPatchScope: "notifications_only",
        });
        recordSave({
          stepKey: "notifications",
          stepLabel: "Step 3 — Notifications",
          method: patchMeta.method,
          path: patchMeta.path,
          scope: patchMeta.scope,
          publishNow: patchMeta.publishNow,
          requestBody: patchMeta.requestBody,
          responseBody: patchMeta.inner,
        });
        const sum = summarizePatchResult(patchMeta.inner);
        saveChatWizardDraft(editKey || undefined, {
          ...mergeWizardDraftForPublish(readChatWizardDraft(editKey || undefined)),
          requiresPublishBeforeEmbed: sum.requiresPublishBeforeEmbed,
        });
        setChecklistRefreshKey((k) => k + 1);
        router.push(
          withChatEditQuery(
            "/dashboard/chat-widget/add/chat/script",
            resolveEditWidgetKeyForNavigation(editKey) || rk,
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
            {saving ? "Saving…" : "Next: Install & publish"}
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
          <Stack spacing={2.5}>
            <WidgetWizardSiteChromePreview draft={chromeDraft} />
            <WidgetBehaviorLivePreview model={behaviorPreviewModel} />
          </Stack>
        }
      >
        <WidgetWizardStepGuide step="notifications" />
        <SchedulingSectionCard
          title="Notification settings"
          subtitle="Browser and sound alerts when the visitor tab is in the background."
        >
          <Box sx={notificationsFormStackSx}>
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
            {soundNotification ? (
              <SelectField
                label="Sound style"
                value={notificationSoundId}
                onChange={(v) =>
                  setNotificationSoundId(v as "soft" | "chime" | "ping" | "none")
                }
                options={[
                  { label: "Chime", value: "chime" },
                  { label: "Soft", value: "soft" },
                  { label: "Ping", value: "ping" },
                ]}
                searchable={false}
                menuMaxRows={4}
              />
            ) : null}
            <SelectField
              label="Launcher alert on new message"
              value={launcherBadgeMode}
              onChange={(v) => setLauncherBadgeMode(v as "count" | "dot" | "none")}
              options={[
                { label: "Count badge (1, 2, …)", value: "count" },
                { label: "Dot only", value: "dot" },
                { label: "Hidden", value: "none" },
              ]}
              searchable={false}
              menuMaxRows={4}
            />
            <WidgetTextField
              label="Fallback notification text"
              name="fallback"
              value={fallbackText}
              onChange={setFallbackText}
              maxLength={FIELD_MAX.title}
              helperText="Shown when a new message arrives in the background."
            />
          </Box>
        </SchedulingSectionCard>

        <SchedulingSectionCard
          title="Chat routing & Talk to agent"
          subtitle="Who replies first, embed domains, offline copy, and the Talk to agent button (Hybrid only)."
        >
          <Box sx={notificationsFormStackSx}>
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
              <WidgetAiTypeField value={aiType} onChange={setAiType} />
            ) : null}
            {chatMode === "HYBRID" ? (
              <Box sx={notificationsFieldGroupSx}>
                <WidgetWizardToggleRow
                  label="Show Talk to agent button"
                  description="Single handoff control in the chat composer area."
                  checked={responseTalkToAgentEnabled}
                  onChange={setresponseTalkToAgentEnabled}
                />
                {responseAgentHandoverEnabled ? (
                  <WidgetTextField
                    label="Talk to agent button label"
                    name="handover-label"
                    value={responseHandoverTriggerText}
                    onChange={setResponseHandoverTriggerText}
                    maxLength={FIELD_MAX.shortLabel}
                    placeholder="Talk to agent"
                  />
                ) : null}
              </Box>
            ) : null}
            <WidgetTextField
              label="Offline message"
              name="resp-offline"
              value={responseOfflineMessage}
              onChange={setResponseOfflineMessage}
              maxLength={FIELD_MAX.message}
              placeholder="We are offline; leave a message and we will reply."
              helperText="When no agent is available on the site."
            />
            <WidgetDomainListField
              label="Allowed website domains"
              name="allowed-domains"
              value={allowedDomainsInput}
              onChange={setAllowedDomainsInput}
              helperText="Where the embed may load — hostnames only (not full page URLs)."
            />
          </Box>
        </SchedulingSectionCard>

        <SchedulingSectionCard
          title="Widget behavior"
          subtitle="Bot, inquiry pills, and auto-open."
        >
          <Box sx={notificationsFormStackSx}>
          {chatMode !== "AGENT_ONLY" ? (
            <WidgetWizardToggleRow
              label="AI bot enabled"
              description="Turn off to stop automatic AI replies (Hybrid / AI only)."
              checked={botEnabled}
              onChange={setBotEnabled}
            />
          ) : (
            <Typography variant="caption" sx={{ color: theme.app.dashboard.textMuted, display: "block" }}>
              Agent-only mode — live agents reply; AI bot is off.
            </Typography>
          )}
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted }}>
            Inquiry topic pills:{" "}
            <strong>{inquiryOnFromDraft ? "On" : "Off"}</strong>
            {inquiryOnFromDraft
              ? ` (${inquiryOptionsList.length} topic${inquiryOptionsList.length === 1 ? "" : "s"}${inquiryOptionsList.length ? `: ${inquiryOptionsList.join(", ")}` : ""})`
              : ""}
            . Edit topics and fallback on{" "}
            <Box
              component={Link}
              href={withChatEditQuery(
                "/dashboard/chat-widget/add/chat/box",
                resolveEditWidgetKeyForNavigation(editWidgetKey),
              )}
              sx={{ color: theme.palette.primary.light, fontWeight: 600 }}
            >
              Chat Box Design
            </Box>
            .
          </Typography>
          {inquiryOnFromDraft ? (
            <Box sx={notificationsFieldGroupSx}>
              <WidgetWizardToggleRow
                label="Require topic selection"
                description="When off, visitors can use the general fallback topic (routes via fallback department)."
                checked={inquiryRequired}
                onChange={setInquiryRequired}
              />
              <WidgetTextField
                label="Skip / general topic label"
                name="inquiry-skip-label"
                value={inquirySkipLabel}
                onChange={setInquirySkipLabel}
                maxLength={FIELD_MAX.shortLabel}
              />
            </Box>
          ) : null}
          <WidgetWizardToggleRow label="Auto-open widget" checked={autoOpenEnabled} onChange={setAutoOpenEnabled} />
          <WidgetWizardToggleRow
            label="Auto-open on return visits"
            description="When off, auto-open runs only the first time this browser sees the widget."
            checked={autoOpenOnReturnVisit}
            onChange={setAutoOpenOnReturnVisit}
          />
          <WidgetNumericField
            label="Auto-open delay (seconds)"
            name="auto-open-delay"
            value={autoOpenDelayStr}
            onChange={setAutoOpenDelayStr}
            min={0}
            max={300}
          />
          <WidgetWizardToggleRow
            label="Subtle animations"
            description="Teaser slide-in and panel open transition on the live embed."
            checked={motionEnabled}
            onChange={setMotionEnabled}
          />
          </Box>
        </SchedulingSectionCard>

        <SchedulingSectionCard
          title="Video welcome"
          subtitle="Optional YouTube or Vimeo link before chat."
        >
          <Box sx={notificationsFormStackSx}>
            <WidgetWizardToggleRow
              label="Show video welcome"
              checked={videoWelcomeOn}
              onChange={setVideoWelcomeOn}
            />
            {videoWelcomeOn ? (
              <WidgetUrlField
                label="Video URL (YouTube / Vimeo)"
                name="video-welcome-url"
                value={videoWelcomeUrl}
                onChange={setVideoWelcomeUrl}
                videoEmbed
                helperText="One embed link — shown before chat starts."
              />
            ) : null}
          </Box>
        </SchedulingSectionCard>

        <SchedulingSectionCard
          title="Visitor form"
          subtitle="Collect visitor details before chat starts. Greeting and chat copy stay on Chat Box Design."
        >
          <Box sx={notificationsFormStackSx}>
          <WidgetWizardToggleRow label="Form enabled" checked={formEnabled} onChange={setFormEnabled} />
          <WidgetTextField label="Form title" name="form-title" value={formTitle} onChange={setFormTitle} maxLength={FIELD_MAX.title} />
          <WidgetTextField
            label="Form subtitle"
            name="form-subtitle"
            value={formSubtitle}
            onChange={setFormSubtitle}
            maxLength={FIELD_MAX.message}
          />
          <WidgetTextField
            label="Start chat button label"
            name="form-submit"
            value={formSubmitLabel}
            onChange={setFormSubmitLabel}
            maxLength={FIELD_MAX.shortLabel}
          />
          <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 0.5 }}>
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
          <WidgetWizardToggleRow
            label="Consent required"
            checked={consentRequired}
            onChange={setConsentRequired}
          />
          {consentRequired ? (
            <Box sx={notificationsFieldGroupSx}>
              <WidgetTextField
                label="Consent text"
                name="consent-text"
                value={consentText}
                onChange={setConsentText}
                maxLength={FIELD_MAX.message}
              />
              <WidgetUrlField
                label="Privacy policy URL"
                name="privacy-url"
                value={privacyPolicyUrl}
                onChange={setPrivacyPolicyUrl}
                helperText="Link opened from the consent checkbox."
              />
            </Box>
          ) : null}
          </Box>
        </SchedulingSectionCard>
      </WidgetWizardPageLayout>
    </WidgetFlowShell>
  );
}
