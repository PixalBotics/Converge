import type { JsonRecord } from "@/api/types/common.types";
import type {
  WidgetChatModeApi,
  WidgetTypeApi,
} from "@/api/types/widgets.types";
import { CHAT_WIZARD_PATCH_DEFAULTS } from "./chat-wizard-patch-defaults";
import type { TextUsFormFieldDraft, WidgetDraft } from "./widgetDraft";

export interface WidgetInstallationAssetUrls {
  buttonIconPublicUrl?: string;
  bannerImagePublicUrl?: string;
  bannerVideoPublicUrl?: string;
}

const defaultTextUsFormFields = (): JsonRecord[] => [
  { key: "name", label: "Name", fieldType: "text", required: true },
  { key: "email", label: "Email", fieldType: "email", required: true },
  { key: "message", label: "Message", fieldType: "textarea", required: false },
  { key: "phone", label: "Phone", fieldType: "phone", required: false },
];

/** Chat panel body under `theme.designJson.chat.chatBox` (text, sizing, banner flags, optional media URLs). */
function buildChatBoxPayloadFromDraft(
  draft: WidgetDraft,
  assetUrls?: WidgetInstallationAssetUrls,
): JsonRecord {
  const chatBox: JsonRecord = {
    headerTitle: draft.headerTitle,
    headerAlign: draft.headerTitleAlign,
    greetingMessage: draft.greetingMessage,
    sendPlaceholder: draft.sendPlaceholder,
    boxWidth: draft.boxWidth,
    boxHeight: draft.boxHeight,
    bannerEnabled: draft.bannerOn,
    bannerTitle: draft.bannerTitle,
    bannerDescription: draft.bannerDescription,
    bannerMediaType: draft.bannerMediaType,
  };

  if (assetUrls?.bannerImagePublicUrl) chatBox.bannerImageUrl = assetUrls.bannerImagePublicUrl;
  if (assetUrls?.bannerVideoPublicUrl) chatBox.bannerVideoUrl = assetUrls.bannerVideoPublicUrl;

  return chatBox;
}

/** Full `theme.designJson.chat` (launcher + chat box + colors) from draft — used by install + final publish PATCH. */
export function buildChatDesignJsonFromDraft(
  draft: WidgetDraft,
  assetUrls?: WidgetInstallationAssetUrls,
): JsonRecord {
  const chatLauncher: JsonRecord = {
    shape: draft.buttonShape,
    position: draft.buttonPosition,
    insetBottomPx: draft.launcherInsetBottomPx,
    insetSidePx: draft.launcherInsetSidePx,
    iconPreset: draft.launcherIconPreset,
  };

  if (assetUrls?.buttonIconPublicUrl) chatLauncher.iconUrl = assetUrls.buttonIconPublicUrl;

  return {
    launcher: chatLauncher,
    chatBox: buildChatBoxPayloadFromDraft(draft, assetUrls),
    colors: {
      button: draft.buttonColor,
      buttonHover: draft.buttonHoverColor,
      icon: draft.iconColor,
      headerText: draft.textColor,
    },
  };
}

/** Wizard step 2 (chat box UI): only `chatBox` — launcher + FAB `colors` were sent in step 1. */
export function buildChatBoxOnlyDesignJson(
  draft: WidgetDraft,
  assetUrls?: WidgetInstallationAssetUrls,
): JsonRecord {
  return { chatBox: buildChatBoxPayloadFromDraft(draft, assetUrls) };
}

/** Wizard step 1 (button): only launcher + FAB colors — no chat box, no chatMode, no empty config shells. */
export function buildLauncherOnlyChatDesignJson(
  draft: WidgetDraft,
  assetUrls?: WidgetInstallationAssetUrls,
): JsonRecord {
  const chatLauncher: JsonRecord = {
    shape: draft.buttonShape,
    position: draft.buttonPosition,
    insetBottomPx: draft.launcherInsetBottomPx,
    insetSidePx: draft.launcherInsetSidePx,
    iconPreset: draft.launcherIconPreset,
  };
  if (assetUrls?.buttonIconPublicUrl) chatLauncher.iconUrl = assetUrls.buttonIconPublicUrl;

  return {
    launcher: chatLauncher,
    colors: {
      button: draft.buttonColor,
      buttonHover: draft.buttonHoverColor,
      icon: draft.iconColor,
    },
  };
}

