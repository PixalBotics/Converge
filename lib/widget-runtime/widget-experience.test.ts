import { describe, expect, it } from "vitest";
import {
  buildInquiryBehaviorPatchFields,
  configRecordFromEnvelope,
  hydrateExperienceInquiryFromBehavior,
  inquiryOptionsFromExperience,
  mergeDesignJsonWithExperienceSnapshot,
  parseWidgetExperienceV1,
} from "./widget-experience";

const billingOption = {
  label: "Billing",
  routingKey: "billing",
  serviceChannel: "internal" as const,
  internalDepartmentId: "7b5943bd-ab72-4ed3-9873-5c4bcf63f5c7",
  externalDepartmentId: "8d506d86-9f08-477c-b56b-410e27db870f",
  internalPoolId: null,
  externalPoolId: null,
};

describe("configRecordFromEnvelope", () => {
  it("maps header logo and launcher style from experience into ui and designJson", () => {
    const experience = {
      schemaVersion: 1,
      mode: "HYBRID",
      content: {
        headerTitle: "Support",
        greeting: "Hi",
        chatWelcome: "Hello",
        offline: "",
        sendPlaceholder: "Type…",
        buttonLabel: "Chat",
        proactiveTeaserEnabled: true,
        proactiveTeaser: "Need help?",
        proactiveTeaserAvatarEnabled: false,
        panelGreetingEnabled: true,
        chatWelcomeEnabled: true,
        proactiveTeaserAvatarUrl: "",
        proactiveSecondaryCtaEnabled: false,
        proactiveSecondaryCtaLabel: "",
        proactiveSecondaryCtaHref: "",
        proactiveSecondaryCtaKind: "",
        closedMessagePreviewEnabled: true,
      },
      design: {
        launcher: {
          style: "glass",
          position: "right",
          shape: "circle",
          insetBottomPx: 32,
          insetSidePx: 24,
        },
        panel: {
          headerLogoUrl: "https://cdn.example/logo.png",
          headerAlign: "center",
          backgroundColor: "#fff",
          width: 360,
          height: 480,
        },
        banner: { enabled: false, title: "", description: "" },
        videoWelcome: { enabled: false, url: "" },
        chatColors: {},
      },
      inquiry: { enabled: false, required: false, skipLabel: "General", topics: [], fallback: null },
      behavior: {},
      form: {},
      session: {},
    };
    const cfg = configRecordFromEnvelope({ experience: experience as never });
    const ui = cfg.ui as Record<string, unknown>;
    const dj = (cfg.theme as Record<string, unknown>).designJson as Record<string, unknown>;
    const chat = dj.chat as Record<string, unknown>;
    const chatBox = chat.chatBox as Record<string, unknown>;
    const djLauncher = chat.launcher as Record<string, unknown>;
    expect(ui.headerLogoUrl).toBe("https://cdn.example/logo.png");
    expect(ui.headerTitleAlign).toBe("center");
    expect(ui.launcherStyle).toBe("glass");
    expect(chatBox.headerLogoUrl).toBe("https://cdn.example/logo.png");
    expect(chatBox.headerAlign).toBe("center");
    expect(djLauncher.style).toBe("glass");
  });

  it("preserves theme.designJson.textUs from snapshot when API returns experience", () => {
    const experience = {
      schemaVersion: 1,
      mode: "HYBRID",
      content: {
        headerTitle: "Support",
        greeting: "Hi",
        chatWelcome: "Hello",
        offline: "",
        sendPlaceholder: "Type…",
        buttonLabel: "Chat",
        proactiveTeaserEnabled: false,
        proactiveTeaser: "",
        proactiveTeaserAvatarEnabled: false,
        panelGreetingEnabled: true,
        chatWelcomeEnabled: true,
        proactiveTeaserAvatarUrl: "",
        proactiveSecondaryCtaEnabled: false,
        proactiveSecondaryCtaLabel: "",
        proactiveSecondaryCtaHref: "",
        proactiveSecondaryCtaKind: "",
        closedMessagePreviewEnabled: true,
      },
      design: {
        launcher: {
          style: "solid",
          position: "right",
          shape: "circle",
          insetBottomPx: 28,
          insetSidePx: 28,
        },
        panel: {
          headerLogoUrl: "",
          headerAlign: "left",
          backgroundColor: "#fff",
          width: 360,
          height: 480,
        },
        banner: { enabled: false, title: "", description: "" },
        videoWelcome: { enabled: false, url: "" },
        chatColors: {},
      },
      inquiry: { enabled: false, required: false, skipLabel: "General", topics: [], fallback: null },
      behavior: {},
      form: {},
      session: {},
    };
    const cfg = configRecordFromEnvelope({
      experience: experience as never,
      themeDesignJson: {
        textUs: {
          buttonColor: "#1E63D5",
          buttonLabel: "Text us",
          headerTitle: "Text us",
        },
      },
      textUsFormConfig: {
        fields: [{ key: "phone", label: "Phone", type: "phone", required: true }],
      },
    });
    const dj = (cfg.theme as Record<string, unknown>).designJson as Record<string, unknown>;
    expect(dj.textUs).toMatchObject({ buttonLabel: "Text us" });
    expect(cfg.textUsFormConfig).toEqual({
      fields: [{ key: "phone", label: "Phone", type: "phone", required: true }],
    });
  });
});

