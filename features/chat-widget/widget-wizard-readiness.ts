import type { WidgetDraft } from "@/lib/chat-widget/widgetDraft";
import { defaultWidgetDraft } from "@/lib/chat-widget/widgetDraft";
import { normalizeWidgetInquiryOptions } from "@/lib/chat-widget/widget-inquiry.types";
import { isWidgetInquiryOptionConfigured } from "@/lib/chat-widget/visitor-topics.mapper";
import { isProactiveTeaserFeatureOn, resolveProactiveTeaser } from "@/lib/chat-widget/widget-feature-toggles";

export type WidgetWizardCheckItem = {
  id: string;
  label: string;
  detail?: string;
  ok: boolean;
};

export function buildWidgetWizardChecklist(draft: WidgetDraft): WidgetWizardCheckItem[] {
  const def = defaultWidgetDraft;
  const websiteOk = Boolean(draft.websiteId?.trim());
  const remoteOk = Boolean(draft.remoteWidgetKey?.trim() || draft.widgetId?.trim());
  const inquiry = normalizeWidgetInquiryOptions(draft.inquiryOptions ?? []);
  const inquiryConfigured = inquiry.some(isWidgetInquiryOptionConfigured);
  const domains = (draft.allowedDomains ?? [])
    .map((d) => d.trim())
    .filter(Boolean);
  const domainsText = (draft.allowedDomainsText ?? "").trim();
  const teaserResolved = resolveProactiveTeaser(draft);
  const panelGreeting = (draft.greetingMessage ?? "").trim();
  const chatWelcome = (draft.firstMessage ?? "").trim();

  return [
    {
      id: "website",
      label: "Website linked",
      detail: websiteOk ? draft.websiteId : "Pick a website on Add Widget",
      ok: websiteOk,
    },
    {
      id: "draft",
      label: "Server draft saved",
      detail: remoteOk ? draft.remoteWidgetKey ?? draft.widgetId : "Continue from Add Widget",
      ok: remoteOk,
    },
    {
      id: "launcher",
      label: "Launcher styling",
      detail: draft.buttonColor?.trim() ? `Color ${draft.buttonColor}` : "Set on Button step",
      ok: Boolean(draft.buttonColor?.trim()),
    },
    {
      id: "teaser",
      label: "Invitation bubble",
      detail: !isProactiveTeaserFeatureOn(draft)
        ? "Off (Button step)"
        : teaserResolved.active
          ? (teaserResolved.text || "CTA only").slice(0, 48)
          : "Enable + add message on Button step",
      ok: !isProactiveTeaserFeatureOn(draft) || teaserResolved.active,
    },
    {
      id: "panelGreeting",
      label: "Panel greeting",
      detail:
        draft.panelGreetingEnabled === false
          ? "Off (skip Continue step)"
          : panelGreeting
            ? "Continue step copy set"
            : "Add on Chat box step",
      ok: draft.panelGreetingEnabled === false || Boolean(panelGreeting),
    },
    {
      id: "chatWelcome",
      label: "Chat welcome",
      detail:
        draft.chatWelcomeEnabled === false
          ? "Off (no first bubble)"
          : chatWelcome
            ? "First chat bubble set"
            : "Add on Chat box step",
      ok: draft.chatWelcomeEnabled === false || Boolean(chatWelcome),
    },
    {
      id: "inquiry",
      label: "Inquiry topics",
      detail: draft.inquiryOn
        ? inquiryConfigured
          ? `${inquiry.length} topic(s) with departments`
          : "Enable topics on Notifications step + Save"
        : "Pills hidden (optional)",
      ok: !draft.inquiryOn || inquiryConfigured,
    },
    {
      id: "mode",
      label: "Chat mode",
      detail: draft.chatMode ?? "HYBRID",
      ok: Boolean(draft.chatMode?.trim()),
    },
    {
      id: "domains",
      label: "Embed domains",
      detail:
        domains.length > 0 || domainsText
          ? `${domains.length || "text list"} configured`
          : "Optional — restrict hosts",
      ok: true,
    },
    {
      id: "form",
      label: "Pre-chat form",
      detail: draft.formEnabled === false ? "Disabled" : "Enabled",
      ok: true,
    },
    {
      id: "video",
      label: "Video welcome",
      detail: draft.videoWelcomeOn
        ? draft.videoWelcomeUrl?.trim()
          ? "URL set"
          : "Enable + paste YouTube/Vimeo URL"
        : "Off (optional)",
      ok: !draft.videoWelcomeOn || Boolean(draft.videoWelcomeUrl?.trim()),
    },
    {
      id: "publish",
      label: "Published to production",
      detail: draft.completed
        ? "Install step completed — embed is live"
        : draft.requiresPublishBeforeEmbed
          ? "Unpublished draft on server — finish Install (publish)"
          : "Finish step 4 (Install) to publish and get embed code",
      ok: draft.completed === true,
    },
  ];
}

export function widgetWizardReadyToPublish(draft: WidgetDraft): boolean {
  const items = buildWidgetWizardChecklist(draft);
  const required = ["website", "draft", "mode", "panelGreeting", "chatWelcome"];
  return required.every((id) => items.find((i) => i.id === id)?.ok);
}