function themeButtonShapeForPatch(draft: WidgetDraft): string {
  if (draft.buttonShape === "rounded") return "rounded";
  if (draft.buttonShape === "square") return "square";
  return "circle";
}

/** Step 1 PATCH `config`: full `theme` envelope + `designJson.chat` launcher only. */
export function buildChatWizardStep1Config(
  draft: WidgetDraft,
  assetUrls?: WidgetInstallationAssetUrls,
): JsonRecord {
  const def = CHAT_WIZARD_PATCH_DEFAULTS;
  const chat = buildLauncherOnlyChatDesignJson(draft, assetUrls);
  const primary = draft.themePrimaryColor ?? draft.buttonColor ?? "#2563eb";
  return {
    theme: {
      name: draft.themeName ?? def.themeName,
      primaryColor: primary,
      secondaryColor: draft.themeSecondaryColor ?? def.themeSecondaryColor,
      buttonHoverColor: draft.buttonHoverColor,
      iconColor: draft.iconColor,
      textColor: draft.textColor,
      fontFamily: draft.themeFontFamily ?? def.themeFontFamily,
      bubbleStyle: draft.themeBubbleStyle ?? def.themeBubbleStyle,
      buttonShape: themeButtonShapeForPatch(draft),
      position: draft.buttonPosition,
      borderRadiusPx: draft.themeBorderRadiusPx ?? def.themeBorderRadiusPx,
      welcomeFontSizePx: draft.themeWelcomeFontSizePx ?? def.themeWelcomeFontSizePx,
      bodyFontSizePx: draft.themeBodyFontSizePx ?? def.themeBodyFontSizePx,
      inputFontSizePx: draft.themeInputFontSizePx ?? def.themeInputFontSizePx,
      ctaFontSizePx: draft.themeCtaFontSizePx ?? def.themeCtaFontSizePx,
      consentFontSizePx: draft.themeConsentFontSizePx ?? def.themeConsentFontSizePx,
      lineHeightPx: draft.themeLineHeightPx ?? def.themeLineHeightPx,
      designJson: {
        accent: draft.themeDesignJsonAccent ?? def.designJsonAccent,
        density: draft.themeDesignJsonDensity ?? def.designJsonDensity,
        chat,
      },
    },
  };
}

