"use client";

import { useMemo } from "react";
import { useServiceSchedulingQuery } from "@/features/chat-settings/hooks/useServiceScheduling";
import { widgetInquiryFromSchedulingBundle } from "@/lib/chat-widget/visitor-topics.mapper";
import type { WidgetInquiryOption } from "@/lib/chat-widget/widget-inquiry.types";

/** Visitor topics from `website_visitor_topics` (service scheduling API). */
export function useInquiryTopicsForWebsite(
  websiteId: string | undefined,
  enabled: boolean,
) {
  const wid = websiteId?.trim() ?? "";
  const schedulingQuery = useServiceSchedulingQuery(wid, enabled && wid.length > 0);

  const topicsFromScheduling = useMemo((): WidgetInquiryOption[] => {
    if (!schedulingQuery.data) return [];
    return widgetInquiryFromSchedulingBundle(schedulingQuery.data.topics);
  }, [schedulingQuery.data]);

  return {
    topicsFromScheduling,
    schedulingQuery,
    isLoading: wid.length > 0 && (schedulingQuery.isLoading || schedulingQuery.isFetching),
    loadedFromScheduling: topicsFromScheduling.length > 0,
  };
}
