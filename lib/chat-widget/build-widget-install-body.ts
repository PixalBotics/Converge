import type { JsonRecord } from "@/api/types/common.types";
import type {
  WidgetChatModeApi,
  WidgetTypeApi,
} from "@/api/types/widgets.types";
import { buildChatColorsFromWidgetDraft } from "./widget-colors-draft";
import { CHAT_WIZARD_PATCH_DEFAULTS } from "./chat-wizard-patch-defaults";
import type { TextUsFormFieldDraft, WidgetDraft } from "./widgetDraft";
import { applyAiTypeToWidgetConfig } from "./widget-ai-type";
import { normalizeWidgetInquiryOptions } from "./widget-inquiry.types";

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

/**
 * Whitelisted `theme.designJson.chat.chatBox` only (backend rejects headerAlign,
 * greetingMessage, bannerMediaType — those live on `config.ui` via buildChatShellUiFromDraft).
 */
function buildChatBoxPayloadFromDraft(
  draft: WidgetDraft,
  assetUrls?: WidgetInstallationAssetUrls,
): JsonRecord {
  const chatBox: JsonRecord = {
    headerTitle: draft.headerTitle,
    sendPlaceholder: draft.sendPlaceholder,
    boxWidth: draft.boxWidth,
    boxHeight: draft.boxHeight,
    bannerEnabled: draft.bannerOn,
    bannerTitle: draft.bannerTitle,
    bannerDescription: draft.bannerDescription,
  };

  if (assetUrls?.bannerImagePublicUrl) chatBox.bannerImageUrl = assetUrls.bannerImagePublicUrl;
  if (assetUrls?.bannerVideoPublicUrl) chatBox.bannerVideoUrl = assetUrls.bannerVideoPublicUrl;

  return chatBox;
}

function resolvePanelBackground(draft: WidgetDraft): string {
  const def = CHAT_WIZARD_PATCH_DEFAULTS;
  return draft.backgroundColor?.trim() || def.backgroundColor;
}

/** `theme.designJson.theme` — synced with `chat.colors.panelBackground` + `config.ui.backgroundColor`. */
export function buildDesignJsonThemeTokensFromDraft(draft: WidgetDraft): JsonRecord {
  const panel = resolvePanelBackground(draft);
  const def = CHAT_WIZARD_PATCH_DEFAULTS;
  return {
    textColor: draft.textColor?.trim() || "#0f172a",
    secondaryColor: draft.themeSecondaryColor?.trim() || def.themeSecondaryColor,
    panelBackground: panel,
    iconColor: draft.iconColor?.trim() || "#ffffff",
  };
}

type DesignJsonPatchScope = "launcher_only" | "chat_surface" | "full";

/**
 * Partial `theme.designJson` per wizard step (backend deep-merges colors / chatBox / theme / ui).
 */
export function buildDesignJsonPatchFromDraft(
  draft: WidgetDraft,
  scope: DesignJsonPatchScope,
  assetUrls?: WidgetInstallationAssetUrls,
): JsonRecord {
  const panel = resolvePanelBackground(draft);
  const chat: JsonRecord = {
    colors: buildChatColorsFromWidgetDraft(draft),
  };
  if (scope === "chat_surface" || scope === "full") {
    chat.chatBox = buildChatBoxPayloadFromDraft(draft, assetUrls);
  }
  return {
    chat,
    theme: buildDesignJsonThemeTokensFromDraft(draft),
    ui: { backgroundColor: panel },
  };
}

/** `theme.designJson.chat` block (colors + optional chatBox). */
export function buildChatDesignJsonFromDraft(
  draft: WidgetDraft,
  assetUrls?: WidgetInstallationAssetUrls,
): JsonRecord {
  const patch = buildDesignJsonPatchFromDraft(draft, "full", assetUrls);
  const chat = patch.chat;
  return chat && typeof chat === "object" && !Array.isArray(chat) ? (chat as JsonRecord) : {};
}

function buildThemeScalarsFromDraft(draft: WidgetDraft): JsonRecord {
  const def = CHAT_WIZARD_PATCH_DEFAULTS;
  const primary = draft.themePrimaryColor ?? draft.buttonColor ?? "#2563eb";
  return {
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
  };
}

/** Launcher FAB fields allowed under PATCH `config.ui` (not `designJson.chat.launcher`). */
export function buildLauncherUiFromDraft(
  draft: WidgetDraft,
  assetUrls?: WidgetInstallationAssetUrls,
): JsonRecord {
  const ui: JsonRecord = {
    buttonShape: draft.buttonShape,
    buttonPosition: draft.buttonPosition,
    launcherInsetBottomPx: draft.launcherInsetBottomPx,
    launcherInsetSidePx: draft.launcherInsetSidePx,
    launcherIconPreset: draft.launcherIconPreset || "phosphor-chat-dots",
    buttonHoverColor: draft.buttonHoverColor,
  };
  if (assetUrls?.buttonIconPublicUrl) ui.buttonIconUrl = assetUrls.buttonIconPublicUrl;
  return ui;
}

/** Wizard step 2 (chat box UI): only `chatBox` — launcher + FAB `colors` were sent in step 1. */
export function buildChatBoxOnlyDesignJson(
  draft: WidgetDraft,
  assetUrls?: WidgetInstallationAssetUrls,
): JsonRecord {
  return { chatBox: buildChatBoxPayloadFromDraft(draft, assetUrls) };
}