/** Step 2 PATCH `config`: `theme.designJson.chat` (chatBox + header text color) + `config.ui` chat shell. */
export function buildChatWizardStep2Config(
  draft: WidgetDraft,
  assetUrls?: WidgetInstallationAssetUrls,
): JsonRecord {
  const def = CHAT_WIZARD_PATCH_DEFAULTS;
  const chatBox = buildChatBoxPayloadFromDraft(draft, assetUrls);
  const headerAlign = (draft.headerTitleAlign ?? "Center").toLowerCase();
  const ui: JsonRecord = {
    buttonLabel: draft.buttonLabel ?? def.buttonLabel,
    buttonShape: draft.buttonShape,
    buttonPosition: draft.buttonPosition,
    launcherInsetBottomPx: draft.launcherInsetBottomPx,
    launcherInsetSidePx: draft.launcherInsetSidePx,
    buttonHoverColor: draft.buttonHoverColor,
    headerTitle: draft.headerTitle,
    headerTitleAlign: headerAlign,
    header: { align: headerAlign, companyName: draft.headerTitle },
    firstMessage: draft.firstMessage ?? def.firstMessage,
    greetingMessage: draft.greetingMessage,
    sendPlaceholder: draft.sendPlaceholder,
    messagePlaceholder: draft.messagePlaceholder ?? def.messagePlaceholder,
    bannerOn: draft.bannerOn,
    bannerEnabled: draft.bannerOn,
    bannerTitle: draft.bannerTitle,
    bannerDescription: draft.bannerDescription,
    bannerMediaType: draft.bannerMediaType,
    backgroundImageUrl: "",
    backgroundColor: draft.backgroundColor ?? def.backgroundColor,
    boxWidth: draft.boxWidth,
    boxHeight: draft.boxHeight,
    width: draft.boxWidth,
    height: draft.boxHeight,
    popupEnabled: draft.popupEnabled ?? def.popupEnabled,
    launcherIconPreset: draft.launcherIconPreset || "phosphor-chat-dots",
  };
  if (assetUrls?.buttonIconPublicUrl) ui.buttonIconUrl = assetUrls.buttonIconPublicUrl;
  if (assetUrls?.bannerImagePublicUrl) ui.bannerImageUrl = assetUrls.bannerImagePublicUrl;
  if (assetUrls?.bannerVideoPublicUrl) ui.bannerVideoUrl = assetUrls.bannerVideoPublicUrl;

  return {
    theme: {
      designJson: {
        chat: {
          chatBox,
          colors: { headerText: draft.textColor ?? "#0f172a" },
        },
      },
    },
    ui,
  };
}

/** Step 3 PATCH `config`: routing, domains, behavior, session, form, response. */
export function buildChatWizardStep3Config(draft: WidgetDraft): JsonRecord {
  const def = CHAT_WIZARD_PATCH_DEFAULTS;
  const config: JsonRecord = {
    chatMode: (draft.chatMode ?? "HYBRID") as WidgetChatModeApi,
    behavior: {
      botEnabled: draft.botEnabled ?? def.botEnabled,
      notificationEnabled: draft.notificationEnabled ?? def.notificationEnabled,
      browserNotification: draft.browserNotification ?? true,
      soundNotification: draft.soundNotification ?? false,
      fallbackNotificationText:
        draft.fallbackNotificationText ?? "New message from support",
      inquiryOptions:
        draft.inquiryOptions && draft.inquiryOptions.length > 0
          ? draft.inquiryOptions
          : [...def.inquiryOptions],
      videoWelcomeOn: draft.videoWelcomeOn ?? false,
      welcomeMessage: draft.welcomeMessageBehavior ?? def.welcomeMessage,
      autoOpenEnabled: draft.autoOpenEnabled ?? def.autoOpenEnabled,
      autoOpenDelaySeconds: draft.autoOpenDelaySeconds ?? def.autoOpenDelaySeconds,
      fileUploadEnabled: draft.fileUploadEnabled ?? def.fileUploadEnabled,
      emojiEnabled: draft.emojiEnabled ?? def.emojiEnabled,
      consentRequired: draft.consentRequired ?? def.consentRequired,
      consentText: draft.consentText ?? def.consentText,
      privacyPolicyUrl: draft.privacyPolicyUrl ?? def.privacyPolicyUrl,
      privacyNotice: draft.privacyNotice ?? def.privacyNotice,
      allowedDomainsText: draft.allowedDomainsText ?? def.allowedDomainsText,
    },
    session: {
      persistVisitorSession: draft.persistVisitorSession ?? def.persistVisitorSession,
      sessionTtlMinutes: draft.sessionTtlMinutes ?? def.sessionTtlMinutes,
    },
    form: {
      enabled: draft.formEnabled ?? def.formEnabled,
      title: draft.formTitle ?? def.formTitle,
      subtitle: draft.formSubtitle ?? def.formSubtitle,
      submitLabel: draft.formSubmitLabel ?? def.formSubmitLabel,
      prechatNameEnabled: draft.prechatNameEnabled ?? def.prechatNameEnabled,
      prechatEmailEnabled: draft.prechatEmailEnabled ?? def.prechatEmailEnabled,
      prechatPhoneEnabled: draft.prechatPhoneEnabled ?? def.prechatPhoneEnabled,
      prechatMessageEnabled: draft.prechatMessageEnabled ?? def.prechatMessageEnabled,
      prechatMessageRequired: draft.prechatMessageRequired ?? def.prechatMessageRequired,
      fields: prechatDraftFieldsAsFormPayload(draft),
    },
    response: {
      welcomeMessage: draft.responseWelcomeMessage ?? def.responseWelcomeMessage,
      offlineMessage: draft.responseOfflineMessage ?? def.responseOfflineMessage,
      greetingMessage: draft.responseGreetingMessage ?? def.responseGreetingMessage,
      sendPlaceholder: draft.responseSendPlaceholder ?? def.responseSendPlaceholder,
      aiPromptHint: draft.responseAiPromptHint ?? def.responseAiPromptHint,
      agentHandoverEnabled: draft.responseAgentHandoverEnabled ?? def.responseAgentHandoverEnabled,
      handoverTriggerText: draft.responseHandoverTriggerText ?? def.responseHandoverTriggerText,
    },
  };
  if (draft.allowedDomains?.length) config.allowedDomains = draft.allowedDomains;
  return config;
}