describe("mergeDesignJsonWithExperienceSnapshot", () => {
  it("keeps textUs block from snapshot", () => {
    const merged = mergeDesignJsonWithExperienceSnapshot(
      { chat: { colors: { primary: "#000" } } },
      { textUs: { buttonLabel: "Text us" }, accent: "blue" },
    );
    expect(merged.textUs).toEqual({ buttonLabel: "Text us" });
    expect(merged.accent).toBe("blue");
  });
});

describe("widget-experience inquiry", () => {
  it("builds behavior inquiry fields for widget PATCH", () => {
    const fields = buildInquiryBehaviorPatchFields({
      inquiryOn: true,
      inquiryOptions: [billingOption],
    });
    expect(fields.inquiryOptions).toHaveLength(1);
    expect(fields).not.toHaveProperty("inquiry");
  });

  it("hydrates empty experience.inquiry from behavior.inquiryOptions when enabled", () => {
    const raw = {
      schemaVersion: 1,
      mode: "HYBRID",
      content: {},
      design: { launcher: {}, panel: {}, banner: {}, videoWelcome: { enabled: false, url: "" } },
      inquiry: { enabled: true, required: false, skipLabel: "General question", topics: [] },
      behavior: { inquiryOptions: [billingOption] },
      form: {},
      session: {},
    };
    const parsed = parseWidgetExperienceV1(raw);
    expect(parsed?.inquiry.enabled).toBe(true);
    expect(parsed?.inquiry.topics).toHaveLength(1);
    expect(inquiryOptionsFromExperience(parsed)).toHaveLength(1);
  });

  it("does not hydrate inquiry from behavior when inquiry is disabled", () => {
    const raw = {
      schemaVersion: 1,
      mode: "HYBRID",
      content: {},
      design: { launcher: {}, panel: {}, banner: {}, videoWelcome: { enabled: false, url: "" } },
      inquiry: { enabled: false, required: false, skipLabel: "General question", topics: [] },
      behavior: { inquiryOptions: [billingOption] },
      form: {},
      session: {},
    };
    const parsed = parseWidgetExperienceV1(raw);
    expect(parsed?.inquiry.enabled).toBe(false);
    expect(inquiryOptionsFromExperience(parsed)).toHaveLength(0);
  });

  it("leaves populated inquiry topics unchanged", () => {
    const experience = hydrateExperienceInquiryFromBehavior({
      schemaVersion: 1,
      mode: "HYBRID",
      content: {
        headerTitle: "",
        greeting: "",
        chatWelcome: "",
        offline: "",
        sendPlaceholder: "",
        buttonLabel: "",
        proactiveTeaserEnabled: true,
        proactiveTeaser: "",
        proactiveTeaserAvatarEnabled: false,
        panelGreetingEnabled: true,
        chatWelcomeEnabled: true,
        proactiveTeaserAvatarUrl: "",
        proactiveSecondaryCtaEnabled: false,
        proactiveSecondaryCtaLabel: "",
        proactiveSecondaryCtaHref: "",
        proactiveSecondaryCtaKind: "",
      },
      design: {
        launcher: {},
        panel: {},
        banner: {},
        videoWelcome: { enabled: false, url: "" },
      },
      inquiry: {
        enabled: true,
        required: false,
        skipLabel: "General question",
        fallbackRoutingKey: null,
        topics: [
          {
            label: "Billing",
            routingKey: "billing",
            serviceChannel: "internal",
            departmentId: "dept-1",
            poolId: null,
          },
        ],
        fallback: null,
      },
      form: {},
      behavior: {},
      session: {},
    });
    expect(experience.inquiry.topics).toHaveLength(1);
  });
});
