import { saveVisitorTopics } from "@/services/chat/service-scheduling.api";
import {
  validateVisitorTopicsForSave,
  widgetInquiryToTopicInput,
} from "@/lib/chat-widget/visitor-topics.mapper";
import type { WidgetInquiryOption } from "@/lib/chat-widget/widget-inquiry.types";
import type { WidgetDraft } from "@/lib/chat-widget/widgetDraft";
import { patchRemoteWidgetConfiguration } from "@/lib/chat-widget/widget-remote-sync";

/** `website_visitor_topics` — routing source of truth when rows are complete. */
export async function persistVisitorTopicsIfValid(
  websiteId: string | undefined,
  rows: WidgetInquiryOption[],
): Promise<boolean> {
  const wid = websiteId?.trim();
  if (!wid || rows.length === 0) return false;
  const err = validateVisitorTopicsForSave(rows);
  if (err) return false;
  await saveVisitorTopics(wid, { topics: rows.map(widgetInquiryToTopicInput) });
  return true;
}

/** PATCH `config.behavior.inquiryOptions` on the widget draft (embed JSON). */
export async function syncInquiryToWidgetJson(params: {
  widgetKey: string;
  draft: WidgetDraft;
  publishNow?: boolean;
}): Promise<void> {
  await patchRemoteWidgetConfiguration({
    widgetKey: params.widgetKey,
    widgetKind: "chat",
    draft: params.draft,
    publishNow: params.publishNow ?? false,
    chatWizardPatchScope: "inquiry_only",
  });
}