/**
 * Chat pre-chat fields from wizard toggles (notifications step).
 * Maps to `config.form.fields` for embed `extractPrechatFieldsFromWidgetConfig`.
 */
export function prechatDraftFieldsAsFormPayload(draft: WidgetDraft): JsonRecord[] {
  const def = CHAT_WIZARD_PATCH_DEFAULTS;
  const nameOn = draft.prechatNameEnabled ?? def.prechatNameEnabled;
  const emailOn = draft.prechatEmailEnabled ?? def.prechatEmailEnabled;
  const phoneOn = draft.prechatPhoneEnabled ?? def.prechatPhoneEnabled;
  const messageOn = draft.prechatMessageEnabled ?? def.prechatMessageEnabled;
  const messageRequired = draft.prechatMessageRequired ?? def.prechatMessageRequired;

  const fields: JsonRecord[] = [];
  if (nameOn) {
    fields.push({
      key: "name",
      label: "Name",
      fieldType: "text",
      type: "text",
      required: true,
      options: [],
    });
  }
  if (emailOn) {
    fields.push({
      key: "email",
      label: "Email",
      fieldType: "email",
      type: "email",
      required: false,
      options: [],
    });
  }
  if (phoneOn) {
    fields.push({
      key: "phone",
      label: "Phone",
      fieldType: "phone",
      type: "phone",
      required: false,
      options: [],
    });
  }
  if (messageOn) {
    fields.push({
      key: "message",
      label: "Message",
      fieldType: "textarea",
      type: "textarea",
      required: messageRequired,
      options: [],
    });
  }
  return fields;
}

/** Text-us field list goes under PATCH `config.form.fields`; use `type` for runtime pre-chat resolver. */
export function textUsDraftFieldsAsFormPayload(draft: WidgetDraft): JsonRecord[] {
  const fallback: TextUsFormFieldDraft[] = defaultTextUsFormFields().map((j) => ({
    key: String(j.key),
    label: typeof j.label === "string" ? j.label : String(j.key),
    fieldType: String(j.fieldType ?? "text"),
    required: Boolean(j.required),
  }));
  const source =
    draft.textUsFormFields && draft.textUsFormFields.length > 0
      ? draft.textUsFormFields
      : fallback;
  return source.map((f) => ({
    key: String(f.key),
    label: String(f.label ?? f.key),
    required: Boolean(f.required),
    type: String(f.fieldType ?? "text").toLowerCase(),
  }));
}

/**
 * First wizard step — draft only (`publishNow: false`).
 * Use **only** fields allowed by `InstallTokenDto` on POST /widgets/installations (strict whitelist).
 * TEXT_US / CHAT / BOTH: nested theme/ui/textUsFormConfig are merged on later PATCH steps, not here.
 */