/** `config.ui` chat shell + launcher (includes `backgroundColor` for panel sync). */
export function buildChatShellUiFromDraft(
  draft: WidgetDraft,
  assetUrls?: WidgetInstallationAssetUrls,
): JsonRecord {
  const def = CHAT_WIZARD_PATCH_DEFAULTS;
  const headerAlign = (draft.headerTitleAlign ?? "Center").toLowerCase();
  const panel = resolvePanelBackground(draft);
  const ui: JsonRecord = {
    ...buildLauncherUiFromDraft(draft, assetUrls),
    buttonLabel: draft.buttonLabel ?? def.buttonLabel,
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
    backgroundColor: panel,
    boxWidth: draft.boxWidth,
    boxHeight: draft.boxHeight,
    width: draft.boxWidth,
    height: draft.boxHeight,
    popupEnabled: draft.popupEnabled ?? def.popupEnabled,
  };
  if (assetUrls?.bannerImagePublicUrl) ui.bannerImageUrl = assetUrls.bannerImagePublicUrl;
  if (assetUrls?.bannerVideoPublicUrl) ui.bannerVideoUrl = assetUrls.bannerVideoPublicUrl;
  return ui;
}

function themeButtonShapeForPatch(draft: WidgetDraft): string {
  if (draft.buttonShape === "rounded") return "rounded";
  if (draft.buttonShape === "square") return "square";
  return "circle";
}

/** Step 1 PATCH `config`: theme scalars + `designJson` (colors, theme tokens, ui.backgroundColor) + launcher `ui`. */
export function buildChatWizardStep1Config(
  draft: WidgetDraft,
  assetUrls?: WidgetInstallationAssetUrls,
): JsonRecord {
  const panel = resolvePanelBackground(draft);
  return {
    theme: {
      ...buildThemeScalarsFromDraft(draft),
      designJson: buildDesignJsonPatchFromDraft(draft, "launcher_only", assetUrls),
    },
    ui: {
      ...buildLauncherUiFromDraft(draft, assetUrls),
      backgroundColor: panel,
    },
  };
}

/** `behavior.inquiryOptions` for widget JSON (embed pills + inline routing ids). */
export function buildInquiryBehaviorPatchFromDraft(draft: WidgetDraft): JsonRecord {
  const inquiryOptions =
    draft.inquiryOn === false
      ? []
      : normalizeWidgetInquiryOptions(draft.inquiryOptions ?? []);
  return { behavior: { inquiryOptions } };
}

/** Step 2 PATCH `config`: chat surface + inquiry JSON. */
export function buildChatWizardStep2Config(
  draft: WidgetDraft,
  assetUrls?: WidgetInstallationAssetUrls,
): JsonRecord {
  return {
    ...buildInquiryBehaviorPatchFromDraft(draft),
    theme: {
      ...buildThemeScalarsFromDraft(draft),
      designJson: buildDesignJsonPatchFromDraft(draft, "chat_surface", assetUrls),
    },
    ui: buildChatShellUiFromDraft(draft, assetUrls),
  };
}

/** Merged CHAT config for final publish (all wizard steps). */
export function buildFullChatConfigFromDraft(
  draft: WidgetDraft,
  assetUrls?: WidgetInstallationAssetUrls,
): JsonRecord {
  const routing = buildChatWizardStep3Config(draft);
  return {
    ...routing,
    theme: {
      ...buildThemeScalarsFromDraft(draft),
      designJson: buildDesignJsonPatchFromDraft(draft, "full", assetUrls),
    },
    ui: buildChatShellUiFromDraft(draft, assetUrls),
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
        draft.inquiryOn === false
          ? []
          : normalizeWidgetInquiryOptions(draft.inquiryOptions ?? []),
      videoWelcomeOn: draft.videoWelcomeOn ?? false,
      videoWelcomeUrl: draft.videoWelcomeUrl?.trim() || undefined,
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
  applyAiTypeToWidgetConfig(config, draft);
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

  const themeDesign: JsonRecord =
    widgetType === "CHAT" || widgetType === "BOTH"
      ? buildDesignJsonPatchFromDraft(draft, "full", assetUrls)
      : {};

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
    theme:
      widgetType === "CHAT" || widgetType === "BOTH"
        ? { ...buildThemeScalarsFromDraft(draft), designJson: themeDesign }
        : { designJson: themeDesign },
    ui:
      widgetType === "CHAT" || widgetType === "BOTH"
        ? buildChatShellUiFromDraft(draft, assetUrls)
        : {},
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
  /** Step 1: `theme` scalars + `ui` launcher + `designJson.chat.colors`. */
  | "launcher_only"
  /** Step 2: `theme.designJson.chat` (chatBox + header text color) + `config.ui`. */
  | "chat_surface"
  /** Step 3: `chatMode`, `allowedDomains`, `behavior`, `session`, `form`, `response`. */
  | "notifications_only"
  /** Inquiry topics only: `behavior.inquiryOptions` (visitor-topics sync uses same helper). */
  | "inquiry_only";

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

  if (widgetType === "CHAT" && input.chatWizardPatchScope === "inquiry_only") {
    const body: JsonRecord = {
      publishNow,
      widgetType,
      config: buildInquiryBehaviorPatchFromDraft(draft),
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

  if (widgetType === "CHAT") {
    Object.assign(config, buildFullChatConfigFromDraft(draft, assetUrls));
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
