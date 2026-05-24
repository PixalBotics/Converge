import type { WidgetDraft } from "@/lib/chat-widget/widgetDraft";
import { normalizeWidgetInquiryOptions } from "@/lib/chat-widget/widget-inquiry.types";

export type WidgetWizardCheckItem = {
  id: string;
  label: string;
  detail?: string;
  ok: boolean;
};

export function buildWidgetWizardChecklist(draft: WidgetDraft): WidgetWizardCheckItem[] {
  const websiteOk = Boolean(draft.websiteId?.trim());
  const remoteOk = Boolean(draft.remoteWidgetKey?.trim() || draft.widgetId?.trim());
  const inquiry = normalizeWidgetInquiryOptions(draft.inquiryOptions ?? []);
  const inquiryConfigured = inquiry.some(
    (t) =>
      t.label.trim() &&
      t.internalDepartmentId?.trim() &&
      t.externalDepartmentId?.trim(),
  );
  const domains = (draft.allowedDomains ?? [])
    .map((d) => d.trim())
    .filter(Boolean);
  const domainsText = (draft.allowedDomainsText ?? "").trim();

  return [
    {
      id: "website",
      label: "Website linked",
      detail: websiteOk ? draft.websiteId : "Pick a website on step 1",
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
      detail: draft.buttonColor?.trim() ? `Color ${draft.buttonColor}` : "Default colors",
      ok: Boolean(draft.buttonColor?.trim()),
    },
    {
      id: "panel",
      label: "Chat panel copy",
      detail: draft.firstMessage?.trim() || draft.greetingMessage?.trim() ? "Greeting set" : "Add first message",
      ok: Boolean(draft.firstMessage?.trim() || draft.greetingMessage?.trim()),
    },
    {
      id: "inquiry",
      label: "Inquiry topics",
      detail: draft.inquiryOn
        ? inquiryConfigured
          ? `${inquiry.length} topic(s) with departments`
          : "Enable topics on Chat Box step + Save"
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
      label: "Ready to publish",
      detail: draft.requiresPublishBeforeEmbed
        ? "Publish on Install step for live embed"
        : draft.completed
          ? "Published"
          : "Finish Install & Publish",
      ok: draft.completed === true || !draft.requiresPublishBeforeEmbed,
    },
  ];
}

export function widgetWizardReadyToPublish(draft: WidgetDraft): boolean {
  const items = buildWidgetWizardChecklist(draft);
  const required = ["website", "draft", "mode"];
  return required.every((id) => items.find((i) => i.id === id)?.ok);
}
