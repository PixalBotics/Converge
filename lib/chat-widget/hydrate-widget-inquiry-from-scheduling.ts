import { fetchServiceScheduling } from "@/services/chat/service-scheduling.api";
import { widgetInquiryFromSchedulingBundle } from "@/lib/chat-widget/visitor-topics.mapper";
import type { WidgetInquiryOption } from "@/lib/chat-widget/widget-inquiry.types";

/** Load visitor topics saved under service scheduling for this website. */
export async function loadInquiryTopicsFromScheduling(
  websiteId: string,
): Promise<WidgetInquiryOption[]> {
  const id = websiteId.trim();
  if (!id) return [];
  try {
    const bundle = await fetchServiceScheduling(id);
    return widgetInquiryFromSchedulingBundle(bundle.topics);
  } catch {
    return [];
  }
}