export function buildMinimalWidgetInstallationBody(input: {
  websiteId: string;
  widgetType: WidgetTypeApi;
  publishNow?: boolean;
}): JsonRecord {
  return {
    websiteId: input.websiteId.trim(),
    widgetType: input.widgetType,
    publishNow: input.publishNow ?? false,
  };
}

/**
 * Builds full `POST /widgets/installations`-style merged config OR PATCH `config` pieces
 * (InstallTokenDto: theme, ui, behavior, session, form, response — not legacy `settingsJson`).
 */
export function buildWidgetInstallationPayload(input: {
  websiteId: string;
  widgetType: WidgetTypeApi;
  draft: WidgetDraft;
  publishNow?: boolean;
  assetUrls?: WidgetInstallationAssetUrls;
}): JsonRecord {
  const { websiteId, widgetType, draft, publishNow = true, assetUrls } = input;

  const chatMode = (draft.chatMode ?? "HYBRID") as WidgetChatModeApi;

  const themeDesign: JsonRecord = {};

  if (widgetType === "CHAT" || widgetType === "BOTH") {
    themeDesign.chat = buildChatDesignJsonFromDraft(draft, assetUrls);
  }

  if (widgetType === "TEXT_US" || widgetType === "BOTH") {
    themeDesign.textUs = {
      buttonColor: draft.textUsButtonColor ?? "#da9b2f",
      position: draft.textUsPosition ?? "center",
      headerTitle: draft.textUsHeaderTitle ?? "Special Offer",
      welcomeMessage: draft.textUsWelcomeMessage ?? "",
    };
  }

  const body: JsonRecord = {
    websiteId,
    widgetType,
    publishNow,
    theme: { designJson: themeDesign },
    ui: themeDesign,
    behavior: {},
    form: {},
    response: {},
  };

  if (widgetType === "CHAT" || widgetType === "BOTH") {
    body.chatMode = chatMode;
  }

  if (draft.allowedDomains?.length) {
    body.allowedDomains = draft.allowedDomains;
  }

  if (widgetType === "TEXT_US" || widgetType === "BOTH") {
    body.textUsFormConfig = {
      fields: draft.textUsFormFields?.length
        ? draft.textUsFormFields
        : defaultTextUsFormFields(),
    };
  }

  return body;
}

/** Add-widget CHAT flow: PATCH `config` in three slices (~theme / ~ui+chatBox / ~routing+behavior+session+form+response). */
export type ChatWidgetWizardPatchScope =
  /** Step 1: `theme` (+ `designJson.chat` launcher only). */
  | "launcher_only"
  /** Step 2: `theme.designJson.chat` (chatBox + header text color) + `config.ui`. */
  | "chat_surface"
  /** Step 3: `chatMode`, `allowedDomains`, `behavior`, `session`, `form`, `response`. */
  | "notifications_only";

/**
 * Body for `PATCH /widgets/:widgetKey` — `UpdateWidgetConfigurationDto`:
 * merges config like InstallTokenDto without websiteId/publishNow (widgetType optional top-level).
 */
