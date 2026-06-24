"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  resolveWizardKindFromDraft,
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
import { WidgetWizardToggleRow } from "@/features/chat-widget/components/WidgetWizardToggleRow";
import { SchedulingSectionCard } from "@/features/website-assignments/components/ServiceSchedulingSections";
import { readWidgetChatColorsFromDraft } from "@/lib/chat-widget/widget-colors-draft";
import { WidgetAiTypeField } from "@/components/dashboard/chat-widget/WidgetAiTypeField";
import { syncResponseCopyFromChatBox } from "@/lib/chat-widget/sync-response-copy-from-chat-box";
import {
  notificationsFieldGroupSx,
  notificationsFormStackSx,
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
} from "@/lib/chat-widget/widget-field-validation";
import {
  normalizeLauncherBadgeMode,
  normalizeWidgetSoundId,
} from "@/lib/widget-runtime/widget-notifications";
import { useWizardLauncherChrome } from "@/lib/chat-widget/use-wizard-launcher-preview";
import { resolveWizardLauncherPreview } from "@/lib/chat-widget/widget-wizard-save-trace";
import { useWizardStepFlush } from "@/lib/chat-widget/widget-wizard-step-flush";
import { WidgetInquiryOptionsEditor } from "@/components/dashboard/chat-widget/WidgetInquiryOptionsEditor";
import { useInquiryTopicsForWebsite } from "@/lib/chat-widget/use-inquiry-topics-for-website";
import {
  isWidgetInquiryOptionConfigured,
  validateVisitorTopicsForSave,
} from "@/lib/chat-widget/visitor-topics.mapper";
import {
  normalizeWidgetInquiryOptions,
  type WidgetInquiryOption,
} from "@/lib/chat-widget/widget-inquiry.types";

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
  const [offlineFormEnabled, setOfflineFormEnabled] = useState(d0.offlineFormEnabled ?? true);
  const [offlineFormTitle, setOfflineFormTitle] = useState(d0.offlineFormTitle ?? "");
  const [offlineFormSubtitle, setOfflineFormSubtitle] = useState(d0.offlineFormSubtitle ?? "");
  const [offlineFormSubmitLabel, setOfflineFormSubmitLabel] = useState(d0.offlineFormSubmitLabel ?? "");
  const [offlinePrechatNameEnabled, setOfflinePrechatNameEnabled] = useState(
    d0.offlinePrechatNameEnabled ?? true,
  );
  const [offlinePrechatEmailEnabled, setOfflinePrechatEmailEnabled] = useState(
    d0.offlinePrechatEmailEnabled ?? true,
  );
  const [offlinePrechatPhoneEnabled, setOfflinePrechatPhoneEnabled] = useState(
    d0.offlinePrechatPhoneEnabled ?? false,
  );
  const [offlinePrechatMessageEnabled, setOfflinePrechatMessageEnabled] = useState(
    d0.offlinePrechatMessageEnabled ?? true,
  );
  const [offlinePrechatMessageRequired, setOfflinePrechatMessageRequired] = useState(
    d0.offlinePrechatMessageRequired ?? true,
  );
  const [responseOfflineMessage, setResponseOfflineMessage] = useState(d0.responseOfflineMessage ?? "");
  const [responseTalkToAgentEnabled, setresponseTalkToAgentEnabled] = useState(
    d0.responseTalkToAgentEnabled ?? true,
  );
  const [responseTalkToAgentTriggerText, setresponseTalkToAgentTriggerText] = useState(
    d0.responseTalkToAgentTriggerText ?? "Talk to agent",
  );
  const [inquiryOn, setInquiryOn] = useState(d0.inquiryOn ?? false);
  const [inquiryRequired, setInquiryRequired] = useState(d0.inquiryRequired ?? false);
  const [inquirySkipLabel, setInquirySkipLabel] = useState(d0.inquirySkipLabel ?? "General question");
  const [inquiryFallbackRoutingKey, setInquiryFallbackRoutingKey] = useState(
    d0.inquiryFallbackRoutingKey ?? "",
  );
  const [inquiryOptions, setInquiryOptions] = useState<WidgetInquiryOption[]>(
    normalizeWidgetInquiryOptions(d0.inquiryOptions ?? []),
  );

  const websiteId = useMemo(() => {
    void checklistRefreshKey;
    if (!draftReady) return "";
    const d = readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined);
    return d.websiteId?.trim() ?? "";
  }, [draftReady, editWidgetKey, checklistRefreshKey]);

  const { topicsFromScheduling, isLoading: inquiryTopicsLoading, loadedFromScheduling } =
    useInquiryTopicsForWebsite(websiteId, draftReady);

  useEffect(() => {
    if (!draftReady) return;
    const d = readChatWizardDraft(resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined);
    const def = defaultWidgetDraft;
    setChatMode(d.chatMode ?? "HYBRID");
    setAiType(normalizeWidgetAiType(d.aiType));
    const adArr = Array.isArray(d.allowedDomains) ? d.allowedDomains : (def.allowedDomains ?? []);
    setAllowedDomainsInput(adArr.join(", "));
    setBrowserNotification(d.browserNotification ?? def.browserNotification ?? true);
    setSoundNotification(d.soundNotification ?? def.soundNotification ?? false);
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
    setOfflineFormEnabled(d.offlineFormEnabled ?? def.offlineFormEnabled ?? true);
    setOfflineFormTitle(d.offlineFormTitle ?? def.offlineFormTitle ?? "");
    setOfflineFormSubtitle(d.offlineFormSubtitle ?? def.offlineFormSubtitle ?? "");
    setOfflineFormSubmitLabel(d.offlineFormSubmitLabel ?? def.offlineFormSubmitLabel ?? "");
    setOfflinePrechatNameEnabled(d.offlinePrechatNameEnabled ?? def.offlinePrechatNameEnabled ?? true);
    setOfflinePrechatEmailEnabled(d.offlinePrechatEmailEnabled ?? def.offlinePrechatEmailEnabled ?? true);
    setOfflinePrechatPhoneEnabled(d.offlinePrechatPhoneEnabled ?? def.offlinePrechatPhoneEnabled ?? false);
    setOfflinePrechatMessageEnabled(
      d.offlinePrechatMessageEnabled ?? def.offlinePrechatMessageEnabled ?? true,
    );
    setOfflinePrechatMessageRequired(
      d.offlinePrechatMessageRequired ?? def.offlinePrechatMessageRequired ?? true,
    );
    setResponseOfflineMessage(d.responseOfflineMessage ?? def.responseOfflineMessage ?? "");
    setresponseTalkToAgentEnabled(d.responseTalkToAgentEnabled ?? def.responseTalkToAgentEnabled ?? true);
    setMotionEnabled(d.motionEnabled !== false);
    setresponseTalkToAgentTriggerText(
      d.responseTalkToAgentTriggerText ?? def.responseTalkToAgentTriggerText ?? "Talk to agent",
    );
    const fromDraft = normalizeWidgetInquiryOptions(d.inquiryOptions ?? []);
    setInquiryOn(d.inquiryOn ?? false);
    setInquiryRequired(d.inquiryRequired ?? false);
    setInquirySkipLabel(d.inquirySkipLabel ?? def.inquirySkipLabel ?? "General question");
    setInquiryFallbackRoutingKey(d.inquiryFallbackRoutingKey ?? "");
    if (fromDraft.length > 0) {
      setInquiryOptions(fromDraft);
    } else if (topicsFromScheduling.length > 0) {
      setInquiryOptions(topicsFromScheduling);
    } else {
      setInquiryOptions([]);
    }
  }, [draftReady, editWidgetKey, checklistRefreshKey, topicsFromScheduling]);

  const stepStateRef = useRef({
    draftReady,
    editWidgetKey,
    chatMode,
    aiType,
    allowedDomainsInput,
    browserNotification,
    soundNotification,
    fallbackText,
    motionEnabled,
    botEnabled,
    autoOpenEnabled,
    autoOpenOnReturnVisit,
    autoOpenDelayStr,
    notificationSoundId,
    launcherBadgeMode,
    consentRequired,
    consentText,
    privacyPolicyUrl,
    formEnabled,
    formTitle,
    formSubtitle,
    formSubmitLabel,
    prechatNameEnabled,
    prechatEmailEnabled,
    prechatPhoneEnabled,
    prechatMessageEnabled,
    prechatMessageRequired,
    offlineFormEnabled,
    offlineFormTitle,
    offlineFormSubtitle,
    offlineFormSubmitLabel,
    offlinePrechatNameEnabled,
    offlinePrechatEmailEnabled,
    offlinePrechatPhoneEnabled,
    offlinePrechatMessageEnabled,
    offlinePrechatMessageRequired,
    responseOfflineMessage,
    responseTalkToAgentEnabled,
    responseTalkToAgentTriggerText,
    inquiryOn,
    inquiryRequired,
    inquirySkipLabel,
    inquiryFallbackRoutingKey,
    inquiryOptions,
  });
  stepStateRef.current = {
    draftReady,
    editWidgetKey,
    chatMode,
    aiType,
    allowedDomainsInput,
    browserNotification,
    soundNotification,
    fallbackText,
    motionEnabled,
    botEnabled,
    autoOpenEnabled,
    autoOpenOnReturnVisit,
    autoOpenDelayStr,
    notificationSoundId,
    launcherBadgeMode,
    consentRequired,
    consentText,
    privacyPolicyUrl,
    formEnabled,
    formTitle,
    formSubtitle,
    formSubmitLabel,
    prechatNameEnabled,
    prechatEmailEnabled,
    prechatPhoneEnabled,
    prechatMessageEnabled,
    prechatMessageRequired,
    offlineFormEnabled,
    offlineFormTitle,
    offlineFormSubtitle,
    offlineFormSubmitLabel,
    offlinePrechatNameEnabled,
    offlinePrechatEmailEnabled,
    offlinePrechatPhoneEnabled,
    offlinePrechatMessageEnabled,
    offlinePrechatMessageRequired,
    responseOfflineMessage,
    responseTalkToAgentEnabled,
    responseTalkToAgentTriggerText,
    inquiryOn,
    inquiryRequired,
    inquirySkipLabel,
    inquiryFallbackRoutingKey,
    inquiryOptions,
  };

  const flushStepToDraft = useCallback(() => {
    const s = stepStateRef.current;
    if (!s.draftReady) return;
    const editKey = resolveEditWidgetKeyForNavigation(s.editWidgetKey);
    const prev = readChatWizardDraft(editKey || undefined);
    const autoOpenDelay = Math.min(300, Math.max(0, Number.parseInt(s.autoOpenDelayStr, 10) || 10));
    saveChatWizardDraft(editKey || undefined, {
      type: prev.type,
      chatMode: s.chatMode,
      aiType: shouldShowWidgetAiType(s.chatMode) ? s.aiType : undefined,
      allowedDomains: mergeDraftAllowedDomains(parseDomainListInput(s.allowedDomainsInput)),
      browserNotification: s.browserNotification,
      soundNotification: s.soundNotification,
      notificationEnabled: s.browserNotification || s.soundNotification,
      fallbackNotificationText: s.fallbackText.trim() || "New message from support",
      botEnabled: s.chatMode === "AGENT_ONLY" ? false : s.botEnabled,
      inquiryOn: s.inquiryOn,
      inquiryRequired: s.inquiryOn ? s.inquiryRequired : false,
      inquirySkipLabel: s.inquirySkipLabel.trim() || "General question",
      inquiryFallbackRoutingKey:
        s.inquiryOn && s.inquiryFallbackRoutingKey.trim()
          ? s.inquiryFallbackRoutingKey.trim()
          : undefined,
      inquiryOptions: s.inquiryOn ? s.inquiryOptions : [],
      autoOpenEnabled: s.autoOpenEnabled,
      autoOpenOnReturnVisit: s.autoOpenOnReturnVisit,
      autoOpenDelaySeconds: autoOpenDelay,
      popupEnabled: s.autoOpenEnabled,
      notificationSoundId: normalizeWidgetSoundId(
        s.soundNotification ? s.notificationSoundId : "none",
      ),
      launcherBadgeMode: normalizeLauncherBadgeMode(s.launcherBadgeMode),
      consentRequired: s.consentRequired,
      consentText: s.consentText.trim(),
      privacyPolicyUrl: s.privacyPolicyUrl.trim(),
      formEnabled: s.formEnabled,
      formTitle: s.formTitle.trim(),
      formSubtitle: s.formSubtitle.trim(),
      formSubmitLabel: s.formSubmitLabel.trim(),
      prechatNameEnabled: s.prechatNameEnabled,
      prechatEmailEnabled: s.prechatEmailEnabled,
      prechatPhoneEnabled: s.prechatPhoneEnabled,
      prechatMessageEnabled: s.prechatMessageEnabled,
      prechatMessageRequired: s.prechatMessageRequired,
      offlineFormEnabled: s.offlineFormEnabled,
      offlineFormTitle: s.offlineFormTitle.trim(),
      offlineFormSubtitle: s.offlineFormSubtitle.trim(),
      offlineFormSubmitLabel: s.offlineFormSubmitLabel.trim(),
      offlinePrechatNameEnabled: s.offlinePrechatNameEnabled,
      offlinePrechatEmailEnabled: s.offlinePrechatEmailEnabled,
      offlinePrechatPhoneEnabled: s.offlinePrechatPhoneEnabled,
      offlinePrechatMessageEnabled: s.offlinePrechatMessageEnabled,
      offlinePrechatMessageRequired: s.offlinePrechatMessageRequired,
      responseOfflineMessage: s.responseOfflineMessage.trim(),
      responseTalkToAgentEnabled: s.responseTalkToAgentEnabled,
      responseTalkToAgentTriggerText: s.responseTalkToAgentTriggerText.trim() || "Talk to agent",
      motionEnabled: s.motionEnabled,
      ...syncResponseCopyFromChatBox(prev),
    });
  }, []);

  useWizardStepFlush(flushStepToDraft);

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
      inquiryOn: inquiryOn && inquiryOptions.some(isWidgetInquiryOptionConfigured),
      inquiryOptions: inquiryOptions.map((o) => o.label).filter(Boolean),
      talkToAgentEnabled: responseTalkToAgentEnabled,
      talkToAgentTriggerText: responseTalkToAgentTriggerText.trim(),
      greetingMessage: (draft.greetingMessage ?? defaultWidgetDraft.greetingMessage) || "",
      firstMessage: (draft.firstMessage ?? defaultWidgetDraft.firstMessage) || "",
      sendPlaceholder:
        draft.sendPlaceholder?.trim() ||
        draft.messagePlaceholder?.trim() ||
        defaultWidgetDraft.sendPlaceholder ||
        "",
      headerTitle: draft.headerTitle ?? "",
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
    responseTalkToAgentEnabled,
    responseTalkToAgentTriggerText,
    responseOfflineMessage,
    inquiryOn,
    inquiryOptions,
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
      if (inquiryOn) {
        const configured = inquiryOptions.filter(isWidgetInquiryOptionConfigured);
        if (configured.length === 0) {
          publishAppToast({
            variant: "error",
            message: "Add at least one inquiry topic with a label and external department.",
          });
          return;
        }
        const topicErr = validateVisitorTopicsForSave(configured);
        if (topicErr) {
          publishAppToast({ variant: "error", message: topicErr });
          return;
        }
      }

      setSaving(true);
      try {
        const autoOpenDelay = Math.min(300, Math.max(0, Number.parseInt(autoOpenDelayStr, 10) || 10));
        const draftBefore = readChatWizardDraft(editKey || undefined);
        const launcherFromStep1 = resolveWizardLauncherPreview(prev);
        saveChatWizardDraft(editKey || undefined, {
          type: prev.type,
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
          closedMessagePreviewEnabled: prev.closedMessagePreviewEnabled,
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
          videoWelcomeOn: draftBefore.videoWelcomeOn ?? false,
          videoWelcomeUrl: draftBefore.videoWelcomeUrl?.trim() ?? "",
          botEnabled: chatMode === "AGENT_ONLY" ? false : botEnabled,
          inquiryOn,
          inquiryRequired: inquiryOn ? inquiryRequired : false,
          inquirySkipLabel: inquirySkipLabel.trim() || "General question",
          inquiryFallbackRoutingKey:
            inquiryOn && inquiryFallbackRoutingKey.trim()
              ? inquiryFallbackRoutingKey.trim()
              : undefined,
          inquiryOptions: inquiryOn ? inquiryOptions : [],
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
          offlineFormEnabled,
          offlineFormTitle: offlineFormTitle.trim(),
          offlineFormSubtitle: offlineFormSubtitle.trim(),
          offlineFormSubmitLabel: offlineFormSubmitLabel.trim(),
          offlinePrechatNameEnabled,
          offlinePrechatEmailEnabled,
          offlinePrechatPhoneEnabled,
          offlinePrechatMessageEnabled,
          offlinePrechatMessageRequired,
          responseOfflineMessage: responseOfflineMessage.trim(),
          responseTalkToAgentEnabled,
          responseTalkToAgentTriggerText: responseTalkToAgentTriggerText.trim() || "Talk to agent",
          motionEnabled,
          ...syncResponseCopyFromChatBox(prev),
        });
        const latest = readChatWizardDraft(editKey || undefined);
        const patchMeta = await patchRemoteWidgetConfigurationWithMeta({
          widgetKey: rk,
          widgetKind: resolveWizardKindFromDraft(latest),
          draft: latest,
          publishNow: false,
          embedAllowAnyOrigin: latest.embedAllowAnyOrigin ?? false,
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
        const mergedForPublish = mergeWizardDraftForPublish(readChatWizardDraft(editKey || undefined));
        saveChatWizardDraft(editKey || undefined, {
          ...mergedForPublish,
          type: prev.type ?? mergedForPublish.type,
          requiresPublishBeforeEmbed: sum.requiresPublishBeforeEmbed,
        });
        setChecklistRefreshKey((k) => k + 1);
        const latestAfter = readChatWizardDraft(editKey || undefined);
        const nextPath =
          latestAfter.type === "both"
            ? "/dashboard/chat-widget/add/text"
            : "/dashboard/chat-widget/add/chat/script";
        router.push(
          withChatEditQuery(
            nextPath,
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

  const notificationsDraft = readChatWizardDraft(
    resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined,
  );
  const notificationsNextLabel =
    notificationsDraft.type === "both" ? "Next: Text Us" : "Next: Install";

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
            {saving ? "Saving…" : notificationsNextLabel}
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
                {responseTalkToAgentEnabled ? (
                  <WidgetTextField
                    label="Talk to agent button label"
                    name="handover-label"
                    value={responseTalkToAgentTriggerText}
                    onChange={setresponseTalkToAgentTriggerText}
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
            <WidgetWizardToggleRow
              label="Inquiry topic pills"
              description="Optional pills on the pre-chat form so visitors pick a topic before chat."
              checked={inquiryOn}
              onChange={setInquiryOn}
            />
            {inquiryOn ? (
              <Box sx={notificationsFieldGroupSx}>
                <WidgetWizardToggleRow
                  label="Require topic selection"
                  description="When off, visitors can skip with a general routing option."
                  checked={inquiryRequired}
                  onChange={setInquiryRequired}
                />
                {!inquiryRequired ? (
                  <WidgetTextField
                    label="Skip button label"
                    name="inquiry-skip-label"
                    value={inquirySkipLabel}
                    onChange={setInquirySkipLabel}
                    maxLength={FIELD_MAX.shortLabel}
                    placeholder="General question"
                  />
                ) : null}
                <WidgetInquiryOptionsEditor
                  websiteId={websiteId}
                  value={inquiryOptions}
                  onChange={setInquiryOptions}
                  topicsLoading={inquiryTopicsLoading}
                  loadedFromScheduling={loadedFromScheduling}
                  inquiryFallbackRoutingKey={inquiryFallbackRoutingKey}
                  onFallbackRoutingKeyChange={setInquiryFallbackRoutingKey}
                  externalDeptOnly
                  widgetKey={
                    resolveRemoteWidgetKeyForChatWizard(
                      resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined,
                      readChatWizardDraft(
                        resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined,
                      ),
                    ) ?? undefined
                  }
                  getDraftForWidgetSync={() => {
                    const editKey = resolveEditWidgetKeyForNavigation(editWidgetKey);
                    const base = readChatWizardDraft(editKey || undefined);
                    return {
                      ...base,
                      inquiryOn,
                      inquiryRequired,
                      inquirySkipLabel,
                      inquiryFallbackRoutingKey,
                      inquiryOptions,
                    };
                  }}
                  onSaved={(rows) => {
                    setInquiryOptions(rows);
                    saveChatWizardDraft(
                      resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined,
                      {
                        ...readChatWizardDraft(
                          resolveEditWidgetKeyForNavigation(editWidgetKey) || undefined,
                        ),
                        inquiryOn: true,
                        inquiryOptions: rows,
                      },
                    );
                    setChecklistRefreshKey((k) => k + 1);
                  }}
                />
              </Box>
            ) : null}
          </Box>
        </SchedulingSectionCard>

        <SchedulingSectionCard
          title="Widget behavior"
          subtitle="Bot and auto-open."
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

        <SchedulingSectionCard
          title="Offline form"
          subtitle="Shown in Agent-only mode when no agent is available. Submissions appear in Chat Monitor."
        >
          <Box sx={notificationsFormStackSx}>
            <WidgetWizardToggleRow
              label="Show offline form"
              description="When off, visitors only see the offline message with no form."
              checked={offlineFormEnabled}
              onChange={setOfflineFormEnabled}
            />
            <WidgetTextField
              label="Form title"
              name="offline-form-title"
              value={offlineFormTitle}
              onChange={setOfflineFormTitle}
              maxLength={FIELD_MAX.title}
            />
            <WidgetTextField
              label="Form subtitle"
              name="offline-form-subtitle"
              value={offlineFormSubtitle}
              onChange={setOfflineFormSubtitle}
              maxLength={FIELD_MAX.message}
            />
            <WidgetTextField
              label="Submit button label"
              name="offline-form-submit"
              value={offlineFormSubmitLabel}
              onChange={setOfflineFormSubmitLabel}
              maxLength={FIELD_MAX.shortLabel}
            />
            <Typography variant="body2" sx={{ color: theme.app.dashboard.textMuted, mb: 0.5 }}>
              Fields to show when offline
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {[
                ["Name", offlinePrechatNameEnabled, setOfflinePrechatNameEnabled] as const,
                ["Email", offlinePrechatEmailEnabled, setOfflinePrechatEmailEnabled] as const,
                ["Phone", offlinePrechatPhoneEnabled, setOfflinePrechatPhoneEnabled] as const,
                ["Message", offlinePrechatMessageEnabled, setOfflinePrechatMessageEnabled] as const,
                [
                  "Message required",
                  offlinePrechatMessageRequired,
                  setOfflinePrechatMessageRequired,
                ] as const,
              ].map(([label, val, setter]) => (
                <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Switch checked={val} onChange={(_, c) => setter(c)} color="success" />
                  <Typography variant="medium" sx={{ color: theme.app.dashboard.textMuted }}>
                    {label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </SchedulingSectionCard>
      </WidgetWizardPageLayout>
    </WidgetFlowShell>
  );
}
