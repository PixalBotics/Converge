import type { JsonRecord } from "@/api/types/common.types";
import type {
  WidgetChatModeApi,
  WidgetTypeApi,
} from "@/api/types/widgets.types";
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
    const chatLauncher: JsonRecord = {
      shape: draft.buttonShape,
      position: draft.buttonPosition,
      insetBottomPx: draft.launcherInsetBottomPx,
      insetSidePx: draft.launcherInsetSidePx,
      iconPreset: draft.launcherIconPreset,
    };

    if (assetUrls?.buttonIconPublicUrl)
      chatLauncher.iconUrl = assetUrls.buttonIconPublicUrl;

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

    if (assetUrls?.bannerImagePublicUrl)
      chatBox.bannerImageUrl = assetUrls.bannerImagePublicUrl;
    if (assetUrls?.bannerVideoPublicUrl)
      chatBox.bannerVideoUrl = assetUrls.bannerVideoPublicUrl;

    themeDesign.chat = {
      launcher: chatLauncher,
      chatBox,
      colors: {
        button: draft.buttonColor,
        buttonHover: draft.buttonHoverColor,
        icon: draft.iconColor,
        headerText: draft.textColor,
      },
    };
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
}): JsonRecord {
  const { draft, widgetType, publishNow, assetUrls, embedAllowAnyOrigin } =
    input;

  const wid = draft.websiteId?.trim();
  if (!wid) {
    throw new Error(
      "Widget draft is missing websiteId; complete the website step first.",
    );
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

  const body: JsonRecord = {
    publishNow,
    config,
    widgetType,
  };

  if (embedAllowAnyOrigin !== undefined)
    body.embedAllowAnyOrigin = embedAllowAnyOrigin;

  return body;
}
