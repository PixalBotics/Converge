import type { WidgetInquiryOption } from "@/lib/chat-widget/widget-inquiry.types";
import { toRuntimeInquiryOptions } from "@/lib/chat-widget/widget-inquiry.types";

export const WIDGET_EXPERIENCE_SCHEMA_VERSION = 1;

export type WidgetExperienceInquiryTopic = {
  label: string;
  routingKey: string;
  serviceChannel: "internal" | "external";
  departmentId: string | null;
  poolId: string | null;
};

export type WidgetExperienceV1 = {
  schemaVersion: number;
  mode: string;
  content: {
    headerTitle: string;
    greeting: string;
    chatWelcome: string;
    offline: string;
    sendPlaceholder: string;
    buttonLabel: string;
    proactiveTeaserEnabled: boolean;
    proactiveTeaser: string;
    proactiveTeaserAvatarEnabled: boolean;
    panelGreetingEnabled: boolean;
    chatWelcomeEnabled: boolean;
    proactiveTeaserAvatarUrl: string;
    proactiveSecondaryCtaEnabled: boolean;
    proactiveSecondaryCtaLabel: string;
    proactiveSecondaryCtaHref: string;
    proactiveSecondaryCtaKind: string;
  };
  design: {
    launcher: Record<string, unknown>;
    panel: Record<string, unknown>;
    banner: Record<string, unknown>;
    videoWelcome: { enabled: boolean; url: string };
    chatColors?: Record<string, unknown>;
    accent?: string;
    density?: string;
  };
  inquiry: {
    enabled: boolean;
    required: boolean;
    skipLabel: string;
    fallbackRoutingKey: string | null;
    topics: WidgetExperienceInquiryTopic[];
    fallback: WidgetExperienceInquiryTopic | null;
  };
  form: Record<string, unknown>;
  behavior: Record<string, unknown>;
  session: Record<string, unknown>;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

export function parseWidgetExperienceV1(raw: unknown): WidgetExperienceV1 | null {
  if (!isRecord(raw) || raw.schemaVersion !== WIDGET_EXPERIENCE_SCHEMA_VERSION) {
    return null;
  }
  const content = isRecord(raw.content) ? raw.content : {};
  const design = isRecord(raw.design) ? raw.design : {};
  const inquiry = isRecord(raw.inquiry) ? raw.inquiry : {};
  const topics = Array.isArray(inquiry.topics) ? inquiry.topics : [];
  const parsedTopics = topics
    .filter(isRecord)
    .map((t) => ({
      label: String(t.label ?? "").trim(),
      routingKey: String(t.routingKey ?? "").trim(),
      serviceChannel:
        String(t.serviceChannel ?? "internal").toLowerCase() === "external"
          ? ("external" as const)
          : ("internal" as const),
      departmentId:
        typeof t.departmentId === "string" && t.departmentId.trim()
          ? t.departmentId.trim()
          : null,
      poolId:
        typeof t.poolId === "string" && t.poolId.trim() ? t.poolId.trim() : null,
    }))
    .filter((t) => t.label && t.routingKey);

  const fallbackRaw = inquiry.fallback;
  const fallback =
    isRecord(fallbackRaw) && String(fallbackRaw.label ?? "").trim()
      ? {
          label: String(fallbackRaw.label).trim(),
          routingKey: String(fallbackRaw.routingKey ?? "").trim(),
          serviceChannel:
            String(fallbackRaw.serviceChannel ?? "internal").toLowerCase() ===
            "external"
              ? ("external" as const)
              : ("internal" as const),
          departmentId:
            typeof fallbackRaw.departmentId === "string"
              ? fallbackRaw.departmentId
              : null,
          poolId:
            typeof fallbackRaw.poolId === "string" ? fallbackRaw.poolId : null,
        }
      : null;

  return {
    schemaVersion: WIDGET_EXPERIENCE_SCHEMA_VERSION,
    mode: String(raw.mode ?? "HYBRID"),
    content: {
      headerTitle: String(content.headerTitle ?? ""),
      greeting: String(content.greeting ?? ""),
      chatWelcome: String(content.chatWelcome ?? ""),
      offline: String(content.offline ?? ""),
      sendPlaceholder: String(content.sendPlaceholder ?? ""),
      buttonLabel: String(content.buttonLabel ?? ""),
      proactiveTeaserEnabled: content.proactiveTeaserEnabled !== false,
      proactiveTeaser: String(content.proactiveTeaser ?? ""),
      proactiveTeaserAvatarEnabled: content.proactiveTeaserAvatarEnabled === true,
      panelGreetingEnabled: content.panelGreetingEnabled !== false,
      chatWelcomeEnabled: content.chatWelcomeEnabled !== false,
      proactiveTeaserAvatarUrl: String(content.proactiveTeaserAvatarUrl ?? ""),
      proactiveSecondaryCtaEnabled: content.proactiveSecondaryCtaEnabled === true,
      proactiveSecondaryCtaLabel: String(content.proactiveSecondaryCtaLabel ?? ""),
      proactiveSecondaryCtaHref: String(content.proactiveSecondaryCtaHref ?? ""),
      proactiveSecondaryCtaKind: String(content.proactiveSecondaryCtaKind ?? ""),
    },
    design: {
      launcher: isRecord(design.launcher) ? design.launcher : {},
      panel: isRecord(design.panel) ? design.panel : {},
      banner: isRecord(design.banner) ? design.banner : {},
      videoWelcome: {
        enabled: isRecord(design.videoWelcome) && design.videoWelcome.enabled === true,
        url: isRecord(design.videoWelcome)
          ? String(design.videoWelcome.url ?? "")
          : "",
      },
      chatColors: isRecord(design.chatColors) ? design.chatColors : {},
    },
    inquiry: {
      enabled: inquiry.enabled === true || parsedTopics.length > 0,
      required: inquiry.required === true && parsedTopics.length > 0,
      skipLabel: String(inquiry.skipLabel ?? "General question"),
      fallbackRoutingKey:
        typeof inquiry.fallbackRoutingKey === "string" &&
        inquiry.fallbackRoutingKey.trim()
          ? inquiry.fallbackRoutingKey.trim()
          : fallback?.routingKey ?? null,
      topics: parsedTopics,
      fallback,
    },
    form: isRecord(raw.form) ? raw.form : {},
    behavior: isRecord(raw.behavior) ? raw.behavior : {},
    session: isRecord(raw.session) ? raw.session : {},
  };
}

export function experienceTopicToWidgetInquiry(
  topic: WidgetExperienceInquiryTopic,
): WidgetInquiryOption {
  return {
    label: topic.label,
    routingKey: topic.routingKey,
    serviceChannel: topic.serviceChannel,
    internalDepartmentId:
      topic.serviceChannel === "internal" ? topic.departmentId : null,
    externalDepartmentId:
      topic.serviceChannel === "external" ? topic.departmentId : null,
    internalPoolId: topic.serviceChannel === "internal" ? topic.poolId : null,
    externalPoolId: topic.serviceChannel === "external" ? topic.poolId : null,
  };
}

/** Overlay compiled experience onto legacy config record for appearance mappers. */
export function applyExperienceToConfigRecord(
  config: Record<string, unknown>,
  experience: WidgetExperienceV1 | null,
): Record<string, unknown> {
  if (!experience) return config;

  const inquiryOptions = experience.inquiry.topics.map(experienceTopicToWidgetInquiry);
  const panel = experience.design.panel;
  const launcher = experience.design.launcher;
  const banner = experience.design.banner;

  return {
    ...config,
    mode: experience.mode,
    greetingMessage: experience.content.greeting,
    welcomeMessage: experience.content.chatWelcome,
    offlineMessage: experience.content.offline,
    ctaButtonText: experience.content.buttonLabel,
    _experience: experience,
    theme: {
      ...(isRecord(config.theme) ? config.theme : {}),
      primaryColor: launcher.primaryColor,
      secondaryColor: launcher.secondaryColor,
      textColor: launcher.textColor,
      fontFamily: launcher.fontFamily,
      position: launcher.position,
      buttonShape: launcher.shape,
    },
    ui: {
      ...(isRecord(config.ui) ? config.ui : {}),
      headerTitle: experience.content.headerTitle,
      greetingMessage: experience.content.greeting,
      firstMessage: experience.content.chatWelcome,
      sendPlaceholder: experience.content.sendPlaceholder,
      buttonLabel: experience.content.buttonLabel,
      proactiveTeaserEnabled: experience.content.proactiveTeaserEnabled,
      proactiveTeaser: experience.content.proactiveTeaser,
      proactiveTeaserAvatarEnabled: experience.content.proactiveTeaserAvatarEnabled,
      proactiveTeaserAvatarUrl: experience.content.proactiveTeaserAvatarUrl,
      panelGreetingEnabled: experience.content.panelGreetingEnabled,
      chatWelcomeEnabled: experience.content.chatWelcomeEnabled,
      proactiveSecondaryCtaEnabled: experience.content.proactiveSecondaryCtaEnabled,
      proactiveSecondaryCtaLabel: experience.content.proactiveSecondaryCtaLabel,
      proactiveSecondaryCtaHref: experience.content.proactiveSecondaryCtaHref,
      proactiveSecondaryCtaKind: experience.content.proactiveSecondaryCtaKind,
      launcherIconPreset: String(launcher.iconPreset ?? ""),
      buttonIconUrl: String(launcher.iconUrl ?? ""),
      buttonPosition: launcher.position,
      buttonShape: launcher.shape,
      launcherInsetBottomPx: launcher.insetBottomPx,
      launcherInsetSidePx: launcher.insetSidePx,
      backgroundColor: panel.backgroundColor,
      boxWidth: panel.width,
      boxHeight: panel.height,
      bannerOn: banner.enabled,
      bannerTitle: banner.title,
      bannerDescription: banner.description,
      bannerImageUrl: banner.imageUrl,
    },
    behavior: {
      ...(isRecord(config.behavior) ? config.behavior : {}),
      ...experience.behavior,
      inquiryOptions,
      inquiryRequired: experience.inquiry.required,
      inquirySkipLabel: experience.inquiry.skipLabel,
      inquiryFallbackRoutingKey: experience.inquiry.fallbackRoutingKey,
      videoWelcomeOn: experience.design.videoWelcome.enabled,
      videoWelcomeUrl: experience.design.videoWelcome.url,
    },
    form: {
      ...(isRecord(config.form) ? config.form : {}),
      ...experience.form,
    },
    response: {
      ...(isRecord(config.response) ? config.response : {}),
      welcomeMessage: experience.content.chatWelcome,
      offlineMessage: experience.content.offline,
      greetingMessage: experience.content.greeting,
      sendPlaceholder: experience.content.sendPlaceholder,
      agentHandoverEnabled: experience.behavior.agentHandoverEnabled,
      handoverTriggerText: experience.behavior.handoverTriggerText,
    },
    session: {
      ...(isRecord(config.session) ? config.session : {}),
      ...experience.session,
    },
  };
}

export function inquiryOptionsFromExperience(
  experience: WidgetExperienceV1 | null,
): ReturnType<typeof toRuntimeInquiryOptions> {
  if (!experience?.inquiry.enabled) return [];
  return toRuntimeInquiryOptions(
    experience.inquiry.topics.map(experienceTopicToWidgetInquiry),
  );
}

export function inquiryFallbackFromExperience(
  experience: WidgetExperienceV1 | null,
): ReturnType<typeof toRuntimeInquiryOptions>[number] | null {
  if (!experience?.inquiry.enabled) return null;
  const key = experience.inquiry.fallbackRoutingKey?.trim();
  if (key) {
    const match = experience.inquiry.topics.find((t) => t.routingKey === key);
    if (match) {
      return toRuntimeInquiryOptions([experienceTopicToWidgetInquiry(match)])[0] ?? null;
    }
  }
  if (!experience.inquiry.fallback) return null;
  const opt = experienceTopicToWidgetInquiry(experience.inquiry.fallback);
  return toRuntimeInquiryOptions([opt])[0] ?? null;
}

/** Rebuild `theme.designJson` from experience (single source for titles + colors). */
export function buildThemeDesignJsonFromExperience(
  experience: WidgetExperienceV1,
): Record<string, unknown> {
  const { content, design, behavior, form, session } = experience;
  const launcher = design.launcher;
  const panel = design.panel;
  const banner = design.banner;
  const colors = isRecord(design.chatColors) ? design.chatColors : {};

  const accent =
    typeof design.accent === "string" && design.accent.trim()
      ? design.accent.trim()
      : undefined;
  const density =
    typeof design.density === "string" && design.density.trim()
      ? design.density.trim()
      : undefined;

  return {
    ...(accent ? { accent } : {}),
    ...(density ? { density } : {}),
    ui: {
      headerTitle: content.headerTitle,
      greetingMessage: content.greeting,
      firstMessage: content.chatWelcome,
      sendPlaceholder: content.sendPlaceholder,
      buttonLabel: content.buttonLabel,
      backgroundColor: panel.backgroundColor,
      boxWidth: panel.width,
      boxHeight: panel.height,
      proactiveTeaser: content.proactiveTeaser,
      launcherIconPreset: launcher.iconPreset,
      buttonIconUrl: launcher.iconUrl,
      buttonPosition: launcher.position,
      bannerOn: banner.enabled,
      bannerTitle: banner.title,
      bannerDescription: banner.description,
      bannerImageUrl: banner.imageUrl,
    },
    chat: {
      colors,
      launcher: {
        position: launcher.position,
        shape: launcher.shape,
        iconPreset: launcher.iconPreset,
      },
      chatBox: {
        headerTitle: content.headerTitle,
        greetingMessage: content.greeting,
        firstMessage: content.chatWelcome,
        sendPlaceholder: content.sendPlaceholder,
        boxWidth: panel.width,
        boxHeight: panel.height,
        bannerEnabled: banner.enabled,
        bannerTitle: banner.title,
        bannerDescription: banner.description,
        bannerImageUrl: banner.imageUrl,
      },
    },
    behavior: {
      ...behavior,
      videoWelcomeOn: design.videoWelcome.enabled,
      videoWelcomeUrl: design.videoWelcome.url,
    },
    form,
    session,
  };
}

/** Build runtime config record when public API omits legacy `config` blob. */
export function configRecordFromEnvelope(
  envelope: {
    experience?: WidgetExperienceV1 | null;
    clientSettings?: Record<string, unknown>;
    themeDesignJson?: Record<string, unknown>;
    config?: Record<string, unknown>;
    chatMode?: string;
  },
): Record<string, unknown> {
  if (envelope.experience) {
    const cfg = applyExperienceToConfigRecord({}, envelope.experience);
    const prevTheme = isRecord(cfg.theme) ? cfg.theme : {};
    return {
      ...cfg,
      theme: {
        ...prevTheme,
        designJson: buildThemeDesignJsonFromExperience(envelope.experience),
      },
    };
  }
  const cs = envelope.clientSettings;
  if (isRecord(cs)) {
    return {
      mode: cs.mode ?? envelope.chatMode,
      ui: isRecord(cs.ui) ? cs.ui : {},
      theme: isRecord(cs.theme) ? cs.theme : {},
      behavior: isRecord(cs.behavior) ? cs.behavior : {},
      form: isRecord(cs.form) ? cs.form : {},
      response: isRecord(cs.response) ? cs.response : {},
      session: isRecord(cs.session) ? cs.session : {},
    };
  }
  return isRecord(envelope.config) ? envelope.config : {};
}