export function buildWidgetPatchConfigurationBody(input: {
  draft: WidgetDraft;
  widgetType: WidgetTypeApi;
  publishNow: boolean;
  assetUrls?: WidgetInstallationAssetUrls;
  embedAllowAnyOrigin?: boolean;
  /** When set for `CHAT`, PATCH body is trimmed to that wizard step (ignored for TEXT_US / BOTH). */
  chatWizardPatchScope?: ChatWidgetWizardPatchScope;
}): JsonRecord {
  const { draft, widgetType, publishNow, assetUrls, embedAllowAnyOrigin } =
    input;

  const wid = draft.websiteId?.trim();
  if (!wid) {
    throw new Error(
      "Widget draft is missing websiteId; complete the website step first.",
    );
  }

  if (widgetType === "CHAT" && input.chatWizardPatchScope === "launcher_only") {
    const body: JsonRecord = {
      publishNow,
      widgetType,
      config: buildChatWizardStep1Config(draft, assetUrls),
    };
    if (embedAllowAnyOrigin !== undefined)
      body.embedAllowAnyOrigin = embedAllowAnyOrigin;
    return body;
  }

  if (widgetType === "CHAT" && input.chatWizardPatchScope === "chat_surface") {
    const body: JsonRecord = {
      publishNow,
      widgetType,
      config: buildChatWizardStep2Config(draft, assetUrls),
    };
    if (embedAllowAnyOrigin !== undefined)
      body.embedAllowAnyOrigin = embedAllowAnyOrigin;
    return body;
  }

  if (widgetType === "CHAT" && input.chatWizardPatchScope === "notifications_only") {
    const body: JsonRecord = {
      publishNow,
      widgetType,
      config: buildChatWizardStep3Config(draft),
    };
    if (embedAllowAnyOrigin !== undefined)
      body.embedAllowAnyOrigin = embedAllowAnyOrigin;
    return body;
  }

  const install = buildWidgetInstallationPayload({
    websiteId: wid,
    widgetType,
    draft,
    publishNow,
    assetUrls,
  });

  const theme = install.theme;

  /**
   * PATCH `config.ui` whitelist does not allow surface mirrors (`chat`, `textUs`).
   * Chat / Text-us visuals belong under `theme.designJson` only (same pattern as `ui.textUs` rejection).
   */
  const uiForPatch: JsonRecord = {};

  const baseForm =
    typeof install.form === "object" && install.form !== null && !Array.isArray(install.form)
      ? ({ ...(install.form as JsonRecord) } as JsonRecord)
      : ({} as JsonRecord);

  if (widgetType === "TEXT_US" || widgetType === "BOTH") {
    baseForm.fields = textUsDraftFieldsAsFormPayload(draft);
  }

  const config: JsonRecord = {};
  if (theme !== undefined) config.theme = theme;
  config.ui = uiForPatch;
  config.behavior =
    typeof install.behavior === "object" && install.behavior !== null ? install.behavior : {};
  config.session = {};
  config.form = baseForm;
  config.response =
    typeof install.response === "object" && install.response !== null ? install.response : {};

  if (widgetType === "CHAT" || widgetType === "BOTH") {
    config.chatMode = install.chatMode;
  }

  if (install.allowedDomains !== undefined)
    config.allowedDomains = install.allowedDomains;

  /** Publish / full PATCH: wizard step payloads are not in `install`; merge from draft (same builders as steps 1–3). */
  if (widgetType === "CHAT") {
    const step3cfg = buildChatWizardStep3Config(draft);
    config.behavior = step3cfg.behavior as JsonRecord;
    config.session = step3cfg.session as JsonRecord;
    config.form = step3cfg.form as JsonRecord;
    config.response = step3cfg.response as JsonRecord;
    if (step3cfg.chatMode !== undefined) config.chatMode = step3cfg.chatMode;
    if (Array.isArray(step3cfg.allowedDomains) && step3cfg.allowedDomains.length > 0) {
      config.allowedDomains = step3cfg.allowedDomains;
    }
    const step2cfg = buildChatWizardStep2Config(draft, assetUrls);
    if (step2cfg.ui && typeof step2cfg.ui === "object") {
      config.ui = step2cfg.ui as JsonRecord;
    }
    const step1cfg = buildChatWizardStep1Config(draft, assetUrls);
    const t1 = step1cfg.theme;
    if (t1 && typeof t1 === "object" && config.theme && typeof config.theme === "object") {
      const cur = config.theme as JsonRecord;
      const { designJson: _step1Dj, ...themeScalars } = t1 as JsonRecord;
      Object.assign(cur, themeScalars);
    }
  }

  const body: JsonRecord = {
    publishNow,
    config,
    widgetType,
  };

  if (embedAllowAnyOrigin !== undefined)
    body.embedAllowAnyOrigin = embedAllowAnyOrigin;

  return body;
}
